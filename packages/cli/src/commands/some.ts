import pc from "picocolors";

export async function some() {
  try {
  } catch (error: Error | any) {
    if (error.response) {
      console.error(pc.yellow(`\n${error.response.data.error}`));
      return;
    }
    console.error(
      pc.red("\nError merging env branches (versions):"),
      error.message,
    );
    if (error.message.includes("User force closed the prompt with SIGINT")) {
      console.log(pc.yellow("\nSome cancelled."));
      return;
    }
    console.error(pc.red("Error soming versions:"), error.message);
    process.exit(1);
  }
}
