import { decryptEnvValues, encryptEnvValues, readEnvFile } from "../helpers";

export async function testencryption() {
  const envs = await readEnvFile();

  const encryptedEnv = encryptEnvValues(envs);

  const decryptedEnv = decryptEnvValues(encryptedEnv);

  console.log("Encrypted Env:", encryptedEnv);
  console.log("Decrypted Env:", decryptedEnv);
}
