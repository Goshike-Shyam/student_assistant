import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from './prisma.js';
import { asyncHandler, AppError } from './middleware.js';
import { isValidSubjectForBoardAndGrade } from '../lib/subjects-seed.js';
import { generateContentWithRetry } from './utils.js';
import { logAiCredit } from '../lib/ai-credit-logger.js';
import { callGeminiWithRetry } from '../lib/ai-with-retry.js';
import { awardXP } from '../lib/gamification/xp.js';
import { updateLoginStreak } from '../lib/gamification/streak.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const router = Router();

// Helper function to force a pause (delay) in execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ========== HELPER FUNCTIONS ==========

/**
 * Format AI response as HTML with proper heading hierarchy
 * @param textContent - Raw text content from AI
 * @param subject - Optional subject for context
 * @returns Formatted HTML string
 */
const formatAIResponse = (textContent: string, subject?: string): string => {
  return `<h3>${subject ? `${subject}: ` : ''}Response to your question</h3>
  <div class="response-content">
    ${textContent.split('\n').map((line: string) => {
      if (line.trim().startsWith('#')) {
        const level = line.match(/^#+/)?.[0].length || 3;
        const text = line.replace(/^#+\s/, '');
        return `<h${level}>${text}</h${level}>`;
      }
      if (line.trim()) {
        return `<p>${line}</p>`;
      }
      return '';
    }).join('')}
  </div>`;
};

/**
 * Build curriculum context for the AI prompt
 * @param subject - Optional subject name
 * @returns Curriculum context string
 */
const buildCurriculumContext = (subject?: string): string => {
  return `You are an educational AI tutor designed to help students with their studies.
Subject: ${subject || 'General Knowledge'}
Educational Context: Provide responses appropriate for CBSE/ICSE curriculum.
Format: Provide educational, accurate responses with clear explanations.
Important: Always include educational value and cite sources where applicable.`;
};

type ResearchSource = {
  title: string;
  url: string;
  publisher?: string;
  type?: string;
};

function cleanJsonResponse(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

function normalizeSources(raw: unknown): ResearchSource[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item: any) => ({
      title: String(item?.title || 'Source'),
      url: String(item?.url || ''),
      publisher: item?.publisher ? String(item.publisher) : '',
      type: item?.type ? String(item.type) : 'website',
    }))
    .filter((source) => source.url.startsWith('http'));
}

function parseSourceMeta(meta: string): Omit<ResearchSource, 'url'> {
  try {
    const parsed = JSON.parse(meta);
    return {
      title: String(parsed?.title || 'Source'),
      publisher: parsed?.publisher ? String(parsed.publisher) : '',
      type: parsed?.type ? String(parsed.type) : 'website',
    };
  } catch {
    return {
      title: meta || 'Source',
      publisher: '',
      type: 'website',
    };
  }
}

router.use((req, _res, next) => {
  if (!process.env.DATABASE_URL) {
    return next(
      new AppError(
        503,
        'Database is not configured. Set DATABASE_URL and restart the server.',
      ),
    );
  }
  next();
});

// ========== USERS ROUTES ==========

router.post(
  '/users',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, name, password, role, grade, board, subjects } = req.body;

    if (!email || !name || !password) {
      throw new AppError(400, 'Email, name, and password are required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      throw new AppError(409, 'An account with this email already exists. Please sign in.');
    }

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name,
          password, // In production, hash the password
          role: role || 'STUDENT',
          grade: grade ? parseInt(String(grade).match(/\d+/)?.[0] || '10') : 10,
          curriculum: board || 'CBSE',
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppError(409, 'An account with this email already exists. Please sign in.');
      }
      throw error;
    }

    // If subjects are provided, create ChildSubject records
    if (Array.isArray(subjects) && subjects.length > 0) {
      for (const subject of subjects) {
        await prisma.childSubject.create({
          data: {
            childId: user.id,
            subjectName: subject,
          },
        });
      }
    }

    res.status(201).json(user);
  }),
);

// ========== AUTH ROUTES ==========

