import { readConfigFile } from "@nvii/env-helpers";
import pc from "picocolors";

export const whoami = async () => {
  try {
    const file = await readConfigFile();
    if (!file) return;

    console.log(pc.green(`Logged in as ${file.username} (${file.email})`));
  } catch (error: Error | any) {
    console.error("Error reading config:", error.message);
    process.exit(1);
  }
};
