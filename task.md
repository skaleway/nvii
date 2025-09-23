# Version Control System Implementation Tasks

## Overview

This document outlines all tasks required to implement a complete version control system for environment variables across the Nvii platform.

---

## 📊 **Database Layer (packages/database)**

### ✅ **Completed Tasks**

- [x] EnvVersion model schema
- [x] Project-EnvVersion relationship
- [x] User-EnvVersion relationship
- [x] Changes tracking (JSON field)

#### **Schema Enhancements**

- [x] Add `VersionTag` model for version tagging
- [x] Add `VersionBranch` model for branching support
- [x] Add `VersionAnalytics` model for usage tracking
- [x] Add indexes for version queries (createdAt, projectId)
- [x] Add soft delete support for versions

#### **Migration Tasks**

- [x] Create migration for version analytics table
- [x] Create migration for version tags table
- [x] Create migration for version branches table
- [x] Add database constraints for version integrity

#### **Database Utilities**

- [x] Create version query helpers in `packages/database/src/`
- [x] Add version validation functions
- [x] Create version cleanup utilities (old versions)
- [x] Add version statistics aggregation functions

### 🔄 **Pending Tasks**

---

## 🔧 **CLI Layer (packages/cli)**

### ✅ **Completed Tasks**

- [x] Basic CLI structure
- [x] Authentication commands (login, logout, whoami)
- [x] Project management (new, link, update)
- [x] Basic encryption utilities

#### **Core Version Control Commands**

- [ ] **Implement `pull.ts`** - Fetch and decrypt environment variables
  - [x] Read `.nvii` file for project configuration
  - [x] Fetch latest version from API
  - [x] Decrypt environment variables
  - [x] Handle conflicts with existing `.env`
  - [x] Write to `.env` file
  - [x] Show change summary

- [ ] **Implement `push.ts`** - Encrypt and upload environment variables
  - [x] Read `.env` file
  - [x] Encrypt environment variables
  - [x] Calculate changes from previous version
  - [x] Create new version via API
  - [x] Update project content
  - [x] Show change summary

- [ ] **Implement `history.ts`** - Show version history
  - [x] Fetch version history from API
  - [x] Display formatted version list
  - [x] Show change summaries
  - [x] Add filtering options (date, user, changes)

- [ ] **Implement `rollback.ts`** - Rollback to specific version
  - [x] List available versions
  - [x] Select version to rollback to
  - [x] Fetch and decrypt version
  - [x] Create new version with rollback description
  - [x] Update local `.env` file

#### **Missing Library Files**

- [ ] **Create `lib/version.ts`** - Version management utilities
  - [x] `fetchVersions(projectId: string): Promise<VersionInfo[]>`
  - [x] `createVersion(projectId: string, content: Record<string, string>, description?: string): Promise<VersionInfo>`
  - [x] `getVersion(versionId: string): Promise<VersionInfo>`
  - [x] `formatVersionHistory(versions: VersionInfo[]): string`
  - [x] `compareVersions(version1: Record<string, string>, version2: Record<string, string>): DiffResult`

- [ ] **Create `lib/conflict.ts`** - Conflict resolution utilities
  - [x] `detectConflicts(localEnv: Record<string, string>, remoteEnv: Record<string, string>): string[]`
  - [x] `resolveConflicts(localEnv: Record<string, string>, remoteEnv: Record<string, string>): Promise<ConflictResolution>`
  - [x] `mergeEnvironments(localEnv: Record<string, string>, remoteEnv: Record<string, string>, resolution: ConflictResolution): Record<string, string>`
  - [x] `promptConflictResolution(conflicts: string[]): Promise<ConflictResolution>`

- [ ] **Create `lib/diff.ts`** - Diff utilities
  - [x] `generateDiff(oldContent: Record<string, string>, newContent: Record<string, string>): DiffResult`
  - [x] `formatDiff(diff: DiffResult): string`
  - [x] `applyDiff(baseContent: Record<string, string>, diff: DiffResult): Record<string, string>`

- [ ] **Create `lib/encrypt.ts`** - Enhanced encryption utilities
  - [x] `encryptEnvValues(values: Record<string, string>, userId: string): Record<string, string>`
  - [x] `decryptEnvValues(encryptedValues: Record<string, string>, userId: string): Record<string, string>`
  - [x] `generateEncryptionKey(): string`
  - [x] `validateEncryptionKey(key: string): boolean`

#### **CLI Command Enhancements**

