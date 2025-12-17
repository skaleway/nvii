import ora from "ora";
import chalk from "chalk";

async function runProcess() {
  // Prints the initial command line text
  console.log('$ nvii push --message "Update API keys"\n');

  // --- Step 1: Encrypting Variables ---
  // Start the spinner with the initial message
  const spinner = ora("Encrypting variables...").start();
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate work
  // Stop the spinner and mark the step as successful (adds green ✓)
  spinner.succeed("Encrypting variables...");

  // --- Step 2: Uploading to remote ---
  // Update the spinner for the next task
  spinner.text = "Uploading to remote...";
  spinner.start();
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate work
  spinner.succeed("Uploading to remote...");

  // --- Step 3: Version Created ---
  spinner.text = "Version created: v1.2.3";
  spinner.start();
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate work
  spinner.succeed("Version created: v1.2.3");

  // --- Step 4: Summary Output (static console.log) ---
  console.log("\n" + chalk.white("Added: 2 | Modified: 1 | Removed: 0"));
}

runProcess();