router.post(
  '/auth/signin',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        grade: true,
        curriculum: true,
        password: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Simple password comparison (in production, use bcrypt)
    if (user.password !== password) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    if (user.role === 'STUDENT') {
      updateLoginStreak(user.id).catch(() => {});
    }
    res.json({ user: userWithoutPassword });
  }),
);

router.get(
  '/users',
  asyncHandler(async (_req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  }),
);

// Get subjects for a specific user
router.get(
  '/users/:userId/subjects',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
      throw new AppError(400, 'User ID is required');
    }

    const childSubjects = await prisma.childSubject.findMany({
      where: { childId: userId },
      select: { subjectName: true },
      orderBy: { subjectName: 'asc' },
    });

    const subjects = childSubjects.map((cs) => cs.subjectName);
    res.json({ subjects, count: subjects.length });
  }),
);

router.get(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        enrollments: { include: { course: true } },
        submissions: true,
      },
    });

    if (!user) throw new AppError(404, 'User not found');
    res.json(user);
  }),
);

router.put(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, role } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      },
    });

    res.json(user);
  }),
);

router.delete(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.user.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  }),
);

// ========== COURSES ROUTES ==========

router.post(
  '/courses',
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description, code, instructorId } = req.body;

    if (!title || !code || !instructorId) {
      throw new AppError(400, 'Title, code, and instructorId are required');
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        code,
        instructorId,
      },
      include: { instructor: true },
    });

    res.status(201).json(course);
  }),
);

router.get(
  '/courses',
  asyncHandler(async (_req: Request, res: Response) => {
    const courses = await prisma.course.findMany({
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true, assignments: true } },
      },
    });
    res.json(courses);
  }),
);

router.get(
  '/courses/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        instructor: true,
        enrollments: { include: { user: true } },
        assignments: true,
      },
    });

    if (!course) throw new AppError(404, 'Course not found');
    res.json(course);
  }),
);

router.put(
  '/courses/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description } = req.body;

    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
      },
    });

    res.json(course);
  }),
);

router.delete(
  '/courses/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.course.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  }),
);

// ========== ENROLLMENT ROUTES ==========

router.post(
  '/enrollments',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      throw new AppError(400, 'userId and courseId are required');
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
      include: { user: true, course: true },
    });

    res.status(201).json(enrollment);
  }),
);

router.get(
  '/enrollments',
  asyncHandler(async (_req: Request, res: Response) => {
    const enrollments = await prisma.enrollment.findMany({
      include: { user: true, course: true },
    });
    res.json(enrollments);
  }),
);

router.delete(
  '/enrollments/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.enrollment.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  }),
);

// ========== ASSIGNMENTS ROUTES ==========

router.post(
  '/assignments',
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description, courseId, createdBy, dueDate } = req.body;

    if (!title || !courseId || !createdBy) {
      throw new AppError(400, 'Title, courseId, and createdBy are required');
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        courseId,
        createdBy,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { course: true, creator: true },
    });

    res.status(201).json(assignment);
  }),
);

router.get(
  '/assignments',
  asyncHandler(async (_req: Request, res: Response) => {
    const assignments = await prisma.assignment.findMany({
      include: {
        course: true,
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { submissions: true } },
      },
    });
    res.json(assignments);
  }),
);

router.get(
  '/assignments/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id },
      include: {
        course: true,
        creator: true,
        submissions: { include: { student: true } },
      },
    });

    if (!assignment) throw new AppError(404, 'Assignment not found');
    res.json(assignment);
  }),
);

router.put(
  '/assignments/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description, dueDate, status } = req.body;

    const assignment = await prisma.assignment.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status && { status }),
      },
    });

    res.json(assignment);
  }),
);

router.delete(
  '/assignments/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.assignment.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  }),
);

