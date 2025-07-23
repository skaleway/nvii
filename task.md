# Version Control System Implementation Tasks

## Overview

This document outlines all tasks required to implement a complete version control system for environment variables across the Envincible platform.

---

## 📊 **Database Layer (packages/database)**

### ✅ **Completed Tasks**

- [x] EnvVersion model schema
- [x] Project-EnvVersion relationship
- [x] User-EnvVersion relationship
- [x] Changes tracking (JSON field)

### 🔄 **Pending Tasks**

#### **Schema Enhancements**

- [ ] Add `VersionTag` model for version tagging
- [ ] Add `VersionBranch` model for branching support
- [ ] Add `VersionAnalytics` model for usage tracking
- [ ] Add indexes for version queries (createdAt, projectId)
- [ ] Add soft delete support for versions

#### **Migration Tasks**

- [ ] Create migration for version analytics table
- [ ] Create migration for version tags table
- [ ] Create migration for version branches table
- [ ] Add database constraints for version integrity

#### **Database Utilities**

- [ ] Create version query helpers in `packages/database/src/`
- [ ] Add version validation functions
- [ ] Create version cleanup utilities (old versions)
- [ ] Add version statistics aggregation functions

---

## 🔧 **CLI Layer (packages/cli)**

### ✅ **Completed Tasks**

- [x] Basic CLI structure
- [x] Authentication commands (login, logout, whoami)
- [x] Project management (new, link, update)
- [x] Basic encryption utilities

### 🔄 **Pending Tasks**

#### **Core Version Control Commands**

- [ ] **Implement `pull.ts`** - Fetch and decrypt environment variables

  - [ ] Read `.envi` file for project configuration
  - [ ] Fetch latest version from API
  - [ ] Decrypt environment variables
  - [ ] Handle conflicts with existing `.env`
  - [ ] Write to `.env` file
  - [ ] Show change summary

- [ ] **Implement `push.ts`** - Encrypt and upload environment variables

  - [ ] Read `.env` file
  - [ ] Encrypt environment variables
  - [ ] Calculate changes from previous version
  - [ ] Create new version via API
  - [ ] Update project content
  - [ ] Show change summary

- [ ] **Implement `history.ts`** - Show version history

  - [ ] Fetch version history from API
  - [ ] Display formatted version list
  - [ ] Show change summaries
  - [ ] Add filtering options (date, user, changes)

- [ ] **Implement `rollback.ts`** - Rollback to specific version
  - [ ] List available versions
  - [ ] Select version to rollback to
  - [ ] Fetch and decrypt version
  - [ ] Create new version with rollback description
  - [ ] Update local `.env` file

#### **Missing Library Files**

- [ ] **Create `lib/version.ts`** - Version management utilities

  - [ ] `fetchVersions(projectId: string): Promise<VersionInfo[]>`
  - [ ] `createVersion(projectId: string, content: Record<string, string>, description?: string): Promise<VersionInfo>`
  - [ ] `getVersion(versionId: string): Promise<VersionInfo>`
  - [ ] `formatVersionHistory(versions: VersionInfo[]): string`
  - [ ] `compareVersions(version1: Record<string, string>, version2: Record<string, string>): DiffResult`

- [ ] **Create `lib/conflict.ts`** - Conflict resolution utilities

  - [ ] `detectConflicts(localEnv: Record<string, string>, remoteEnv: Record<string, string>): string[]`
  - [ ] `resolveConflicts(localEnv: Record<string, string>, remoteEnv: Record<string, string>): Promise<ConflictResolution>`
  - [ ] `mergeEnvironments(localEnv: Record<string, string>, remoteEnv: Record<string, string>, resolution: ConflictResolution): Record<string, string>`
  - [ ] `promptConflictResolution(conflicts: string[]): Promise<ConflictResolution>`

- [ ] **Create `lib/diff.ts`** - Diff utilities

  - [ ] `generateDiff(oldContent: Record<string, string>, newContent: Record<string, string>): DiffResult`
  - [ ] `formatDiff(diff: DiffResult): string`
  - [ ] `applyDiff(baseContent: Record<string, string>, diff: DiffResult): Record<string, string>`

- [ ] **Create `lib/encrypt.ts`** - Enhanced encryption utilities
  - [ ] `encryptEnvValues(values: Record<string, string>, userId: string): Record<string, string>`
  - [ ] `decryptEnvValues(encryptedValues: Record<string, string>, userId: string): Record<string, string>`
  - [ ] `generateEncryptionKey(): string`
  - [ ] `validateEncryptionKey(key: string): boolean`

#### **CLI Command Enhancements**

- [ ] **Add version flags to existing commands**

  - [ ] `link --version <versionId>` - Link to specific version
  - [ ] `update --version <versionId>` - Update to specific version
  - [ ] `new --template <versionId>` - Create from template version

- [ ] **Add version management commands**
  - [ ] `envincible tag <versionId> <tagName>` - Tag a version
  - [ ] `envincible tags` - List all tags
  - [ ] `envincible branch <branchName> <baseVersionId>` - Create branch
  - [ ] `envincible branches` - List branches
  - [ ] `envincible merge <sourceVersionId> <targetVersionId>` - Merge versions

---

## 🌐 **Web Application Layer (apps/web)**

### ✅ **Completed Tasks**

- [x] Basic version API endpoints (GET, POST)
- [x] Automatic version creation on project update
- [x] Change detection and calculation
- [x] Version listing with user information

### 🔄 **Pending Tasks**

#### **API Endpoints Enhancement**

