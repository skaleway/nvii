import { readConfigFile } from "@nvii/env-helpers";
import pc from "picocolors";

export const whoami = async () => {
  try {
    const file = await readConfigFile();
    if (!file) return;

    console.log({ file });

    console.log(pc.green(`Logged in as ${file.username} (${file.email})`));
  } catch (error) {
    console.error("Error reading config:", error);
  }
};