// Generate assignment using AI with curriculum validation
router.post(
  '/assignments/generate',
  /**
   * GENERATE CONTRACT — DO NOT CHANGE RESPONSE SHAPE
   * - Saves to DB (prisma.generatedAssignment.create) BEFORE returning response
   * - Returns FLAT camelCase: { assignmentId, totalMarks, estimatedMinutes, ... }
   * - correct_answer stripped before sending to client (stays in DB questionsJson)
   * - Client reads response.assignmentId and stores as assignment.id
   * - assignmentId is a UUID string (not numeric)
   */
  asyncHandler(async (req: Request, res: Response) => {
    const { child_id, subject, grade, board, topic, complexity } = req.body;

    // Validate required fields
    if (!child_id || !subject || !grade || !board || !topic || !complexity) {
      throw new AppError(400, 'Missing required fields');
    }

    // Validate subject matches curriculum
    if (!isValidSubjectForBoardAndGrade(subject, board, grade)) {
      throw new AppError(400, `Subject "${subject}" is not valid for ${board} Grade ${grade}`);
    }

    // Build prompt for LLM
    const prompt = `You are a ${board} curriculum teacher for Grade ${grade}.
Generate a ${complexity} assignment on "${topic}" for subject "${subject}".
Return ONLY valid JSON in this exact format, no markdown or extra text:
{
  "title": "Assignment Title",
  "topic": "${topic}",
  "instructions": "Clear instructions for the assignment",
  "questions": [
    {
      "id": 1,
      "type": "MCQ",
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "marks": 1,
      "correct_answer": "Option 1"
    }
  ],
  "total_marks": 20,
  "estimated_minutes": 45
}`;

    let assignmentData: any = null;
    let lastError = '';

    // Try 3 times to get valid JSON
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await generateContentWithRetry(prompt, 1, 0); // Single attempt per try
        const response = result.text;

        // Log AI credit usage (fire-and-forget)
        logAiCredit({
          userId: child_id,
          userRole: 'STUDENT',
          feature: 'ASSIGNMENT_GEN',
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
        }).catch(console.error);
        
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          lastError = 'No JSON found in response';
          continue;
        }

        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate structure
        if (parsed.title && parsed.topic && parsed.instructions && Array.isArray(parsed.questions)) {
          assignmentData = parsed;
          break;
        } else {
          lastError = 'Invalid structure in JSON';
          continue;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        if (attempt < 2) {
          await delay(1000 * (attempt + 1));
        }
      }
    }

    if (!assignmentData) {
      throw new AppError(503, `Failed to generate assignment. ${lastError}`);
    }

    // Calculate total marks
    const totalMarks = assignmentData.questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);

    // Save assignment to DB (stores correct answers server-side for grading)
    const savedAssignment = await prisma.generatedAssignment.create({
      data: {
        childId: child_id,
        subject,
        topic: assignmentData.topic,
        title: assignmentData.title,
        instructions: assignmentData.instructions,
        board,
        grade: typeof grade === 'string' ? parseInt(grade, 10) : grade,
        complexity,
        questionsJson: JSON.stringify(assignmentData.questions), // includes correct_answer
        totalMarks,
        estimatedMinutes: assignmentData.estimated_minutes,
      },
    });

    // Prepare response (strip correct answers for client)
    const clientQuestions = assignmentData.questions.map(({ correct_answer, ...rest }: any) => rest);

    res.status(201).json({
      assignmentId:     savedAssignment.id,
      title:            assignmentData.title,
      topic:            assignmentData.topic,
      instructions:     assignmentData.instructions,
      questions:        clientQuestions,
      totalMarks,
      estimatedMinutes: assignmentData.estimated_minutes,
    });
  }),
);

// ========== SUBMISSIONS ROUTES ==========

router.post(
  '/submissions',
  asyncHandler(async (req: Request, res: Response) => {
    const { assignmentId, studentId, contents } = req.body;

    if (!assignmentId || !studentId || !contents) {
      throw new AppError(
        400,
        'assignmentId, studentId, and contents are required',
      );
    }

    const submission = await prisma.submission.create({
      data: { assignmentId, studentId, contents },
      include: { assignment: true, student: true },
    });

    res.status(201).json(submission);
  }),
);

router.get(
  '/submissions',
  asyncHandler(async (_req: Request, res: Response) => {
    const submissions = await prisma.submission.findMany({
      include: {
        assignment: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });
    res.json(submissions);
  }),
);

router.get(
  '/submissions/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { assignment: true, student: true },
    });

    if (!submission) throw new AppError(404, 'Submission not found');
    res.json(submission);
  }),
);

