import {
  decryptEnvValues,
  encryptEnvValues,
  readEnvFile,
  readConfigFile,
} from "@nvii/env-helpers";

export async function testencryption() {
  const config = await readConfigFile();
  if (!config?.userId) {
    console.error(
      "You must be logged in to test encryption. Run 'nvii login' first.",
    );
    process.exit(1);
  }

  const envs = await readEnvFile();

  const encryptedEnv = encryptEnvValues(envs, config.userId);

  const decryptedEnv = decryptEnvValues(encryptedEnv, config.userId);

  console.log("Encrypted Env:", encryptedEnv);
  console.log("Decrypted Env:", decryptedEnv);
}
