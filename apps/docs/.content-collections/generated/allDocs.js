
export default [
  {
    "title": "Nvii Documentation",
    "summary": "Complete guide to using Nvii CLI for secure environment variable management",
    "content": "# Nvii Documentation\n\n## Introduction\n\nNvii is a secure environment variable management platform designed for modern development teams. It provides end to end encryption, version control, and seamless collaboration for managing environment variables across your projects. With Nvii, you can track changes, rollback to previous versions, manage branches, and ensure your sensitive configuration data remains secure.\n\n## Features\n\nNvii offers a comprehensive set of features including:\n\n**Security**: End to end encryption for all environment variables, secure authentication, device based session management\n\n**Version Control**: Complete history tracking, version rollback capabilities, branch management for different environments\n\n**Collaboration**: Team based access control, conflict resolution, synchronized updates across devices\n\n**Developer Experience**: Intuitive CLI commands, dry run capabilities, automated conflict detection\n\n## Installation\n\nInstall Nvii globally using npm or yarn:\n\n```bash\nnpm install -g nvii\n```\n\nOr using yarn:\n\n```bash\nyarn global add nvii\n```\n\n## Getting Started\n\nBefore using Nvii, you need to authenticate and create or link a project. Here's a quick start workflow:\n\n1. Login to your Nvii account: `nvii login`\n2. Create a new project: `nvii new`\n3. Push your environment variables: `nvii push`\n4. Pull changes on other machines: `nvii pull`\n\n## Authentication Commands\n\n### Login\n\nAuthenticate and establish a secure session with Nvii. This command opens a browser window for authentication and stores your credentials locally.\n\n```bash\nnvii login\n```\n\nThe login process generates a unique confirmation code and establishes a secure connection. Your credentials are stored in your home directory for subsequent CLI operations.\n\n### Logout\n\nTerminate your current session and clear authentication credentials from your local machine.\n\n```bash\nnvii logout\n```\n\n**Options:**\n\n`-u, --username <username>`: Specify the username of the account to logout from\n\n`-e, --email <email>`: Specify the email of the account to logout from\n\n**Examples:**\n\n```bash\n# Interactive logout with confirmation\nnvii logout\n\n# Logout specific user by username\nnvii logout --username johndoe\n\n# Logout specific user by email\nnvii logout --email john@example.com\n```\n\n### Whoami\n\nDisplay information about the currently authenticated user, including username and email address.\n\n```bash\nnvii whoami\n```\n\nThis command helps verify your authentication status and confirms which account you're currently using.\n\n## Project Management Commands\n\n### New\n\nInitialize a new project and configure environment variable management. This command reads your local .env file, encrypts the contents, and creates a new project in the Nvii platform.\n\n```bash\nnvii new\n```\n\nThe command will prompt you for:\n\n**Project name**: A descriptive name for your project\n\n**Project description**: Optional description explaining the project's purpose\n\nAfter creation, your project is automatically linked to the current directory.\n\n### Link\n\nConnect the current directory to an existing remote project. This is useful when working on multiple machines or onboarding new team members.\n\n```bash\nnvii link\n```\n\n**Options:**\n\n`-t, --token <id>`: Specify a project ID to connect to directly\n\n**Examples:**\n\n```bash\n# Interactive project selection\nnvii link\n\n# Link to specific project by ID\nnvii link --token abc123xyz\n```\n\nThe link command creates a `.nvii` directory in your current folder containing the project configuration.\n\n### Unlink\n\nDisconnect the current directory from its linked remote project. This removes the local `.nvii` configuration directory.\n\n```bash\nnvii unlink\n```\n\nYou'll be asked to confirm before the unlinking process completes. This operation only affects your local machine and doesn't delete the remote project.\n\n## Environment Variable Operations\n\n### Pull\n\nFetch and merge environment variables from the remote repository. This command retrieves the latest version from the server and updates your local .env file.\n\n```bash\nnvii pull\n```\n\n**Options:**\n\n`-f, --force`: Force pull without conflict resolution prompts, automatically accepting remote values <br />\n`-b, --branch <branch>`: Pull from a specific branch (default: main) <br />\n`-dry, --dry-run`: Preview changes without applying them to your local file <br />\n\n**Examples:**\n\n```bash\n# Standard pull with conflict resolution\nnvii pull\n\n# Force pull, accepting all remote changes\nnvii pull --force\n\n# Pull from development branch\nnvii pull --branch development\n\n# Preview changes without applying\nnvii pull --dry-run\n```\n\n**Conflict Resolution:**\n\nWhen conflicts are detected, Nvii will prompt you to choose between keeping your local value or accepting the remote value for each conflicting variable.\n\n### Push\n\nUpload local environment variable changes and create a new version. This command encrypts your local .env file and pushes it to the remote repository.\n\n```bash\nnvii push\n```\n\n**Options:**\n\n`-m, --message <message>`: Provide a version description message <br />\n`-b, --branch <branch>`: Push to a specific branch (default: main) <br />\n`-dry, --dry-run`: Preview changes without uploading <br />\n\n**Examples:**\n\n```bash\n# Push with inline message\nnvii push --message \"Added database credentials\"\n\n# Interactive push with prompt for message\nnvii push\n\n# Push to staging branch\nnvii push --branch staging --message \"Update API keys\"\n\n# Preview changes before pushing\nnvii push --dry-run\n```\n\nThe push command displays a summary of added, modified, and removed variables before creating the new version.\n\n### Update\n\nSynchronize local environment file with the latest remote version. This command updates your .env file to match the most recent version without interactive conflict resolution.\n\n```bash\nnvii update\n```\n\nThis is useful for quickly syncing when you know the remote version should take precedence.\n\n## Version Control Commands\n\n### Log\n\nDisplay version history and change log for the current project. This command shows all versions with their descriptions, authors, and timestamps.\n\n```bash\nnvii log\n```\n\n**Options:**\n\n`-n, --limit <number>`: Limit the number of versions to display (default: 10) <br />\n`--oneline`: Show condensed one line format for each version <br />\n`--author <email>`: Filter versions by author email or name <br />\n\n**Examples:**\n\n```bash\n# Show last 10 versions\nnvii log\n\n# Show last 5 versions\nnvii log --limit 5\n\n# Compact one-line format\nnvii log --oneline\n\n# Filter by author\nnvii log --author john@example.com\n\n# Combine options\nnvii log --limit 20 --oneline --author jane\n```\n\n**Output Formats:**\n\nDefault format shows detailed information including version ID, author, timestamp, and description message.\n\nOneline format provides a compact view: `<version-id> <date> <author> <message>`\n\n### Rollback\n\nRestore environment variables to a previous version state. This command updates your local .env file to match the content from a selected historical version.\n\n```bash\nnvii rollback\n```\n\n**Options:**\n\n`-v, --version <id>`: Specify a version ID to rollback to directly <br />\n`-f, --force`: Skip confirmation prompts <br />\n\n**Examples:**\n\n```bash\n# Interactive version selection\nnvii rollback\n\n# Rollback to specific version\nnvii rollback --version abc123def456\n\n# Rollback without confirmation\nnvii rollback --version abc123def456 --force\n```\n\nThe rollback command displays available versions and asks for confirmation before updating your local file. This operation doesn't delete any versions, it simply updates your working copy.\n\n### Merge\n\nConsolidate multiple environment variable versions into the main branch. This command helps merge changes from feature branches back into your main branch.\n\n```bash\nnvii merge\n```\n\n**Options:**\n\n`-s, --source <branch>`: Source branch to merge from <br />\n`-t, --target <branch>`: Target branch to merge into (default: main) <br />\n\n**Examples:**\n\n```bash\n# Merge with prompts\nnvii merge\n\n# Merge development into main\nnvii merge --source development --target main\n```\n\n## Branch Management Commands\n\n### Branch\n\nCreate a new branch from the current or specified version. Branches allow you to maintain separate environment configurations for different environments like development, staging, and production.\n\n```bash\nnvii branch\n```\n\n**Options:**\n\n`-n, --name <name>`: Specify the branch name <br />\n`-v, --version <id>`: Base version ID to branch from (default: latest version) <br />\n\n**Examples:**\n\n```bash\n# Create branch interactively\nnvii branch\n\n# Create named branch from latest version\nnvii branch --name development\n\n# Create branch from specific version\nnvii branch --name hotfix --version abc123def\n```\n\nBranch names can contain letters, numbers, dots, underscores, hyphens, and slashes.\n\n### Branches\n\nList all branches for the current project. This command displays all available branches with their base versions and creation dates.\n\n```bash\nnvii branches\n```\n\nThe output shows:\n\nActive branches marked with an asterisk <br />\nCurrent branch you're working on <br />\nBase version ID for each branch <br />\nCreation timestamp <br />\n\n### Checkout\n\nSwitch to a different branch. This command updates your local configuration to work with a specified branch.\n\n```bash\nnvii checkout\n```\n\n**Options:**\n\n`-n, --name <name>`: Branch name to switch to\n\n**Examples:**\n\n```bash\n# Interactive branch selection\nnvii checkout\n\n# Switch to specific branch\nnvii checkout --name development\n```\n\nAfter switching branches, your subsequent push and pull operations will target the selected branch.\n\n## Version Tagging Commands\n\n### Tag\n\nCreate a new tag for the current or specified version. Tags provide named references to specific versions, useful for marking releases or significant milestones.\n\n```bash\nnvii tag\n```\n\n**Options:**\n\n`-n, --name <name>`: Tag name to use <br />\n`-v, --version <id>`: Version ID to tag (default: latest version) <br />\n\n**Examples:**\n\n```bash\n# Create tag interactively\nnvii tag\n\n# Create named tag for latest version\nnvii tag --name v1.0.0\n\n# Create tag for specific version\nnvii tag --name production-release --version abc123def\n```\n\nTag names can contain letters, numbers, dots, underscores, and hyphens. They're commonly used for semantic versioning (e.g., v1.0.0, v2.1.3).\n\n### Tags\n\nList all tags for the current project. This command displays all tags with their associated version IDs, descriptions, and creation dates.\n\n```bash\nnvii tags\n```\n\nThe output includes tag names, linked version IDs, optional descriptions, and timestamps.\n\n## Utility Commands\n\n### Generate\n\nCreate a template .env file from your current environment variables. This command generates an example file with variable names but empty values, perfect for sharing with team members or documenting required variables.\n\n```bash\nnvii generate\n```\n\n**Options:**\n\n`-o, --output <file>`: Specify output file path (default: .env.example) <br />\n`--format <type>`: Choose output format: env, json, or yaml (default: env)\n\n**Examples:**\n\n```bash\n# Generate .env.example file\nnvii generate\n\n# Generate with custom output path\nnvii generate --output .env.template\n\n# Generate JSON format\nnvii generate --format json\n\n# Generate YAML format\nnvii generate --format yaml --output config.yaml\n```\n\n**Output Formats:**\n\n`env`: Standard .env file format with empty values\n\n`json`: JSON object with variable keys and empty string values\n\n`yaml`: YAML format with variable keys and empty values\n\n### Test\n\nVerify encryption and decryption functionality. This command tests the encryption system by encrypting your environment variables and then decrypting them, displaying both versions.\n\n```bash\nnvii test\n```\n\nThis is primarily used for debugging and verifying that the encryption system is working correctly with your credentials.\n\n## Best Practices\n\n**Version Messages**: Always provide descriptive messages when pushing changes, similar to git commit messages\n\n**Branch Strategy**: Use branches for different environments (development, staging, production)\n\n**Regular Syncing**: Pull changes before starting work and push when done to keep your team synchronized\n\n**Dry Run First**: Use the dry run flag to preview changes before applying them, especially with pull operations\n\n**Tag Releases**: Create tags for production releases to easily rollback if needed\n\n**Conflict Resolution**: When conflicts occur, carefully review each variable to choose the correct value\n\n## Common Workflows\n\n### Setting Up a New Project\n\n```bash\n# Login to Nvii\nnvii login\n\n# Create a new project\nnvii new\n\n# Push your initial environment variables\nnvii push --message \"Initial environment setup\"\n```\n\n### Joining an Existing Project\n\n```bash\n# Login to Nvii\nnvii login\n\n# Link to the project\nnvii link\n\n# Pull the environment variables\nnvii pull\n```\n\n### Daily Development Workflow\n\n```bash\n# Start of day: pull latest changes\nnvii pull\n\n# Make changes to your .env file\n# ...\n\n# End of day: push your changes\nnvii push --message \"Updated database connection strings\"\n```\n\n### Managing Multiple Environments\n\n```bash\n# Create branches for different environments\nnvii branch --name development\nnvii branch --name staging\nnvii branch --name production\n\n# Switch to development\nnvii checkout --name development\n\n# Push changes to development\nnvii push --message \"Dev environment config\"\n\n# Switch to production\nnvii checkout --name production\n\n# Pull production config\nnvii pull\n```\n\n### Rolling Back After a Mistake\n\n```bash\n# View recent changes\nnvii log --limit 10\n\n# Rollback to a previous version\nnvii rollback --version abc123def\n\n# Or use interactive selection\nnvii rollback\n```\n\n## Troubleshooting\n\n### Authentication Issues\n\nIf you're having trouble logging in, try logging out first and then logging in again:\n\n```bash\nnvii logout\nnvii login\n```\n\n### Project Not Linked\n\nIf you see \"Project not linked\" errors, ensure you've linked your project:\n\n```bash\nnvii link\n```\n\n### Conflicts During Pull\n\nIf you encounter conflicts, you can either resolve them interactively or force pull with the remote values:\n\n```bash\n# Interactive resolution\nnvii pull\n\n# Force accept remote values\nnvii pull --force\n```\n\n### Missing Environment File\n\nEnsure you have a .env or .env.local file in your current directory before running commands like push or generate.\n\n## Security Considerations\n\n**Encryption**: All environment variables are encrypted using end to end encryption before transmission\n\n**Device Authentication**: Each device requires separate authentication for security\n\n**Local Storage**: Credentials are stored securely in your home directory\n\n**Access Control**: Project access is managed through team permissions\n\n**Version History**: All changes are tracked and can be audited\n\n## Support and Resources\n\nFor additional help and resources:\n\n**Documentation**: Visit the Nvii documentation site for detailed guides\n\n**GitHub**: Report issues or contribute to the project\n\n**Community**: Join the Nvii community for discussions and support\n\n## Version\n\nCurrent CLI version: 1.0.3\n\nCheck your installed version:\n\n```bash\nnvii --version\n```",
    "_meta": {
      "filePath": "guides/index.mdx",
      "fileName": "index.mdx",
      "directory": "guides",
      "extension": "mdx",
      "path": "guides"
    },
    "headings": [
      {
        "level": 1,
        "text": "Nvii Documentation",
        "slug": "nvii-documentation"
      },
      {
        "level": 2,
        "text": "Introduction",
        "slug": "introduction"
      },
      {
        "level": 2,
        "text": "Features",
        "slug": "features"
      },
      {
        "level": 2,
        "text": "Installation",
        "slug": "installation"
      },
      {
        "level": 2,
        "text": "Getting Started",
        "slug": "getting-started"
      },
      {
        "level": 2,
        "text": "Authentication Commands",
        "slug": "authentication-commands"
      },
      {
        "level": 3,
        "text": "Login",
        "slug": "login"
      },
      {
        "level": 3,
        "text": "Logout",
        "slug": "logout"
      },
      {
        "level": 1,
        "text": "Interactive logout with confirmation",
        "slug": "interactive-logout-with-confirmation"
      },
      {
        "level": 1,
        "text": "Logout specific user by username",
        "slug": "logout-specific-user-by-username"
      },
      {
        "level": 1,
        "text": "Logout specific user by email",
        "slug": "logout-specific-user-by-email"
      },
      {
        "level": 3,
        "text": "Whoami",
        "slug": "whoami"
      },
      {
        "level": 2,
        "text": "Project Management Commands",
        "slug": "project-management-commands"
      },
      {
        "level": 3,
        "text": "New",
        "slug": "new"
      },
      {
        "level": 3,
        "text": "Link",
        "slug": "link"
      },
      {
        "level": 1,
        "text": "Interactive project selection",
        "slug": "interactive-project-selection"
      },
      {
        "level": 1,
        "text": "Link to specific project by ID",
        "slug": "link-to-specific-project-by-id"
      },
      {
        "level": 3,
        "text": "Unlink",
        "slug": "unlink"
      },
      {
        "level": 2,
        "text": "Environment Variable Operations",
        "slug": "environment-variable-operations"
      },
      {
        "level": 3,
        "text": "Pull",
        "slug": "pull"
      },
      {
        "level": 1,
        "text": "Standard pull with conflict resolution",
        "slug": "standard-pull-with-conflict-resolution"
      },
      {
        "level": 1,
        "text": "Force pull, accepting all remote changes",
        "slug": "force-pull-accepting-all-remote-changes"
      },
      {
        "level": 1,
        "text": "Pull from development branch",
        "slug": "pull-from-development-branch"
      },
      {
        "level": 1,
        "text": "Preview changes without applying",
        "slug": "preview-changes-without-applying"
      },
      {
        "level": 3,
        "text": "Push",
        "slug": "push"
      },
      {
        "level": 1,
        "text": "Push with inline message",
        "slug": "push-with-inline-message"
      },
      {
        "level": 1,
        "text": "Interactive push with prompt for message",
        "slug": "interactive-push-with-prompt-for-message"
      },
      {
        "level": 1,
        "text": "Push to staging branch",
        "slug": "push-to-staging-branch"
      },
      {
        "level": 1,
        "text": "Preview changes before pushing",
        "slug": "preview-changes-before-pushing"
      },
      {
        "level": 3,
        "text": "Update",
        "slug": "update"
      },
      {
        "level": 2,
        "text": "Version Control Commands",
        "slug": "version-control-commands"
      },
      {
        "level": 3,
        "text": "Log",
        "slug": "log"
      },
      {
        "level": 1,
        "text": "Show last 10 versions",
        "slug": "show-last-10-versions"
      },
      {
        "level": 1,
        "text": "Show last 5 versions",
        "slug": "show-last-5-versions"
      },
      {
        "level": 1,
        "text": "Compact one-line format",
        "slug": "compact-one-line-format"
      },
      {
        "level": 1,
        "text": "Filter by author",
        "slug": "filter-by-author"
      },
      {
        "level": 1,
        "text": "Combine options",
        "slug": "combine-options"
      },
      {
        "level": 3,
        "text": "Rollback",
        "slug": "rollback"
      },
      {
        "level": 1,
        "text": "Interactive version selection",
        "slug": "interactive-version-selection"
      },
      {
        "level": 1,
        "text": "Rollback to specific version",
        "slug": "rollback-to-specific-version"
      },
      {
        "level": 1,
        "text": "Rollback without confirmation",
        "slug": "rollback-without-confirmation"
      },
      {
        "level": 3,
        "text": "Merge",
        "slug": "merge"
      },
      {
        "level": 1,
        "text": "Merge with prompts",
        "slug": "merge-with-prompts"
      },
      {
        "level": 1,
        "text": "Merge development into main",
        "slug": "merge-development-into-main"
      },
      {
        "level": 2,
        "text": "Branch Management Commands",
        "slug": "branch-management-commands"
      },
      {
        "level": 3,
        "text": "Branch",
        "slug": "branch"
      },
      {
        "level": 1,
        "text": "Create branch interactively",
        "slug": "create-branch-interactively"
      },
      {
        "level": 1,
        "text": "Create named branch from latest version",
        "slug": "create-named-branch-from-latest-version"
      },
      {
        "level": 1,
        "text": "Create branch from specific version",
        "slug": "create-branch-from-specific-version"
      },
      {
        "level": 3,
        "text": "Branches",
        "slug": "branches"
      },
      {
        "level": 3,
        "text": "Checkout",
        "slug": "checkout"
      },
      {
        "level": 1,
        "text": "Interactive branch selection",
        "slug": "interactive-branch-selection"
      },
      {
        "level": 1,
        "text": "Switch to specific branch",
        "slug": "switch-to-specific-branch"
      },
      {
        "level": 2,
        "text": "Version Tagging Commands",
        "slug": "version-tagging-commands"
      },
      {
        "level": 3,
        "text": "Tag",
        "slug": "tag"
      },
      {
        "level": 1,
        "text": "Create tag interactively",
        "slug": "create-tag-interactively"
      },
      {
        "level": 1,
        "text": "Create named tag for latest version",
        "slug": "create-named-tag-for-latest-version"
      },
      {
        "level": 1,
        "text": "Create tag for specific version",
        "slug": "create-tag-for-specific-version"
      },
      {
        "level": 3,
        "text": "Tags",
        "slug": "tags"
      },
      {
        "level": 2,
        "text": "Utility Commands",
        "slug": "utility-commands"
      },
      {
        "level": 3,
        "text": "Generate",
        "slug": "generate"
      },
      {
        "level": 1,
        "text": "Generate .env.example file",
        "slug": "generate-envexample-file"
      },
      {
        "level": 1,
        "text": "Generate with custom output path",
        "slug": "generate-with-custom-output-path"
      },
      {
        "level": 1,
        "text": "Generate JSON format",
        "slug": "generate-json-format"
      },
      {
        "level": 1,
        "text": "Generate YAML format",
        "slug": "generate-yaml-format"
      },
      {
        "level": 3,
        "text": "Test",
        "slug": "test"
      },
      {
        "level": 2,
        "text": "Best Practices",
        "slug": "best-practices"
      },
      {
        "level": 2,
        "text": "Common Workflows",
        "slug": "common-workflows"
      },
      {
        "level": 3,
        "text": "Setting Up a New Project",
        "slug": "setting-up-a-new-project"
      },
      {
        "level": 1,
        "text": "Login to Nvii",
        "slug": "login-to-nvii"
      },
      {
        "level": 1,
        "text": "Create a new project",
        "slug": "create-a-new-project"
      },
      {
        "level": 1,
        "text": "Push your initial environment variables",
        "slug": "push-your-initial-environment-variables"
      },
      {
        "level": 3,
        "text": "Joining an Existing Project",
        "slug": "joining-an-existing-project"
      },
      {
        "level": 1,
        "text": "Login to Nvii",
        "slug": "login-to-nvii"
      },
      {
        "level": 1,
        "text": "Link to the project",
        "slug": "link-to-the-project"
      },
      {
        "level": 1,
        "text": "Pull the environment variables",
        "slug": "pull-the-environment-variables"
      },
      {
        "level": 3,
        "text": "Daily Development Workflow",
        "slug": "daily-development-workflow"
      },
      {
        "level": 1,
        "text": "Start of day: pull latest changes",
        "slug": "start-of-day-pull-latest-changes"
      },
      {
        "level": 1,
        "text": "Make changes to your .env file",
        "slug": "make-changes-to-your-env-file"
      },
      {
        "level": 1,
        "text": "...",
        "slug": ""
      },
      {
        "level": 1,
        "text": "End of day: push your changes",
        "slug": "end-of-day-push-your-changes"
      },
      {
        "level": 3,
        "text": "Managing Multiple Environments",
        "slug": "managing-multiple-environments"
      },
      {
        "level": 1,
        "text": "Create branches for different environments",
        "slug": "create-branches-for-different-environments"
      },
      {
        "level": 1,
        "text": "Switch to development",
        "slug": "switch-to-development"
      },
      {
        "level": 1,
        "text": "Push changes to development",
        "slug": "push-changes-to-development"
      },
      {
        "level": 1,
        "text": "Switch to production",
        "slug": "switch-to-production"
      },
      {
        "level": 1,
        "text": "Pull production config",
        "slug": "pull-production-config"
      },
      {
        "level": 3,
        "text": "Rolling Back After a Mistake",
        "slug": "rolling-back-after-a-mistake"
      },
      {
        "level": 1,
        "text": "View recent changes",
        "slug": "view-recent-changes"
      },
      {
        "level": 1,
        "text": "Rollback to a previous version",
        "slug": "rollback-to-a-previous-version"
      },
      {
        "level": 1,
        "text": "Or use interactive selection",
        "slug": "or-use-interactive-selection"
      },
      {
        "level": 2,
        "text": "Troubleshooting",
        "slug": "troubleshooting"
      },
      {
        "level": 3,
        "text": "Authentication Issues",
        "slug": "authentication-issues"
      },
      {
        "level": 3,
        "text": "Project Not Linked",
        "slug": "project-not-linked"
      },
      {
        "level": 3,
        "text": "Conflicts During Pull",
        "slug": "conflicts-during-pull"
      },
      {
        "level": 1,
        "text": "Interactive resolution",
        "slug": "interactive-resolution"
      },
      {
        "level": 1,
        "text": "Force accept remote values",
        "slug": "force-accept-remote-values"
      },
      {
        "level": 3,
        "text": "Missing Environment File",
        "slug": "missing-environment-file"
      },
      {
        "level": 2,
        "text": "Security Considerations",
        "slug": "security-considerations"
      },
      {
        "level": 2,
        "text": "Support and Resources",
        "slug": "support-and-resources"
      },
      {
        "level": 2,
        "text": "Version",
        "slug": "version"
      }
    ],
    "mdx": "var Component=(()=>{var u=Object.create;var o=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var p=Object.getOwnPropertyNames;var g=Object.getPrototypeOf,v=Object.prototype.hasOwnProperty;var b=(i,e)=>()=>(e||i((e={exports:{}}).exports,e),e.exports),f=(i,e)=>{for(var r in e)o(i,r,{get:e[r],enumerable:!0})},c=(i,e,r,t)=>{if(e&&typeof e==\"object\"||typeof e==\"function\")for(let a of p(e))!v.call(i,a)&&a!==r&&o(i,a,{get:()=>e[a],enumerable:!(t=m(e,a))||t.enumerable});return i};var y=(i,e,r)=>(r=i!=null?u(g(i)):{},c(e||!i||!i.__esModule?o(r,\"default\",{value:i,enumerable:!0}):r,i)),w=i=>c(o({},\"__esModule\",{value:!0}),i);var s=b((C,l)=>{l.exports=_jsx_runtime});var k={};f(k,{default:()=>d});var n=y(s());function h(i){let e={code:\"code\",h1:\"h1\",h2:\"h2\",h3:\"h3\",li:\"li\",ol:\"ol\",p:\"p\",pre:\"pre\",strong:\"strong\",...i.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(e.h1,{children:\"Nvii Documentation\"}),`\n`,(0,n.jsx)(e.h2,{children:\"Introduction\"}),`\n`,(0,n.jsx)(e.p,{children:\"Nvii is a secure environment variable management platform designed for modern development teams. It provides end to end encryption, version control, and seamless collaboration for managing environment variables across your projects. With Nvii, you can track changes, rollback to previous versions, manage branches, and ensure your sensitive configuration data remains secure.\"}),`\n`,(0,n.jsx)(e.h2,{children:\"Features\"}),`\n`,(0,n.jsx)(e.p,{children:\"Nvii offers a comprehensive set of features including:\"}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Security\"}),\": End to end encryption for all environment variables, secure authentication, device based session management\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Version Control\"}),\": Complete history tracking, version rollback capabilities, branch management for different environments\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Collaboration\"}),\": Team based access control, conflict resolution, synchronized updates across devices\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Developer Experience\"}),\": Intuitive CLI commands, dry run capabilities, automated conflict detection\"]}),`\n`,(0,n.jsx)(e.h2,{children:\"Installation\"}),`\n`,(0,n.jsx)(e.p,{children:\"Install Nvii globally using npm or yarn:\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnpm install -g nvii\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`npm install -g nvii\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"Or using yarn:\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nyarn global add nvii\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`yarn global add nvii\n`})}),`\n`,(0,n.jsx)(e.h2,{children:\"Getting Started\"}),`\n`,(0,n.jsx)(e.p,{children:\"Before using Nvii, you need to authenticate and create or link a project. Here's a quick start workflow:\"}),`\n`,(0,n.jsxs)(e.ol,{children:[`\n`,(0,n.jsxs)(e.li,{children:[\"Login to your Nvii account: \",(0,n.jsx)(e.code,{children:\"nvii login\"})]}),`\n`,(0,n.jsxs)(e.li,{children:[\"Create a new project: \",(0,n.jsx)(e.code,{children:\"nvii new\"})]}),`\n`,(0,n.jsxs)(e.li,{children:[\"Push your environment variables: \",(0,n.jsx)(e.code,{children:\"nvii push\"})]}),`\n`,(0,n.jsxs)(e.li,{children:[\"Pull changes on other machines: \",(0,n.jsx)(e.code,{children:\"nvii pull\"})]}),`\n`]}),`\n`,(0,n.jsx)(e.h2,{children:\"Authentication Commands\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Login\"}),`\n`,(0,n.jsx)(e.p,{children:\"Authenticate and establish a secure session with Nvii. This command opens a browser window for authentication and stores your credentials locally.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii login\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii login\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"The login process generates a unique confirmation code and establishes a secure connection. Your credentials are stored in your home directory for subsequent CLI operations.\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Logout\"}),`\n`,(0,n.jsx)(e.p,{children:\"Terminate your current session and clear authentication credentials from your local machine.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii logout\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii logout\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Options:\"})}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"-u, --username <username>\"}),\": Specify the username of the account to logout from\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"-e, --email <email>\"}),\": Specify the email of the account to logout from\"]}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Examples:\"})}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# Interactive logout with confirmation\nnvii logout\n\n# Logout specific user by username\nnvii logout --username johndoe\n\n# Logout specific user by email\nnvii logout --email john@example.com\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Interactive logout with confirmation\nnvii logout\n\n# Logout specific user by username\nnvii logout --username johndoe\n\n# Logout specific user by email\nnvii logout --email john@example.com\n`})}),`\n`,(0,n.jsx)(e.h3,{children:\"Whoami\"}),`\n`,(0,n.jsx)(e.p,{children:\"Display information about the currently authenticated user, including username and email address.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii whoami\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii whoami\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"This command helps verify your authentication status and confirms which account you're currently using.\"}),`\n`,(0,n.jsx)(e.h2,{children:\"Project Management Commands\"}),`\n`,(0,n.jsx)(e.h3,{children:\"New\"}),`\n`,(0,n.jsx)(e.p,{children:\"Initialize a new project and configure environment variable management. This command reads your local .env file, encrypts the contents, and creates a new project in the Nvii platform.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii new\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii new\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"The command will prompt you for:\"}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Project name\"}),\": A descriptive name for your project\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Project description\"}),\": Optional description explaining the project's purpose\"]}),`\n`,(0,n.jsx)(e.p,{children:\"After creation, your project is automatically linked to the current directory.\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Link\"}),`\n`,(0,n.jsx)(e.p,{children:\"Connect the current directory to an existing remote project. This is useful when working on multiple machines or onboarding new team members.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii link\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii link\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Options:\"})}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"-t, --token <id>\"}),\": Specify a project ID to connect to directly\"]}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Examples:\"})}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\n# Interactive project selection\\nnvii link\\n\\n# Link to specific project by ID\\nnvii link --token abc123xyz\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Interactive project selection\nnvii link\n\n# Link to specific project by ID\nnvii link --token abc123xyz\n`})}),`\n`,(0,n.jsxs)(e.p,{children:[\"The link command creates a \",(0,n.jsx)(e.code,{children:\".nvii\"}),\" directory in your current folder containing the project configuration.\"]}),`\n`,(0,n.jsx)(e.h3,{children:\"Unlink\"}),`\n`,(0,n.jsxs)(e.p,{children:[\"Disconnect the current directory from its linked remote project. This removes the local \",(0,n.jsx)(e.code,{children:\".nvii\"}),\" configuration directory.\"]}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii unlink\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii unlink\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"You'll be asked to confirm before the unlinking process completes. This operation only affects your local machine and doesn't delete the remote project.\"}),`\n`,(0,n.jsx)(e.h2,{children:\"Environment Variable Operations\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Pull\"}),`\n`,(0,n.jsx)(e.p,{children:\"Fetch and merge environment variables from the remote repository. This command retrieves the latest version from the server and updates your local .env file.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii pull\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii pull\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Options:\"})}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"-f, --force\"}),\": Force pull without conflict resolution prompts, automatically accepting remote values \",(0,n.jsx)(\"br\",{}),`\n`,(0,n.jsx)(e.code,{children:\"-b, --branch <branch>\"}),\": Pull from a specific branch (default: main) \",(0,n.jsx)(\"br\",{}),`\n`,(0,n.jsx)(e.code,{children:\"-dry, --dry-run\"}),\": Preview changes without applying them to your local file \",(0,n.jsx)(\"br\",{})]}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Examples:\"})}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# Standard pull with conflict resolution\nnvii pull\n\n# Force pull, accepting all remote changes\nnvii pull --force\n\n# Pull from development branch\nnvii pull --branch development\n\n# Preview changes without applying\nnvii pull --dry-run\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Standard pull with conflict resolution\nnvii pull\n\n# Force pull, accepting all remote changes\nnvii pull --force\n\n# Pull from development branch\nnvii pull --branch development\n\n# Preview changes without applying\nnvii pull --dry-run\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Conflict Resolution:\"})}),`\n`,(0,n.jsx)(e.p,{children:\"When conflicts are detected, Nvii will prompt you to choose between keeping your local value or accepting the remote value for each conflicting variable.\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Push\"}),`\n`,(0,n.jsx)(e.p,{children:\"Upload local environment variable changes and create a new version. This command encrypts your local .env file and pushes it to the remote repository.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii push\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii push\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Options:\"})}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"-m, --message <message>\"}),\": Provide a version description message \",(0,n.jsx)(\"br\",{}),`\n`,(0,n.jsx)(e.code,{children:\"-b, --branch <branch>\"}),\": Push to a specific branch (default: main) \",(0,n.jsx)(\"br\",{}),`\n`,(0,n.jsx)(e.code,{children:\"-dry, --dry-run\"}),\": Preview changes without uploading \",(0,n.jsx)(\"br\",{})]}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Examples:\"})}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# Push with inline message\nnvii push --message \"Added database credentials\"\n\n# Interactive push with prompt for message\nnvii push\n\n# Push to staging branch\nnvii push --branch staging --message \"Update API keys\"\n\n# Preview changes before pushing\nnvii push --dry-run\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Push with inline message\nnvii push --message \"Added database credentials\"\n\n# Interactive push with prompt for message\nnvii push\n\n# Push to staging branch\nnvii push --branch staging --message \"Update API keys\"\n\n# Preview changes before pushing\nnvii push --dry-run\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"The push command displays a summary of added, modified, and removed variables before creating the new version.\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Update\"}),`\n`,(0,n.jsx)(e.p,{children:\"Synchronize local environment file with the latest remote version. This command updates your .env file to match the most recent version without interactive conflict resolution.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii update\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii update\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"This is useful for quickly syncing when you know the remote version should take precedence.\"}),`\n`,(0,n.jsx)(e.h2,{children:\"Version Control Commands\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Log\"}),`\n`,(0,n.jsx)(e.p,{children:\"Display version history and change log for the current project. This command shows all versions with their descriptions, authors, and timestamps.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii log\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii log\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Options:\"})}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"-n, --limit <number>\"}),\": Limit the number of versions to display (default: 10) \",(0,n.jsx)(\"br\",{}),`\n`,(0,n.jsx)(e.code,{children:\"--oneline\"}),\": Show condensed one line format for each version \",(0,n.jsx)(\"br\",{}),`\n`,(0,n.jsx)(e.code,{children:\"--author <email>\"}),\": Filter versions by author email or name \",(0,n.jsx)(\"br\",{})]}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Examples:\"})}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# Show last 10 versions\nnvii log\n\n# Show last 5 versions\nnvii log --limit 5\n\n# Compact one-line format\nnvii log --oneline\n\n# Filter by author\nnvii log --author john@example.com\n\n# Combine options\nnvii log --limit 20 --oneline --author jane\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Show last 10 versions\nnvii log\n\n# Show last 5 versions\nnvii log --limit 5\n\n# Compact one-line format\nnvii log --oneline\n\n# Filter by author\nnvii log --author john@example.com\n\n# Combine options\nnvii log --limit 20 --oneline --author jane\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Output Formats:\"})}),`\n`,(0,n.jsx)(e.p,{children:\"Default format shows detailed information including version ID, author, timestamp, and description message.\"}),`\n`,(0,n.jsxs)(e.p,{children:[\"Oneline format provides a compact view: \",(0,n.jsx)(e.code,{children:\"<version-id> <date> <author> <message>\"})]}),`\n`,(0,n.jsx)(e.h3,{children:\"Rollback\"}),`\n`,(0,n.jsx)(e.p,{children:\"Restore environment variables to a previous version state. This command updates your local .env file to match the content from a selected historical version.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii rollback\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii rollback\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Options:\"})}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"-v, --version <id>\"}),\": Specify a version ID to rollback to directly \",(0,n.jsx)(\"br\",{}),`\n`,(0,n.jsx)(e.code,{children:\"-f, --force\"}),\": Skip confirmation prompts \",(0,n.jsx)(\"br\",{})]}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Examples:\"})}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# Interactive version selection\nnvii rollback\n\n# Rollback to specific version\nnvii rollback --version abc123def456\n\n# Rollback without confirmation\nnvii rollback --version abc123def456 --force\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Interactive version selection\nnvii rollback\n\n# Rollback to specific version\nnvii rollback --version abc123def456\n\n# Rollback without confirmation\nnvii rollback --version abc123def456 --force\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"The rollback command displays available versions and asks for confirmation before updating your local file. This operation doesn't delete any versions, it simply updates your working copy.\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Merge\"}),`\n`,(0,n.jsx)(e.p,{children:\"Consolidate multiple environment variable versions into the main branch. This command helps merge changes from feature branches back into your main branch.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii merge\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii merge\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Options:\"})}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"-s, --source <branch>\"}),\": Source branch to merge from \",(0,n.jsx)(\"br\",{}),`\n`,(0,n.jsx)(e.code,{children:\"-t, --target <branch>\"}),\": Target branch to merge into (default: main) \",(0,n.jsx)(\"br\",{})]}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Examples:\"})}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\n# Merge with prompts\\nnvii merge\\n\\n# Merge development into main\\nnvii merge --source development --target main\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Merge with prompts\nnvii merge\n\n# Merge development into main\nnvii merge --source development --target main\n`})}),`\n`,(0,n.jsx)(e.h2,{children:\"Branch Management Commands\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Branch\"}),`\n`,(0,n.jsx)(e.p,{children:\"Create a new branch from the current or specified version. Branches allow you to maintain separate environment configurations for different environments like development, staging, and production.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii branch\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii branch\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Options:\"})}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"-n, --name <name>\"}),\": Specify the branch name \",(0,n.jsx)(\"br\",{}),`\n`,(0,n.jsx)(e.code,{children:\"-v, --version <id>\"}),\": Base version ID to branch from (default: latest version) \",(0,n.jsx)(\"br\",{})]}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Examples:\"})}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# Create branch interactively\nnvii branch\n\n# Create named branch from latest version\nnvii branch --name development\n\n# Create branch from specific version\nnvii branch --name hotfix --version abc123def\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Create branch interactively\nnvii branch\n\n# Create named branch from latest version\nnvii branch --name development\n\n# Create branch from specific version\nnvii branch --name hotfix --version abc123def\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"Branch names can contain letters, numbers, dots, underscores, hyphens, and slashes.\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Branches\"}),`\n`,(0,n.jsx)(e.p,{children:\"List all branches for the current project. This command displays all available branches with their base versions and creation dates.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii branches\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii branches\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"The output shows:\"}),`\n`,(0,n.jsxs)(e.p,{children:[\"Active branches marked with an asterisk \",(0,n.jsx)(\"br\",{}),`\nCurrent branch you're working on `,(0,n.jsx)(\"br\",{}),`\nBase version ID for each branch `,(0,n.jsx)(\"br\",{}),`\nCreation timestamp `,(0,n.jsx)(\"br\",{})]}),`\n`,(0,n.jsx)(e.h3,{children:\"Checkout\"}),`\n`,(0,n.jsx)(e.p,{children:\"Switch to a different branch. This command updates your local configuration to work with a specified branch.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii checkout\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii checkout\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Options:\"})}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"-n, --name <name>\"}),\": Branch name to switch to\"]}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Examples:\"})}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\n# Interactive branch selection\\nnvii checkout\\n\\n# Switch to specific branch\\nnvii checkout --name development\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Interactive branch selection\nnvii checkout\n\n# Switch to specific branch\nnvii checkout --name development\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"After switching branches, your subsequent push and pull operations will target the selected branch.\"}),`\n`,(0,n.jsx)(e.h2,{children:\"Version Tagging Commands\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Tag\"}),`\n`,(0,n.jsx)(e.p,{children:\"Create a new tag for the current or specified version. Tags provide named references to specific versions, useful for marking releases or significant milestones.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii tag\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii tag\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Options:\"})}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"-n, --name <name>\"}),\": Tag name to use \",(0,n.jsx)(\"br\",{}),`\n`,(0,n.jsx)(e.code,{children:\"-v, --version <id>\"}),\": Version ID to tag (default: latest version) \",(0,n.jsx)(\"br\",{})]}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Examples:\"})}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# Create tag interactively\nnvii tag\n\n# Create named tag for latest version\nnvii tag --name v1.0.0\n\n# Create tag for specific version\nnvii tag --name production-release --version abc123def\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Create tag interactively\nnvii tag\n\n# Create named tag for latest version\nnvii tag --name v1.0.0\n\n# Create tag for specific version\nnvii tag --name production-release --version abc123def\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"Tag names can contain letters, numbers, dots, underscores, and hyphens. They're commonly used for semantic versioning (e.g., v1.0.0, v2.1.3).\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Tags\"}),`\n`,(0,n.jsx)(e.p,{children:\"List all tags for the current project. This command displays all tags with their associated version IDs, descriptions, and creation dates.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii tags\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii tags\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"The output includes tag names, linked version IDs, optional descriptions, and timestamps.\"}),`\n`,(0,n.jsx)(e.h2,{children:\"Utility Commands\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Generate\"}),`\n`,(0,n.jsx)(e.p,{children:\"Create a template .env file from your current environment variables. This command generates an example file with variable names but empty values, perfect for sharing with team members or documenting required variables.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii generate\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii generate\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Options:\"})}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"-o, --output <file>\"}),\": Specify output file path (default: .env.example) \",(0,n.jsx)(\"br\",{}),`\n`,(0,n.jsx)(e.code,{children:\"--format <type>\"}),\": Choose output format: env, json, or yaml (default: env)\"]}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Examples:\"})}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# Generate .env.example file\nnvii generate\n\n# Generate with custom output path\nnvii generate --output .env.template\n\n# Generate JSON format\nnvii generate --format json\n\n# Generate YAML format\nnvii generate --format yaml --output config.yaml\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Generate .env.example file\nnvii generate\n\n# Generate with custom output path\nnvii generate --output .env.template\n\n# Generate JSON format\nnvii generate --format json\n\n# Generate YAML format\nnvii generate --format yaml --output config.yaml\n`})}),`\n`,(0,n.jsx)(e.p,{children:(0,n.jsx)(e.strong,{children:\"Output Formats:\"})}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"env\"}),\": Standard .env file format with empty values\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"json\"}),\": JSON object with variable keys and empty string values\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.code,{children:\"yaml\"}),\": YAML format with variable keys and empty values\"]}),`\n`,(0,n.jsx)(e.h3,{children:\"Test\"}),`\n`,(0,n.jsx)(e.p,{children:\"Verify encryption and decryption functionality. This command tests the encryption system by encrypting your environment variables and then decrypting them, displaying both versions.\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii test\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii test\n`})}),`\n`,(0,n.jsx)(e.p,{children:\"This is primarily used for debugging and verifying that the encryption system is working correctly with your credentials.\"}),`\n`,(0,n.jsx)(e.h2,{children:\"Best Practices\"}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Version Messages\"}),\": Always provide descriptive messages when pushing changes, similar to git commit messages\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Branch Strategy\"}),\": Use branches for different environments (development, staging, production)\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Regular Syncing\"}),\": Pull changes before starting work and push when done to keep your team synchronized\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Dry Run First\"}),\": Use the dry run flag to preview changes before applying them, especially with pull operations\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Tag Releases\"}),\": Create tags for production releases to easily rollback if needed\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Conflict Resolution\"}),\": When conflicts occur, carefully review each variable to choose the correct value\"]}),`\n`,(0,n.jsx)(e.h2,{children:\"Common Workflows\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Setting Up a New Project\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# Login to Nvii\nnvii login\n\n# Create a new project\nnvii new\n\n# Push your initial environment variables\nnvii push --message \"Initial environment setup\"\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Login to Nvii\nnvii login\n\n# Create a new project\nnvii new\n\n# Push your initial environment variables\nnvii push --message \"Initial environment setup\"\n`})}),`\n`,(0,n.jsx)(e.h3,{children:\"Joining an Existing Project\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# Login to Nvii\nnvii login\n\n# Link to the project\nnvii link\n\n# Pull the environment variables\nnvii pull\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Login to Nvii\nnvii login\n\n# Link to the project\nnvii link\n\n# Pull the environment variables\nnvii pull\n`})}),`\n`,(0,n.jsx)(e.h3,{children:\"Daily Development Workflow\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# Start of day: pull latest changes\nnvii pull\n\n# Make changes to your .env file\n# ...\n\n# End of day: push your changes\nnvii push --message \"Updated database connection strings\"\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Start of day: pull latest changes\nnvii pull\n\n# Make changes to your .env file\n# ...\n\n# End of day: push your changes\nnvii push --message \"Updated database connection strings\"\n`})}),`\n`,(0,n.jsx)(e.h3,{children:\"Managing Multiple Environments\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# Create branches for different environments\nnvii branch --name development\nnvii branch --name staging\nnvii branch --name production\n\n# Switch to development\nnvii checkout --name development\n\n# Push changes to development\nnvii push --message \"Dev environment config\"\n\n# Switch to production\nnvii checkout --name production\n\n# Pull production config\nnvii pull\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Create branches for different environments\nnvii branch --name development\nnvii branch --name staging\nnvii branch --name production\n\n# Switch to development\nnvii checkout --name development\n\n# Push changes to development\nnvii push --message \"Dev environment config\"\n\n# Switch to production\nnvii checkout --name production\n\n# Pull production config\nnvii pull\n`})}),`\n`,(0,n.jsx)(e.h3,{children:\"Rolling Back After a Mistake\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:`\\`\\`\\`bash\n# View recent changes\nnvii log --limit 10\n\n# Rollback to a previous version\nnvii rollback --version abc123def\n\n# Or use interactive selection\nnvii rollback\n\\`\\`\\``,children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# View recent changes\nnvii log --limit 10\n\n# Rollback to a previous version\nnvii rollback --version abc123def\n\n# Or use interactive selection\nnvii rollback\n`})}),`\n`,(0,n.jsx)(e.h2,{children:\"Troubleshooting\"}),`\n`,(0,n.jsx)(e.h3,{children:\"Authentication Issues\"}),`\n`,(0,n.jsx)(e.p,{children:\"If you're having trouble logging in, try logging out first and then logging in again:\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii logout\\nnvii login\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii logout\nnvii login\n`})}),`\n`,(0,n.jsx)(e.h3,{children:\"Project Not Linked\"}),`\n`,(0,n.jsx)(e.p,{children:`If you see \"Project not linked\" errors, ensure you've linked your project:`}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii link\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii link\n`})}),`\n`,(0,n.jsx)(e.h3,{children:\"Conflicts During Pull\"}),`\n`,(0,n.jsx)(e.p,{children:\"If you encounter conflicts, you can either resolve them interactively or force pull with the remote values:\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\n# Interactive resolution\\nnvii pull\\n\\n# Force accept remote values\\nnvii pull --force\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`# Interactive resolution\nnvii pull\n\n# Force accept remote values\nnvii pull --force\n`})}),`\n`,(0,n.jsx)(e.h3,{children:\"Missing Environment File\"}),`\n`,(0,n.jsx)(e.p,{children:\"Ensure you have a .env or .env.local file in your current directory before running commands like push or generate.\"}),`\n`,(0,n.jsx)(e.h2,{children:\"Security Considerations\"}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Encryption\"}),\": All environment variables are encrypted using end to end encryption before transmission\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Device Authentication\"}),\": Each device requires separate authentication for security\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Local Storage\"}),\": Credentials are stored securely in your home directory\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Access Control\"}),\": Project access is managed through team permissions\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Version History\"}),\": All changes are tracked and can be audited\"]}),`\n`,(0,n.jsx)(e.h2,{children:\"Support and Resources\"}),`\n`,(0,n.jsx)(e.p,{children:\"For additional help and resources:\"}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Documentation\"}),\": Visit the Nvii documentation site for detailed guides\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"GitHub\"}),\": Report issues or contribute to the project\"]}),`\n`,(0,n.jsxs)(e.p,{children:[(0,n.jsx)(e.strong,{children:\"Community\"}),\": Join the Nvii community for discussions and support\"]}),`\n`,(0,n.jsx)(e.h2,{children:\"Version\"}),`\n`,(0,n.jsx)(e.p,{children:\"Current CLI version: 1.0.3\"}),`\n`,(0,n.jsx)(e.p,{children:\"Check your installed version:\"}),`\n`,(0,n.jsx)(e.pre,{language:\"bash\",meta:\"\",code:\"```bash\\nnvii --version\\n```\",children:(0,n.jsx)(e.code,{className:\"language-bash\",children:`nvii --version\n`})})]})}function d(i={}){let{wrapper:e}=i.components||{};return e?(0,n.jsx)(e,{...i,children:(0,n.jsx)(h,{...i})}):h(i)}return w(k);})();\n;return Component;"
  },
  {
    "title": "Nothing",
    "summary": "Nothing",
    "content": "# Nothing\n\nNothing is a nothing.",
    "_meta": {
      "filePath": "guides/nothing.mdx",
      "fileName": "nothing.mdx",
      "directory": "guides",
      "extension": "mdx",
      "path": "guides/nothing"
    },
    "headings": [
      {
        "level": 1,
        "text": "Nothing",
        "slug": "nothing"
      }
    ],
    "mdx": "var Component=(()=>{var u=Object.create;var s=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var d=Object.getOwnPropertyNames;var g=Object.getPrototypeOf,j=Object.prototype.hasOwnProperty;var l=(n,t)=>()=>(t||n((t={exports:{}}).exports,t),t.exports),p=(n,t)=>{for(var o in t)s(n,o,{get:t[o],enumerable:!0})},i=(n,t,o,c)=>{if(t&&typeof t==\"object\"||typeof t==\"function\")for(let r of d(t))!j.call(n,r)&&r!==o&&s(n,r,{get:()=>t[r],enumerable:!(c=_(t,r))||c.enumerable});return n};var f=(n,t,o)=>(o=n!=null?u(g(n)):{},i(t||!n||!n.__esModule?s(o,\"default\",{value:n,enumerable:!0}):o,n)),M=n=>i(s({},\"__esModule\",{value:!0}),n);var h=l((F,a)=>{a.exports=_jsx_runtime});var C={};p(C,{default:()=>x});var e=f(h());function m(n){let t={h1:\"h1\",p:\"p\",...n.components};return(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)(t.h1,{children:\"Nothing\"}),`\n`,(0,e.jsx)(t.p,{children:\"Nothing is a nothing.\"})]})}function x(n={}){let{wrapper:t}=n.components||{};return t?(0,e.jsx)(t,{...n,children:(0,e.jsx)(m,{...n})}):m(n)}return M(C);})();\n;return Component;"
  }
]