router.put(
  '/submissions/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { contents, grade, feedback } = req.body;

    const submission = await prisma.submission.update({
      where: { id: req.params.id },
      data: {
        ...(contents && { contents }),
        ...(grade !== undefined && { grade }),
        ...(feedback && { feedback }),
        ...(grade !== undefined && { gradedAt: new Date() }),
      },
    });

    res.json(submission);
  }),
);

router.delete(
  '/submissions/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.submission.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  }),
);

// ========== SEARCH ROUTES ==========

// Create a new search query
router.post(
  '/search',
  asyncHandler(async (req: Request, res: Response) => {
    const { studentId, query, subject, voiceInput } = req.body;

    if (!query) {
      throw new AppError(400, 'Query is required');
    }

    let response = '';
    let summary = '';
    let keyConcepts: string[] = [];
    let sources: ResearchSource[] = [];

    let board = 'CBSE';
    let grade = '9';

    if (studentId) {
      const user = await prisma.user.findUnique({
        where: { id: String(studentId) },
        select: { grade: true, curriculum: true },
      });

      if (user?.grade) grade = String(user.grade);
      if (user?.curriculum) board = String(user.curriculum);
    }

    const prompt = `
You are a ${board} Grade ${grade} ${subject || 'General'} teacher.
Answer this student query: "${query}"

Provide a clear, grade-appropriate explanation.

Return ONLY valid JSON, no markdown:
{
  "response": "Your detailed explanation here",
  "summary": "One sentence summary",
  "sources": [
    {
      "title": "Source title",
      "url": "https://actual-url.com",
      "publisher": "Publisher name",
      "type": "article|textbook|video|website"
    }
  ],
  "key_concepts": ["concept1", "concept2"],
  "grade_note": "Why this is appropriate for Grade ${grade}"
}

Rules for sources:
- Include 2-4 real, verifiable sources only
- Sources must directly relate to "${query}"
- Prefer: Khan Academy, NCERT, BBC Bitesize, National Geographic, Britannica, Wikipedia
- For CBSE/ICSE: include ncert.nic.in when relevant
- NEVER invent URLs — only use real domains
- If unsure of exact URL, use the homepage domain e.g. https://www.khanacademy.org
`;

    try {
      const result = await callGeminiWithRetry(prompt, 2048);
      const parsed = JSON.parse(cleanJsonResponse(result.text));

      response = String(parsed?.response || '').trim();
      summary = String(parsed?.summary || '').trim();
      keyConcepts = Array.isArray(parsed?.key_concepts)
        ? parsed.key_concepts.map((concept: any) => String(concept))
        : [];
      sources = normalizeSources(parsed?.sources);

      if (!response) {
        throw new Error('Empty response in Gemini payload');
      }

      // Log AI credit usage (fire-and-forget)
      if (studentId) {
        const promptTokens = Math.ceil(prompt.length / 4);
        const completionTokens = Math.ceil(result.text.length / 4);
        logAiCredit({
          userId: String(studentId),
          userRole: 'STUDENT',
          feature: 'QUERY',
          promptTokens,
          completionTokens,
        }).catch(console.error);
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      response = `I could not fetch a complete research response right now for ${subject || 'this topic'}. Please try again in a moment.`;
      summary = 'Research service temporarily unavailable.';
      keyConcepts = [];
      sources = [];
    }

    let queryId: string | null = null;

    // Save query and response if student ID is provided
    if (studentId) {
      const savedQuery = await prisma.searchQuery.create({
        data: {
          studentId: String(studentId),
          query,
          subject: subject || null,
          voiceInput: voiceInput || false,
        },
      });

      queryId = savedQuery.id;

      awardXP(String(studentId), 'RESEARCH_QUERY', savedQuery.id.toString()).catch(() => {});

      await prisma.searchResponse.create({
        data: {
          queryId: savedQuery.id,
          response,
          // Persist metadata in existing string[] columns without schema changes.
          resourceLinks: sources.map((source) => JSON.stringify({
            title: source.title,
            publisher: source.publisher || '',
            type: source.type || 'website',
          })),
          sourceLinks: sources.map((source) => source.url),
        },
      });
    }

    res.status(201).json({
      queryId,
      response,
      summary,
      sources,
      keyConcepts,
      message: 'Search completed successfully'
    });
  }),
);

// Get all search queries for a student
router.get(
  '/search/student/:studentId',
  asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;

    const searchQueries = await prisma.searchQuery.findMany({
      where: { studentId },
      include: {
        responses: true,
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(searchQueries);
  }),
);

// Get smart search history for a student (earlier searches)
router.get(
  '/search/history/:studentId',
  asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const { limit = '10', offset = '0' } = req.query;

    const searches = await prisma.searchQuery.findMany({
      where: { studentId },
      include: {
        responses: {
          select: {
            response: true,
            resourceLinks: true,
            sourceLinks: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const payload = searches.map((search) => {
      const latestResponse = search.responses[0];
      const responseText = latestResponse?.response || '';
      const sourceLinks = latestResponse?.sourceLinks || [];
      const metaLinks = latestResponse?.resourceLinks || [];

      const sources = sourceLinks.map((url, index) => {
        const meta = parseSourceMeta(metaLinks[index] || '');
        return {
          title: meta.title,
          url,
          publisher: meta.publisher,
          type: meta.type,
        };
      });

      return {
        id: search.id,
        query: search.query,
        subject: search.subject,
        response: responseText,
        sources,
        createdAt: search.createdAt,
      };
    });

    res.json(payload);
  }),
);

// Save search response and create conversation
router.post(
  '/search/response',
  asyncHandler(async (req: Request, res: Response) => {
    const { queryId, response, resourceLinks, sourceLinks } = req.body;

    if (!queryId || !response) {
      throw new AppError(400, 'queryId and response are required');
    }

    const searchResponse = await prisma.searchResponse.create({
      data: {
        queryId,
        response,
        resourceLinks: resourceLinks || [],
        sourceLinks: sourceLinks || [],
      },
    });

    res.status(201).json(searchResponse);
  }),
);

// Get conversation history
router.get(
  '/conversation/:queryId',
  asyncHandler(async (req: Request, res: Response) => {
    const { queryId } = req.params;

    const conversation = await prisma.conversationHistory.findFirst({
      where: { initialQueryId: queryId },
      include: {
        initialQuery: {
          include: {
            responses: true,
          },
        },
      },
    });

    if (!conversation) throw new AppError(404, 'Conversation not found');
    res.json(conversation);
  }),
);

// Add follow-up question to conversation
router.post(
  '/conversation/:queryId/followup',
  asyncHandler(async (req: Request, res: Response) => {
    const { queryId } = req.params;
    const { followUpQuestion } = req.body;

    if (!followUpQuestion) {
      throw new AppError(400, 'Follow-up question is required');
    }

    // Get or create conversation
    let conversation = await prisma.conversationHistory.findFirst({
      where: { initialQueryId: queryId },
    });

    if (!conversation) {
      const query = await prisma.searchQuery.findUnique({
        where: { id: queryId },
      });
      if (!query) throw new AppError(404, 'Query not found');

      conversation = await prisma.conversationHistory.create({
        data: {
          studentId: query.studentId,
          initialQueryId: queryId,
          followUpQueries: [followUpQuestion],
          conversationLog: JSON.stringify([
            { type: 'question', contents: query.query },
            { type: 'followup', contents: followUpQuestion }
          ]),
        },
      });
    } else {
      conversation = await prisma.conversationHistory.update({
        where: { id: conversation.id },
        data: {
          followUpQueries: {
            push: followUpQuestion,
          },
          conversationLog: conversation.conversationLog,
        },
      });
    }

    res.status(201).json(conversation);
  }),
);

// NOTE: Practice test endpoints temporarily disabled until Prisma types are generated on Linux (Vercel)
// These will be enabled after npx prisma generate succeeds
// - GET /api/practice-tests
// - GET /api/practice-tests/:testId  
// - GET /api/practice-tests/user/:userId
// - POST /api/practice-attempts

export default router;
