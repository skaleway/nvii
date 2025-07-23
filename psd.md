# **Project Specification Document**

### **Project Title:**

**Envincible – Secure Environment Variable Manager**

---

## **1. Overview**

**Envincible** is a comprehensive environment variable management platform consisting of a command-line tool and web application designed to simplify and secure the management of environment variables across multiple projects. It provides developers with tools to link projects to a cloud store, encrypt sensitive values, and interactively control what gets synchronized. The platform includes both a CLI for local development and a web dashboard for team collaboration and project management.

---

## **2. Goals & Objectives**

### **Primary Goals**

- Provide an easy-to-use CLI for managing environment variables locally.
- Offer a web dashboard for team collaboration and project management.
- Synchronize `.env` files securely with a remote store.
- Encrypt all environment variables before storing them remotely.
- Decrypt variables only for authenticated clients.
- Respect developer privacy by requesting permission before:
  - Creating `.env` files.
  - Overwriting existing keys.
  - Uploading any `.env` content.
- Keep track of how the env's are changing over time (per change/update) (just like how commit work on git).

### **Objectives**

- Build a TypeScript-based CLI with a robust command structure.
- Develop a Next.js web application for team management.
- Use `inquirer` for interactive user prompts.
- Use `crypto` for AES-256 encryption/decryption.
- Interact with a remote API (Supabase) for persistence.
- Store project metadata (e.g., `projectId`) in a `.envi` file in project root.
- Implement user authentication and authorization.
- Provide version control for environment variables.

---

## **3. Features**

### ✅ **CLI Commands**

#### **Authentication**

- Command: `envincible login`
- Command: `envincible logout`
- Command: `envincible whoami`
- Description: Manage user authentication and session.

#### **Project Management**

- Command: `envincible new`
- Description: Create a new project and initialize configuration.

- Command: `envincible link`
- Description: Link an existing project to the current directory.

#### **Environment Management**

- Command: `envincible update`
- Description: Update the existing env file from remote.

- Command: `envincible generate`
- Description: Generate a .env.example file from your .env file.

- Command: `envincible test`
- Description: Test encryption and decryption functionality.

#### **Missing Commands (To Be Implemented)**

- Command: `envincible push`
- Description: Encrypt and upload environment variables to remote store.

- Command: `envincible pull`
- Description: Fetch and decrypt values from remote store.

### ✅ **Web Application**

#### **Authentication & User Management**

- User registration and login
- Session management
- Device management for CLI authentication

#### **Project Management**

- Create and manage projects
- Invite team members
- Manage project access permissions
- View project activity and history

#### **Environment Variable Management**

- Web-based environment variable editor
- Version history and diff viewing
- Real-time collaboration
- Export/import functionality

#### **Team Collaboration**

- Project sharing and access control
- Activity tracking
- Team member management

### 🔐 **Encryption**

- Uses AES-256 encryption.
- Each variable value is encrypted before upload.
- Decryption occurs locally before writing to `.env`.

---

## **4. Technology Stack**

| Area               | Tech                          |
| ------------------ | ----------------------------- |
| **CLI**            | TypeScript, Commander.js      |
| **Web App**        | Next.js 14, React, TypeScript |
| **Database**       | PostgreSQL, Prisma ORM        |
| **Authentication** | Auth.js (NextAuth)            |
| **UI**             | Tailwind CSS, shadcn/ui       |
| **Encryption**     | Node.js `crypto` module       |
| **API Client**     | Supabase Client SDK           |
| **Build Tools**    | Turbo, pnpm workspaces        |

---

## **5. Project Architecture**

