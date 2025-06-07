import {
  decryptEnvValues,
  encryptEnvValues,
  readEnvFile,
  readConfigFile,
} from "@workspace/env-helpers";

export async function testencryption() {
  const config = await readConfigFile();
  if (!config?.userId) {
    console.error(
      "You must be logged in to test encryption. Run 'envi login' first."
    );
    process.exit(1);
  }

  const envs = await readEnvFile();

  const encryptedEnv = encryptEnvValues(envs, config.userId);

  const decryptedEnv = decryptEnvValues(encryptedEnv, config.userId);

  console.log("Encrypted Env:", encryptedEnv);
  console.log("Decrypted Env:", decryptedEnv);
}
