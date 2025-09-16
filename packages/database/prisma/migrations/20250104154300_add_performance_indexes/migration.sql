-- CreateIndex
CREATE INDEX "env_versions_projectId_createdAt_idx" ON "env_versions"("projectId", "createdAt" DESC);

-- CreateIndex  
CREATE INDEX "env_versions_createdBy_idx" ON "env_versions"("createdBy");

-- CreateIndex
CREATE INDEX "env_versions_branch_idx" ON "env_versions"("branch");

-- Add index for projects by user
CREATE INDEX "projects_userId_createdAt_idx" ON "projects"("userId", "createdAt" DESC);

-- Add index for project access queries
CREATE INDEX "project_access_userId_idx" ON "project_access"("userId");
