// Subject curriculum seed data organized by board and grade

type SubjectMap = {
  [key: string]: string[];
};

const SUBJECTS_BY_BOARD_GRADE: SubjectMap = {
  // CBSE Curriculum
  'CBSE-6': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
  'CBSE-7': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
  'CBSE-8': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
  'CBSE-9': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
  'CBSE-10': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'],
  'CBSE-11': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Hindi', 'English', 'History', 'Geography', 'Economics'],
  'CBSE-12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Hindi', 'English', 'History', 'Geography', 'Economics'],

  // ICSE Curriculum
  'ICSE-6': ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi', 'Sanskrit'],
  'ICSE-7': ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi', 'Sanskrit'],
  'ICSE-8': ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi', 'Sanskrit'],
  'ICSE-9': ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi', 'Sanskrit'],
  'ICSE-10': ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi'],
  'ICSE-11': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics'],
  'ICSE-12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics'],

  // STATE_BOARD Curriculum (Generic State)
  'STATE_BOARD-6': ['Mathematics', 'Science', 'Social Science', 'English', 'Regional Language'],
  'STATE_BOARD-7': ['Mathematics', 'Science', 'Social Science', 'English', 'Regional Language'],
  'STATE_BOARD-8': ['Mathematics', 'Science', 'Social Science', 'English', 'Regional Language'],
  'STATE_BOARD-9': ['Mathematics', 'Science', 'Social Science', 'English', 'Regional Language'],
  'STATE_BOARD-10': ['Mathematics', 'Science', 'Social Science', 'English'],
  'STATE_BOARD-11': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography'],
  'STATE_BOARD-12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography'],

  // COMMON_CORE (US Standards)
  'COMMON_CORE-6': ['Mathematics', 'Science', 'English Language Arts', 'Social Studies'],
  'COMMON_CORE-7': ['Mathematics', 'Science', 'English Language Arts', 'Social Studies'],
  'COMMON_CORE-8': ['Mathematics', 'Science', 'English Language Arts', 'Social Studies'],
  'COMMON_CORE-9': ['Algebra I', 'Biology', 'English Language Arts', 'World History'],
  'COMMON_CORE-10': ['Geometry', 'Chemistry', 'English Language Arts', 'World History'],
  'COMMON_CORE-11': ['Algebra II', 'Physics', 'English Language Arts', 'US History'],
  'COMMON_CORE-12': ['Pre-Calculus', 'AP Biology', 'English Language Arts', 'US History'],
};

export function getSubjectsByBoardAndGrade(board: string, grade: number): string[] {
  const key = `${board}-${grade}`;
  return SUBJECTS_BY_BOARD_GRADE[key] || [];
}

export function getAllSubjectsForBoard(board: string): string[] {
  const subjects = new Set<string>();
  Object.entries(SUBJECTS_BY_BOARD_GRADE).forEach(([key, subjectList]) => {
    if (key.startsWith(board)) {
      subjectList.forEach((subject) => subjects.add(subject));
    }
  });
  return Array.from(subjects).sort();
}

export function isValidSubjectForBoardAndGrade(
  subject: string,
  board: string,
  grade: number
): boolean {
  const validSubjects = getSubjectsByBoardAndGrade(board, grade);
  return validSubjects.includes(subject);
}