- [ ] **Create `api/projects/[userId]/[projectId]/versions/[versionId]/route.ts`**

  - [ ] `GET` - Fetch specific version details
  - [ ] `DELETE` - Delete specific version (with permissions)
  - [ ] `PATCH` - Update version metadata (description, tags)

- [ ] **Create `api/projects/[userId]/[projectId]/versions/compare/route.ts`**

  - [ ] `POST` - Compare two versions and return diff
  - [ ] `GET` - Get comparison options (version list)

- [ ] **Create `api/projects/[userId]/[projectId]/versions/tags/route.ts`**

  - [ ] `GET` - List all tags for project
  - [ ] `POST` - Create new tag
  - [ ] `DELETE` - Delete tag

- [ ] **Create `api/projects/[userId]/[projectId]/versions/branches/route.ts`**

  - [ ] `GET` - List all branches
  - [ ] `POST` - Create new branch
  - [ ] `PATCH` - Update branch
  - [ ] `DELETE` - Delete branch

- [ ] **Enhance existing version endpoints**
  - [ ] Add pagination to version listing
  - [ ] Add filtering (date range, user, changes)
  - [ ] Add sorting options
  - [ ] Add version search functionality

#### **Web UI Components**

- [ ] **Create `components/version-history.tsx`**

  - [ ] Version timeline component
  - [ ] Version list with change summaries
  - [ ] Version selection and comparison
  - [ ] Version filtering and search

- [ ] **Create `components/version-diff.tsx`**

  - [ ] Side-by-side diff view
  - [ ] Inline diff view
  - [ ] Change highlighting
  - [ ] Diff export functionality

- [ ] **Create `components/version-actions.tsx`**

  - [ ] Rollback button
  - [ ] Tag creation
  - [ ] Branch creation
  - [ ] Version deletion

- [ ] **Create `components/version-analytics.tsx`**
  - [ ] Change frequency chart
  - [ ] Most changed variables
  - [ ] User activity timeline
  - [ ] Version usage statistics

#### **Web Pages**

- [ ] **Create `app/(after-auth)/projects/[projectId]/versions/page.tsx`**

  - [ ] Version history page
  - [ ] Version comparison tools
  - [ ] Version management actions

- [ ] **Create `app/(after-auth)/projects/[projectId]/versions/[versionId]/page.tsx`**

  - [ ] Individual version view
  - [ ] Version details and metadata
  - [ ] Version actions (rollback, tag, etc.)

- [ ] **Create `app/(after-auth)/projects/[projectId]/versions/compare/page.tsx`**
  - [ ] Version comparison page
  - [ ] Side-by-side diff view
  - [ ] Merge functionality

#### **Web Utilities**

- [ ] **Create `lib/diff-helpers.ts`**

  - [ ] `compareVersions(version1: Record<string, string>, version2: Record<string, string>): DiffResult`
  - [ ] `generateDiffReport(diff: DiffResult): string`
  - [ ] `formatVersionChanges(changes: VersionChanges): string`

- [ ] **Create `lib/version-helpers.ts`** (enhance existing)
  - [ ] `getVersionAnalytics(projectId: string): Promise<VersionAnalytics>`
  - [ ] `createVersionTag(versionId: string, tagName: string): Promise<VersionTag>`
  - [ ] `mergeVersions(sourceVersionId: string, targetVersionId: string): Promise<VersionInfo>`

---

## 📦 **Env-Helpers Layer (packages/env-helpers)**

### ✅ **Completed Tasks**

- [x] Basic environment file utilities
- [x] API client utilities

### 🔄 **Pending Tasks**

#### **Version Control Utilities**

- [ ] **Create `src/version/` directory**

  - [ ] `version-parser.ts` - Parse version metadata
  - [ ] `version-validator.ts` - Validate version data
  - [ ] `version-formatter.ts` - Format version output

- [ ] **Create `src/diff/` directory**

  - [ ] `diff-calculator.ts` - Calculate differences between versions
  - [ ] `diff-formatter.ts` - Format diff output
  - [ ] `diff-applier.ts` - Apply diff to environment

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
  - [ ] `VersionInfo` interface
  - [ ] `VersionChanges` interface
  - [ ] `DiffResult` interface
  - [ ] `ConflictResolution` interface

#### **API Integration**

- [ ] **Enhance `src/helpers/api-client.ts`**
  - [ ] Add version-specific API methods
  - [ ] Add version comparison methods
  - [ ] Add version management methods

---

## 🔗 **Integration Tasks**

### **Cross-Component Integration**

- [ ] **CLI-Web Integration**

  - [ ] Ensure CLI authentication works with web user system
  - [ ] Sync CLI version operations with web UI
  - [ ] Handle version conflicts between CLI and web

- [ ] **Database-API Integration**

  - [ ] Optimize version queries for performance
  - [ ] Add version caching layer
  - [ ] Implement version cleanup policies

- [ ] **Env-Helpers Integration**
  - [ ] Use env-helpers in CLI commands
  - [ ] Use env-helpers in web API endpoints
  - [ ] Ensure consistent version handling across components

### **Testing Tasks**

- [ ] **Unit Tests**

  - [ ] Test version calculation functions
  - [ ] Test conflict resolution logic
  - [ ] Test diff generation
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

---

## 📊 **Progress Tracking**

- **Database Layer**: 80% Complete
- **CLI Layer**: 30% Complete
- **Web Application Layer**: 60% Complete
- **Env-Helpers Layer**: 20% Complete
- **Integration**: 10% Complete

**Overall Progress**: 40% Complete
