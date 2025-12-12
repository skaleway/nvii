# Nvii - Secure Environment Variable Manager

Nvii is a comprehensive environment variable management platform that provides both a command-line interface for local development and a web dashboard for team collaboration. It enables secure, encrypted storage and version control of environment variables across multiple projects.

## Features

### **CLI Commands**

- **Authentication**: `login`, `logout`, `whoami`
- **Project Management**: `new`, `link`, `update`
- **Environment Control**: `generate`, `test`
- **Version Control**: `pull`, `push`, `history`, `rollback`

### **Web Dashboard**

- **User Management**: Registration, authentication, session management
- **Project Management**: Create, share, and manage projects
- **Environment Editor**: Web-based environment variable editing
- **Version Control**: Track changes, view history, compare versions
- **Team Collaboration**: Invite team members, manage access permissions
- **Real-time Sync**: Live updates across team members

### **Security Features**

- **AES-256 Encryption**: All environment variables encrypted before storage
- **User Authentication**: Secure login and session management
- **Device Management**: CLI authentication via device keys
- **Access Control**: Role-based permissions for project sharing
- **Version Tracking**: Complete audit trail of all changes

## Tech Stack

| Component          | Technology                            |
| ------------------ | ------------------------------------- |
| **CLI**            | TypeScript, Commander.js, Inquirer.js |
| **Web App**        | Next.js 14, React, TypeScript         |
| **Database**       | PostgreSQL, Prisma ORM                |
| **Authentication** | Auth.js (NextAuth)                    |
| **UI**             | Tailwind CSS, shadcn/ui               |
| **Encryption**     | Node.js crypto module                 |
| **Build Tools**    | Turbo, pnpm workspaces                |

## Project Structure

```txt
envi/
├── apps/
│   ├── docs/                   # Documentation site
│   └── web/                    # Next.js web application
│       ├── app/                # App router pages
│       │   ├── (app)/         # Authenticated app routes
│       │   │   └── projects/  # Project management
│       │   │       └── [projectId]/
│       │   │           └── versions/ # Version control UI
│       │   └── (auth)/        # Authentication routes
│       ├── components/         # React components
│       │   ├── auth/          # Authentication components
│       │   ├── version-*      # Version control components
│       │   └── ...            # Other components
│       ├── lib/               # Utility functions
│       │   ├── actions/       # Server actions
│       │   ├── diff-helpers.ts # Diff utilities
│       │   └── ...            # Other utilities
│       └── middleware.ts      # Auth middleware
├── packages/
│   ├── cli/                   # Command-line interface
│   │   └── src/
│   │       ├── commands/      # CLI commands
│   │       │   ├── auth/      # Authentication commands
│   │       │   ├── branch.ts  # Branch management
│   │       │   ├── crypt.ts   # Encryption utilities
│   │       │   ├── generate.ts # Generate example
│   │       │   ├── history.ts # Version history
│   │       │   ├── link.ts    # Link project
│   │       │   ├── new.ts     # Create project
│   │       │   ├── pull.ts    # Pull versions
│   │       │   ├── push.ts    # Push versions
│   │       │   ├── rollback.ts # Rollback versions
│   │       │   ├── tag.ts     # Tag management
│   │       │   ├── unlink.ts  # Unlink project
│   │       │   ├── update.ts  # Update env
│   │       │   └── some.ts    # Additional commands
│   │       ├── lib/           # CLI utilities
│   │       │   ├── conflict.ts # Conflict resolution
│   │       │   └── version.ts  # Version utilities
│   │       └── index.ts       # CLI entry point
│   ├── database/              # Database package
│   │   ├── prisma/           # Database schema
│   │   └── src/              # Database utilities
│   ├── env-helpers/          # Shared environment utilities
│   │   └── src/
│   │       ├── helpers/      # Helper functions
│   │       └── types/        # Type definitions
│   ├── ui/                   # Shared UI components
│   ├── eslint-config/        # Shared ESLint config
│   └── typescript-config/    # Shared TypeScript config
├── docker-compose.yml        # Database container
└── run-dev.sh               # Development script
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Docker (for local database)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd envi
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment files**

   ```bash
   # Create database environment file
   echo 'DATABASE_URL="postgresql://envi:envi_password@localhost:5433/envi"' > packages/database/.env

   # Create web app environment file (you'll need to add your auth providers)
   touch apps/web/.env
   ```

4. **First-time setup (if you haven't run the project before)**

   ```bash
   ./run-dev.sh
   ```

This will:

- Start PostgreSQL database with Docker
- Run database migrations
- Start the Next.js development server
- Make the web app available at `http://localhost:3000` or what ever port is displayed on your terminal for the web app.

**For subsequent runs (after initial setup):**

```bash
# Run all packages
pnpm dev

# Or run specific packages
pnpm --filter @nvii/web dev
pnpm --filter @nvii/cli dev
```

## 📖 Usage

### **CLI Usage**

1. **Authenticate with the service**

   ```bash
   nvii login
   ```

2. **Create a new project**

   ```bash
   nvii new
   ```

3. **Link to an existing project**

   ```bash
   nvii link
   ```

4. **Update environment variables**

   ```bash
   nvii update
   ```

5. **Generate example environment file**

   ```bash
   nvii generate
   ```

### **Web App Dashboard**

1. **Register/Login** at the web dashboard
2. **Create projects** and invite team members
3. **Edit environment variables** using the web interface
4. **Track changes** with version history
5. **Manage team access** and permissions

## 🔧 Development

### **Running Individual Components**

**Database:**

```bash
cd packages/database
pnpm prisma studio
```

**CLI:**

```bash
cd packages/cli
pnpm dev
```

**Web App:**

```bash
cd apps/web
pnpm dev
```

### **Database Migrations**

```bash
cd packages/database
pnpm prisma migrate dev
```

### **Building for Production**

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @nvii/cli build
pnpm --filter @nvii/web build
pnpm --filter
```

## 🔐 Security

- **Encryption**: All environment variables are encrypted with AES-256 before storage
- **Authentication**: Secure user authentication with session management
- **Authorization**: Role-based access control for project sharing
- **Audit Trail**: Complete version history of all changes
- **Device Management**: Secure CLI authentication via device keys

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](/CONTRIBUTING.md) for detailed guidelines on:

- Setting up the development environment
- Code style and conventions
- Testing procedures
- Pull request process

## 📝 License

[MIT license](/LICENSE.md)

## 🆘 Support

- **Documentation**: [Nvii docs](https://docs.nvii.dev/docs/guides)
- **Issues**: [GitHub issues](https://github.com/skaleway/nvii/?tab=issues)
- **Discussions**: [GitHub discussions](https://github.com/skaleway/nvii/?tab=discussions)

---

**Nvii** - Secure, collaborative environment variable management for modern development teams.
