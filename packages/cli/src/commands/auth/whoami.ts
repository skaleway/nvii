import { checkLoginStats } from "@nvii/env-helpers";
import pc from "picocolors";

export const whoami = async () => {
  try {
    await checkLoginStats();
  } catch (error: Error | any) {
    if (error.response) {
      console.error(pc.gray(`\n${error.response.data.error}`));
      return;
    }
    console.error("Error reading config:", error.message);
    process.exit(1);
  }
};
