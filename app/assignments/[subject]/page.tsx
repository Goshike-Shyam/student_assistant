'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/ui/site-header';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AssignmentResponse, ComplexityLevel } from '@/types/assignments';
import QuestionCard from '@/components/assignments/QuestionCard';
import AssignmentToolbar from '@/components/assignments/AssignmentToolbar';

export default function SubjectAssignmentPage() {
  const params = useParams();
  const subject = decodeURIComponent(params.subject as string);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [childData, setChildData] = useState<{
    childId: string;
    grade: number;
    board: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidatingSubject, setIsValidatingSubject] = useState(true);
  const [isSubjectValid, setIsSubjectValid] = useState(true);
  const [topic, setTopic] = useState('');
  const [complexity, setComplexity] = useState<ComplexityLevel>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unansweredCount, setUnansweredCount] = useState(0);

  // State for student answers
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    // Get auth data from localStorage
    const childId = localStorage.getItem('userId');
    const grade = localStorage.getItem('userGrade');
    const board = localStorage.getItem('userBoard');

    if (!childId || !grade || !board) {
      window.location.href = '/login';
      return;
    }

    setChildData({
      childId,
      grade: parseInt(grade, 10),
      board,
    });
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  // Validate that the subject is registered for this child
  useEffect(() => {
    if (!childData) return;

    const validateSubject = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/users/${childData.childId}/subjects`);
        if (response.ok) {
          const data = await response.json();
          const registeredSubjects = data.subjects || [];
          const subjectExists = registeredSubjects.includes(subject);
          setIsSubjectValid(subjectExists);
        } else {
          // On error, assume subject is valid (be permissive)
          setIsSubjectValid(true);
        }
      } catch (err) {
        // On error, assume subject is valid (be permissive)
        setIsSubjectValid(true);
      } finally {
        setIsValidatingSubject(false);
      }
    };

    validateSubject();
  }, [childData]);

  const handleGenerateAssignment = async () => {
    if (!topic.trim() || !childData) {
      setError('Please enter a topic');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/assignments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: childData.childId,
          subject,
          grade: childData.grade,
          board: childData.board,
          topic,
          complexity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate assignment');
      }

      const data = await response.json();
      setAssignment(data);
      setAnswers({}); // Reset answers for new assignment
      setUnansweredCount(data.questions.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: answer };
      // Count unanswered questions
      const total = assignment?.questions.length || 0;
      const answered = Object.values(updated).filter((a) => a?.trim()).length;
      setUnansweredCount(total - answered);
      return updated;
    });
  };

  if (isLoading || isValidatingSubject) {
    return null;
  }

  if (!isAuthenticated || !childData) {
    return null;
  }

  // Show friendly error if subject is not registered
  if (!isSubjectValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <SiteHeader />
        <div className="pt-24 px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center space-y-4">
              <h2 className="text-2xl font-bold text-amber-900">Subject Not Registered</h2>
              <p className="text-amber-800">
                You haven't registered <strong>{subject}</strong> as one of your subjects.
              </p>
              <Link
                href="/profile"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Your Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <SiteHeader />

      <div className="pt-24 px-6 pb-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">{subject}</h1>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                Grade {childData.grade}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {childData.board}
              </span>
            </div>
          </div>

          {/* Assignment Generation Controls */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Generate Assignment</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                placeholder="Enter a topic, e.g. Photosynthesis"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
              />

              <Select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as ComplexityLevel)}
                disabled={isGenerating}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Mixed">Mixed</option>
              </Select>

              <Button
                onClick={handleGenerateAssignment}
                disabled={isGenerating || !topic.trim()}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Assignment'}
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Assignment Display */}
          {assignment && (
            <div className="space-y-6">
              {/* Toolbar */}
              <AssignmentToolbar
                assignment={assignment}
                unansweredCount={unansweredCount}
                answers={answers}
              />

              {/* Assignment Content */}
              <div className="bg-white rounded-lg border border-slate-200 p-8 space-y-6">
                {/* Title and Meta */}
                <div className="border-b border-slate-200 pb-4 space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">{assignment.title}</h2>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">{assignment.total_marks} marks</span> •{' '}
                    <span className="font-semibold">{assignment.estimated_minutes} minutes</span>
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900">Instructions</h3>
                  <p className="text-slate-700 leading-relaxed">
                    {assignment.instructions}
                  </p>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {assignment.questions.map((question, idx) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      questionNumber={idx + 1}
                      answer={answers[question.id] || ''}
                      onAnswerChange={(answer) =>
                        handleAnswerChange(question.id, answer)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
