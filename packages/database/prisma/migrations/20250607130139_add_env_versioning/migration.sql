-- CreateTable
CREATE TABLE "env_versions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "description" TEXT,
    "changes" JSONB,

    CONSTRAINT "env_versions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "env_versions" ADD CONSTRAINT "env_versions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "env_versions" ADD CONSTRAINT "env_versions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
