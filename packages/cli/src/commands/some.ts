import pc from "picocolors";

export async function some() {
  try {
  } catch (error: Error | any) {
    console.error(
      pc.red("\nError merging env branches (versions):"),
      error.message,
    );
    process.exit(1);
  }
}
