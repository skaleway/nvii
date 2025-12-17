import {
  checkLoginStats,
  API_URLS,
  writeToConfigFile,
} from "@nvii/env-helpers";
import { listen } from "async-listen";
import { spawn } from "child_process";
import "dotenv/config";
import http from "http";
import { customAlphabet } from "nanoid";
import pc from "picocolors";
import url from "url";
import "dotenv/config";

// for local development only
class UserCancellationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserCancellationError";
  }
}

const nanoid = customAlphabet("123456789QAZWSXEDCRFVTGBYHNUJMIKOLP", 8);
const AUTH_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

// auth timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Authentication timed out."));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// auth session states (for preventing possible auth vulnerabilities)
type AuthSession = {
  code: string;
  expiresAt: number;
  used: boolean;
  boundIp: string | null;
};

let authSession: AuthSession | null = null;

// mask code helper function
function maskCode(code: string, visibleCount = 2): string {
  if (!code) return "";
  if (code.length <= visibleCount) return code; // too short, show all
  const visible = code.slice(0, visibleCount);
  return `${visible}...`;
}

export async function login() {
  const res = await checkLoginStats();
  if (res?.success) {
    return;
  }
  const oraModule = await import("ora");
  const ora = oraModule.default;

  const server = http.createServer();
  const { port } = await listen(server, 0, "127.0.0.1");

  const authPromise = new Promise<Record<string, string>>((resolve, reject) => {
    server.on("request", (req, res) => {
      if (!authSession) {
        res.writeHead(400);
        res.end("No active authentication session");
        return;
      }

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );

      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
      } else if (req.method === "GET") {
        const clientIp = req.socket.remoteAddress || "";
        // ip addresses to accept requests from (the clients ip address)
        const isLoopback =
          clientIp === "127.0.0.1" ||
          clientIp === "::1" ||
          clientIp === "::ffff:127.0.0.1";

        if (!isLoopback) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }

        // prevent auth code replay
        if (authSession.used) {
          res.writeHead(410);
          res.end("Authentication code already used");
          return;
        }

        const parsedUrl = url.parse(req.url as string, true);

        if (parsedUrl.query.cancelled) {
          res.writeHead(200);
          res.end();
          reject(new UserCancellationError("Login process cancelled by user."));
          return;
        }

        // fail if code has timedout
        if (Date.now() > authSession.expiresAt) {
          res.writeHead(408);
          res.end("Authentication expired");
          return;
        }
        // validate the code first
        const isValidCode = parsedUrl.query.authCode === authSession.code;
        if (!isValidCode) {
          res.writeHead(400);
          res.end();
          reject(new Error("Invalid otp code!"));
          return;
        }

        // now bind the IP (only after valid code)
        if (!authSession.boundIp) {
          authSession.boundIp = clientIp;
        } else if (authSession.boundIp !== clientIp) {
          res.writeHead(403);
          res.end("Client mismatch");
          return;
        }

        // success path
        authSession.used = true;
        res.writeHead(200);
        res.end();
        resolve(parsedUrl.query as Record<string, string>);
      } else {
        res.writeHead(405);
        res.end();
        reject(new UserCancellationError("Login process failed."));
      }
    });
  });

  const redirect = `http://127.0.0.1:${port}`;
  const code = nanoid();
  // initialize the auth session
  authSession = {
    code,
    expiresAt: Date.now() + AUTH_TIMEOUT_MS,
    used: false,
    boundIp: null,
  };

  const confirmationUrl = new URL(API_URLS.AUTH_DEVICES_URL);
  confirmationUrl.searchParams.append("code", code);
  confirmationUrl.searchParams.append("redirect", redirect);

  console.log(`Confirmation code: ${pc.bold(maskCode(code))}\n`);
  console.log(
    `If something goes wrong, copy and paste this URL into your browser:\n${pc.bold(confirmationUrl.toString())}\n`
  );

  spawn("open", [confirmationUrl.toString()]);

  const spinner = ora("Waiting for authentication...\n").start();

  try {
    const authData = await withTimeout(authPromise, AUTH_TIMEOUT_MS);
    spinner.stop();
    await writeToConfigFile(authData);
    console.log(pc.yellowBright("Authentication successful!\n"));
    server.close();
    process.exit(0);
  } catch (error: Error | any) {
    spinner.stop();
    server.close();
    if (error instanceof UserCancellationError) {
      console.log(pc.gray("Authentication cancelled.\n"));
      process.exit(0);
    }
    if (error.response) {
      console.error(pc.gray(`${error.response.data.error}\n`));
      process.exit(1);
    }

    console.error(pc.red("Authentication failed:"), error?.message ?? "", "\n");
    process.exit(1);
  } finally {
    // process.on("SIGINT", );
    // process.on("uncaughtException");
  }
}