- [ ] **Add version flags to existing commands**
  - [x] `link --version <versionId>` - Link to specific version
  - [x] `update --version <versionId>` - Update to specific version
  - [x] `new --template <versionId>` - Create from template version
  - [x] `pull --version <versionId>` - Pull from a specific version
  - [x] `log --version <versionId> --username <userName> --date <logDate>` - Get log with specific details

- [ ] **Add version management commands**
  - [x] `nvii tag <versionId> <tagName>` - Tag a version
  - [x] `nvii tags` - List all tags
  - [x] `nvii branch <branchName> <baseVersionId>` - Create branch
  - [x] `nvii branches` - List branches
  - [x] `nvii merge <sourceVersionId> <targetVersionId>` - Merge versions

### 🔄 **Pending Tasks**

---

## 🌐 **Web Application Layer (apps/web)**

### ✅ **Completed Tasks**

- [x] Basic version API endpoints (GET, POST)
- [x] Automatic version creation on project update
- [x] Change detection and calculation
- [x] Version listing with user information

#### **API Endpoints Enhancement**

- [ ] **Create `api/projects/[userId]/[projectId]/versions/[versionId]/route.ts`**
  - [x] `GET` - Fetch specific version details
  - [x] `DELETE` - Delete specific version (with permissions)
  - [x] `PATCH` - Update version metadata (description, tags)

- [ ] **Create `api/projects/[userId]/[projectId]/versions/compare/route.ts`**
  - [x] `POST` - Compare two versions and return diff
  - [x] `GET` - Get comparison options (version list)

- [ ] **Create `api/projects/[userId]/[projectId]/versions/tags/route.ts`**
  - [x] `GET` - List all tags for project
  - [x] `POST` - Create new tag
  - [x] `DELETE` - Delete tag

- [ ] **Create `api/projects/[userId]/[projectId]/versions/branches/route.ts`**
  - [x] `GET` - List all branches
  - [x] `POST` - Create new branch
  - [x] `PATCH` - Update branch
  - [ ] `DELETE` - Delete branch

- [ ] **Enhance existing version endpoints**
  - [x] Add pagination to version listing
  - [x] Add filtering (date range, user, changes)
  - [x] Add sorting options
  - [x] Add version search functionality

#### **Web UI Components**

- [ ] **Create `components/version-history.tsx`**
  - [x] Version timeline component
  - [x] Version list with change summaries
  - [x] Version selection and comparison
  - [x] Version filtering and search

- [ ] **Create `components/version-diff.tsx`**
  - [x] Side-by-side diff view
  - [x] Inline diff view
  - [x] Change highlighting
  - [x] Diff export functionality

- [ ] **Create `components/version-actions.tsx`**
  - [x] Rollback button
  - [x] Tag creation
  - [x] Branch creation
  - [x] Version deletion

- [ ] **Create `components/version-analytics.tsx`**
  - [x] Change frequency chart
  - [x] Most changed variables
  - [x] User activity timeline
  - [x] Version usage statistics

#### **Web Pages**

- [ ] **Create `app/(after-auth)/projects/[projectId]/versions/page.tsx`**
  - [x] Version history page
  - [x] Version comparison tools
  - [x] Version management actions

- [ ] **Create `app/(after-auth)/projects/[projectId]/versions/[versionId]/page.tsx`**
  - [x] Individual version view
  - [x] Version details and metadata
  - [x] Version actions (rollback, tag, etc.)

- [ ] **Create `app/(after-auth)/projects/[projectId]/versions/compare/page.tsx`**
  - [x] Version comparison page
  - [x] Side-by-side diff view
  - [x] Merge functionality

#### **Web Utilities**

- [ ] **Create `lib/diff-helpers.ts`**
  - [x] `compareVersions(version1: Record<string, string>, version2: Record<string, string>): DiffResult`
  - [x] `generateDiffReport(diff: DiffResult): string`
  - [x] `formatVersionChanges(changes: VersionChanges): string`

- [ ] **Create `lib/version-helpers.ts`** (enhance existing)
  - [x] `getVersionAnalytics(projectId: string): Promise<VersionAnalytics>`
  - [x] `createVersionTag(versionId: string, tagName: string): Promise<VersionTag>`
  - [x] `mergeVersions(sourceVersionId: string, targetVersionId: string): Promise<VersionInfo>`

### 🔄 **Pending Tasks**

---

## 📦 **Env-Helpers Layer (packages/env-helpers)**

### ✅ **Completed Tasks**

- [x] Basic environment file utilities
- [x] API client utilities

