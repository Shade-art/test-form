-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "currentYear" TEXT NOT NULL,
    "preferredDepartment" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "github" TEXT,
    "linkedin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_email_key" ON "applications"("email");

-- CreateIndex
CREATE UNIQUE INDEX "applications_registrationNumber_key" ON "applications"("registrationNumber");
