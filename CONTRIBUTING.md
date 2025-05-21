# Contributing to Notpadd

Thank you for your interest in contributing to Notpadd! Please follow the steps below to set up your development environment.

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [pnpm](https://pnpm.io/) installed
- [Turborepo](https://turbo.build/repo/docs) (used internally)
- [Postgres](https://www.postgresql.org/) database (Neon serverless on production)
- [Clerk](https://clerk.com/) for authentication

## Getting Started

1. **Fork and Clone the Repository**

   ```bash
   git clone https://github.com/[your-github-login]/notpadd.git
   cd notpadd
   ```

2. **Create a New Branch**

   ```bash
   git checkout -b [your-branch]
   ```

3. **Set Up Environment Variables**

   - Create a `.env` file in `/apps/web` and fill in your credentials:

     ```env
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
     CLERK_SECRET_KEY=
     DATABASE_URL="postgresql://postgres:nothing@localhost:5431/notpadd"
     CLERK_WH_SECRET=
     CLERK_DEV_WH_SECRET=
     NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/t/"
     NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/new"
     NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
     NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
     UPLOADTHING_TOKEN=""
     ```

   - In `/packages/database`, create a `.env` file with:

     ```env
     DATABASE_URL="postgresql://postgres:nothing@localhost:5431/notpadd"
     ```

   > **Note:** The `DATABASE_URL` in both `/apps/web` and `/packages/database` should be the same.

4. **Make the Dev Script Executable**

   ```bash
   chmod +x run-dev.sh
   ```

5. **Run the Project**

   ```bash
   ./run-dev.sh
   ```

## Additional Notes

- If you need help, please open an issue or contact the maintainers.
