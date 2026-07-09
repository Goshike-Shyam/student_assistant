-- CreateTable
CREATE TABLE "ChildSubject" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "subjectName" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChildSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedAssignment" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "board" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "complexity" TEXT NOT NULL,
    "questionsJson" TEXT NOT NULL,
    "submittedAnswersJson" TEXT,
    "feedbackJson" TEXT,
    "score" DOUBLE PRECISION,
    "totalMarks" INTEGER NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChildSubject_childId_subjectName_key" ON "ChildSubject"("childId", "subjectName");

-- AddForeignKey
ALTER TABLE "ChildSubject" ADD CONSTRAINT "ChildSubject_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedAssignment" ADD CONSTRAINT "GeneratedAssignment_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