```
envi/
├── apps/
│   └── web/                    # Next.js web application
│       ├── app/                # App router pages
│       ├── components/         # React components
│       ├── lib/               # Utility functions
│       └── middleware.ts      # Auth middleware
├── packages/
│   ├── cli/                   # Command-line interface
│   │   └── src/
│   │       ├── commands/      # CLI commands
│   │       │   ├── auth/      # Authentication commands
│   │       │   ├── link.ts    # Link project
│   │       │   ├── new.ts     # Create project
│   │       │   ├── update.ts  # Update env
│   │       │   ├── generate.ts # Generate example
│   │       │   └── crypt.ts   # Encryption utilities
│   │       └── index.ts       # CLI entry point
│   ├── database/              # Database package
│   │   ├── prisma/           # Database schema
│   │   └── src/              # Database utilities
│   ├── env-helpers/          # Shared environment utilities
│   ├── ui/                   # Shared UI components
│   ├── eslint-config/        # Shared ESLint config
│   └── typescript-config/    # Shared TypeScript config
├── docker-compose.yml        # Database container
└── run-dev.sh               # Development script
```

---

## **6. Database Schema (Prisma)**

### **Core Models**

#### **User Management**

```prisma
model User {
  id               String          @id @default(cuid())
  name             String?
  email            String?         @unique
  emailVerified    Boolean?
  image            String?
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  sessions         Session[]
  accounts         Account[]
  Device           Device[]
  ownedProjects    Project[]       @relation("ProjectOwner")
  projectAccess    ProjectAccess[]
  accessToProjects Project[]       @relation("ProjectAccess")
  EnvVersion       EnvVersion[]
}
```

#### **Authentication**

```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String    @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### **Device Management**

```prisma
model Device {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())
  userId    String
  key       String    @default(cuid())
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  code      String
  Project   Project[]
}
```

#### **Project Management**

```prisma
model Project {
  id        String   @id @default(cuid())
  name      String
  userId    String
  key       String   @default(cuid())
  user      User     @relation("ProjectOwner", fields: [userId], references: [id], onDelete: Cascade)
  deviceId  String
  device    Device   @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  content   Json?
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())

  havingAccess  User[]          @relation("ProjectAccess")
  ProjectAccess ProjectAccess[]
  versions      EnvVersion[]

  @@unique([userId, name])
}
```

#### **Access Control**

```prisma
model ProjectAccess {
  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId  String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  assignedAt DateTime @default(now())

  @@id([projectId, userId])
}
```

#### **Version Control**

```prisma
model EnvVersion {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  content     Json // Stores the environment variables at this version
  createdAt   DateTime @default(now())
  createdBy   String
  user        User     @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  description String? // Optional description of what changed
  changes     Json? // Stores what was added/modified/deleted
}
```

---

## **7. Security Considerations**

- All `.env` values are encrypted with a secret key before being sent to the server.
- Decryption only occurs locally.
- Secret key must be managed securely, ideally stored in `.envincible-key` file or secure OS keychain.
- Environment values are never exposed or logged in plain text.
- User authentication required for all operations.
- Device-based authentication for CLI access.
- Role-based access control for project sharing.

---

## **8. Development Setup**

### **Prerequisites**

- Node.js 18+
- pnpm
- Docker (for local database)

### **Quick Start**

```bash
# Clone and install dependencies
git clone <repository>
pnpm install

# Start database
docker-compose up -d

# Run development environment
./run-dev.sh
```

### **Environment Configuration**

- `packages/database/.env` - Database connection
- `apps/web/.env` - Web application configuration

---

## **9. Future Enhancements**

- GitHub Action integration for automatic sync on CI/CD pipelines.
- Advanced role-based access control (RBAC) for team environments.
- Expiring tokens for shared links.
- OTP-based authorization for sensitive changes.
- Real-time collaboration features.
- Advanced analytics and usage tracking.
- Mobile application for environment management.

---

## **10. Deliverables**

- ✅ Fully functional CLI published to `npm` as `envincible`.
- ✅ Next.js web application for team collaboration.
- ✅ PostgreSQL database with Prisma ORM.
- ✅ User authentication and authorization system.
- ✅ Project management and access control.
- ✅ Environment variable versioning.
- ✅ Documentation (README, usage examples).
- 🔄 End-to-end tests for each command (in progress).
- 🔄 Complete CLI command implementation (push/pull commands pending).