### 🔄 **Pending Tasks**

#### **Version Control Utilities**

- [ ] **Create `src/diff/` directory**
  - [x] `diff-calculator.ts` - Calculate differences between versions
  - [x] `diff-formatter.ts` - Format diff output
  - [x] `diff-applier.ts` - Apply diff to environment

- [ ] **Create `src/version/` directory**
  - [ ] `version-parser.ts` - Parse version metadata
  - [ ] `version-validator.ts` - Validate version data
  - [ ] `version-formatter.ts` - Format version output

- [ ] **Create `src/conflict/` directory**
  - [ ] `conflict-detector.ts` - Detect conflicts between versions
  - [ ] `conflict-resolver.ts` - Resolve conflicts automatically/manually
  - [ ] `conflict-merger.ts` - Merge conflicting environments

#### **Enhanced Environment Utilities**

- [ ] **Enhance `src/helpers/`**
  - [ ] `env-version.ts` - Version-specific environment utilities
  - [ ] `env-merge.ts` - Environment merging utilities
  - [ ] `env-validate.ts` - Environment validation utilities

- [ ] **Create `src/types/version.ts`**
  - [x] `VersionInfo` interface
  - [x] `VersionChanges` interface
  - [x] `DiffResult` interface
  - [ ] `ConflictResolution` interface

#### **API Integration**

- [ ] **Enhance `src/helpers/api-client.ts`**
  - [x] Add version-specific API methods
  - [ ] Add version comparison methods
  - [x] Add version management methods

---

## 🔗 **Integration Tasks**

### **Cross-Component Integration**

- [ ] **CLI-Web Integration**
  - [x] Ensure CLI authentication works with web user system
  - [x] Sync CLI version operations with web UI
  - [x] Handle version conflicts between CLI and web

- [ ] **Database-API Integration**
  - [ ] Optimize version queries for performance
  - [ ] Add version caching layer
  - [ ] Implement version cleanup policies

- [ ] **Env-Helpers Integration**
  - [x] Use env-helpers in CLI commands
  - [x] Use env-helpers in web API endpoints
  - [x] Ensure consistent version handling across components

### **Testing Tasks**

- [ ] **Unit Tests**
  - [ ] Test version calculation functions
  - [ ] Test conflict resolution logic
  - [x] Test diff generation
  - [ ] Test encryption/decryption

- [ ] **Integration Tests**
  - [ ] Test CLI-API integration
  - [ ] Test web-database integration
  - [ ] Test version control workflows

- [ ] **End-to-End Tests**
  - [ ] Test complete version control workflow
  - [ ] Test conflict resolution scenarios
  - [ ] Test rollback functionality

### **Documentation Tasks**

- [ ] **API Documentation**
  - [ ] Document version control API endpoints
  - [ ] Document version control CLI commands
  - [ ] Document version control database schema

- [ ] **User Documentation**
  - [ ] CLI version control usage guide
  - [ ] Web UI version control guide
  - [ ] Version control best practices

---

## 🚀 **Deployment Tasks**

### **Database Migration**

- [ ] Create and test migration scripts
- [ ] Plan migration strategy for existing data
- [ ] Backup existing version data

### **Configuration**

- [ ] Update environment configuration for version control
- [ ] Configure version retention policies
- [ ] Set up version analytics tracking

### **Monitoring**

- [ ] Add version control metrics
- [ ] Monitor version storage usage
- [ ] Set up alerts for version-related issues

---

## 📋 **Task Priority**

### **High Priority (Phase 1)**

1. Implement `pull.ts` and `push.ts` CLI commands
2. Create missing CLI library files (`lib/version.ts`, `lib/conflict.ts`)
3. Enhance existing web API endpoints
4. Add basic version history UI components

### **Medium Priority (Phase 2)**

1. Add version comparison functionality
2. Implement rollback functionality
3. Add version tagging system
4. Create version analytics

### **Low Priority (Phase 3)**

1. Implement version branching
2. Add advanced diff visualization
3. Create bulk version operations
4. Add version export/import functionality
5. Update the cli logout to recieve flags such as username and email to logout the user without asking for them again. But make sure to confirm the logout manually and not do it with flags.

---

## 📊 **Progress Tracking**

- **Database Layer**: 80% Complete
- **CLI Layer**: 30% Complete
- **Web Application Layer**: 60% Complete
- **Env-Helpers Layer**: 20% Complete
- **Integration**: 10% Complete

**Overall Progress**: 40% Complete
