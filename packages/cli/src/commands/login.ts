import { listen } from "async-listen";
import { spawn } from "child_process";
import "dotenv/config";
import { writeFileSync } from "fs";
import http from "http";
import { customAlphabet } from "nanoid";
import os from "os";
import path from "path";
import pc from "picocolors";
import url from "url";
import { FILENAME } from "../helpers";

class UserCancellationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserCancellationError";
  }
}

async function writeToConfigFile(data: Record<string, string>) {
  try {
    const homeDir = os.homedir();
    const filePath = path.join(homeDir, FILENAME);
    writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to local config file", error);
  }
}

const nanoid = customAlphabet("123456789QAZWSXEDCRFVTGBYHNUJMIKOLP", 8);

export async function login() {
  const oraModule = await import("ora");
  const ora = oraModule.default;

  const server = http.createServer();
  const { port } = await listen(server, 0, "127.0.0.1");

  const authPromise = new Promise<Record<string, string>>((resolve, reject) => {
    server.on("request", (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );

      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
      } else if (req.method === "GET") {
        const parsedUrl = url.parse(req.url as string, true);
        if (parsedUrl.query.cancelled) {
          res.writeHead(200);
          res.end();
          reject(new UserCancellationError("Login process cancelled by user."));
        } else {
          res.writeHead(200);
          res.end();
          resolve(parsedUrl.query as Record<string, string>);
        }
      } else {
        res.writeHead(405);
        res.end();
      }
    });
  });

  const redirect = `http://127.0.0.1:${port}`;
  const code = nanoid();
  const confirmationUrl = new URL(`${process.env.CLIENT_URL}/auth/devices`);
  confirmationUrl.searchParams.append("code", code);
  confirmationUrl.searchParams.append("redirect", redirect);

  console.log(`Confirmation code: ${pc.bold(code)}\n`);
  console.log(
    `If something goes wrong, copy and paste this URL into your browser:\n${pc.bold(confirmationUrl.toString())}\n`,
  );

  spawn("open", [confirmationUrl.toString()]);

  const spinner = ora("Waiting for authentication...\n").start();

  try {
    const authData = await authPromise;
    spinner.stop();
    writeToConfigFile(authData);
    console.log(pc.green("Authentication successful!"));
    console.log(`Config saved at: ~/ ${FILENAME}\n`);
    server.close();
    process.exit(0);
  } catch (error) {
    spinner.stop();
    if (error instanceof UserCancellationError) {
      console.log(pc.yellow("Authentication cancelled.\n"));
    } else {
      console.error(pc.red("Authentication failed:"), error);
    }
    server.close();
    process.exit(1);
  }
}
