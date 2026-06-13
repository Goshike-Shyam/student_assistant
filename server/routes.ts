import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router, Request, Response } from 'express';
import prisma from './prisma';
import { asyncHandler, AppError } from './middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const router = Router();

router.use((req, _res, next) => {
  if (!process.env.DATABASE_URL || !prisma) {
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
    const { email, name, password, role } = req.body;

    if (!email || !name || !password) {
      throw new AppError(400, 'Email, name, and password are required');
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password, // In production, hash the password
        role: role || 'STUDENT',
      },
    });

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

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
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

// ========== SUBMISSIONS ROUTES ==========

router.post(
  '/submissions',
  asyncHandler(async (req: Request, res: Response) => {
    const { assignmentId, studentId, content } = req.body;

    if (!assignmentId || !studentId || !content) {
      throw new AppError(
        400,
        'assignmentId, studentId, and content are required',
      );
    }

    const submission = await prisma.submission.create({
      data: { assignmentId, studentId, content },
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
    const { content, grade, feedback } = req.body;

    const submission = await prisma.submission.update({
      where: { id: req.params.id },
      data: {
        ...(content && { content }),
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

export default router;
