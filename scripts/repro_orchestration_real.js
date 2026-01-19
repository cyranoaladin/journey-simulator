#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const projectRoot = path.join(__dirname, "..");
const storageStatePath = path.join(projectRoot, "journey-simulator/test-results/.auth/user.json");
const artifactsDir = path.join(projectRoot, "artifacts");
const reproArtifactPath = path.join(artifactsDir, "orchestration-repro.md");
const backendLogPath = path.join(artifactsDir, "backend-orchestration-500.log");
const backendDir = path.join(projectRoot, "mf-back");

const endpoint = process.env.MFAI_ORCHESTRATION_URL || "http://127.0.0.1:3002/orchestration";
const requestMode = "real";
const timeoutMs = Number.parseInt(process.env.MFAI_ORCHESTRATION_TIMEOUT ?? "30000", 10);
const spawnBackend = process.env.MFAI_SPAWN_BACKEND !== "false";

// Parse CLI arguments for --prompt
const args = process.argv.slice(2);
const promptArgIndex = args.indexOf('--prompt');
const orchestrationInput = promptArgIndex !== -1 && args[promptArgIndex + 1]
  ? args[promptArgIndex + 1]
  : (process.env.MFAI_ORCHESTRATION_INPUT || "Validate orchestrator deterministic response");


function ensureArtifactsFolder() {
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function readStorageState(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Storage state not found at ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function decodeBase64Url(segment) {
  const padded = segment.padEnd(segment.length + (4 - (segment.length % 4)) % 4, "=");
  const normalized = padded.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function extractAuth(storageJson) {
  const origins = Array.isArray(storageJson?.origins) ? storageJson.origins : [];
  for (const origin of origins) {
    const localStorageEntries = Array.isArray(origin?.localStorage) ? origin.localStorage : [];
    let accessToken;
    let runMode;
    for (const entry of localStorageEntries) {
      if (entry?.name === "accessToken" && typeof entry.value === "string") {
        accessToken = entry.value;
      }
      if (entry?.name === "mfai-run-mode" && typeof entry.value === "string") {
        runMode = entry.value;
      }
    }

    if (accessToken) {
      const segments = accessToken.split(".");
      if (segments.length < 2) {
        throw new Error("Invalid JWT format extracted from storage state");
      }
      const payloadJson = decodeBase64Url(segments[1]);
      const payload = JSON.parse(payloadJson);
      const userId = payload?.id;
      if (!userId) {
        throw new Error("User ID missing inside token payload");
      }

      return {
        accessToken,
        userId,
        runMode: runMode || requestMode,
      };
    }
  }

  throw new Error("accessToken not found in storage state");
}

function redact(value) {
  if (!value) return value;
  if (typeof value !== "string") return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function waitForBackendReady(child) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Backend did not emit readiness message within 20s"));
    }, 20000);

    const onStdout = (chunk) => {
      const text = chunk.toString();
      if (text.includes("Listening on port")) {
        clearTimeout(timer);
        child.stdout.off("data", onStdout);
        resolve();
      }
    };

    child.stdout.on("data", onStdout);
    child.stderr.on("data", (chunk) => {
      // Surface backend errors in real time
      process.stderr.write(`[backend:stderr] ${chunk}`);
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

async function performRequest({ accessToken, userId, runMode: storedMode }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();

  const body = {
    input: orchestrationInput,
    userId,
    mode: storedMode || requestMode,
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "x-run-mode": storedMode || requestMode,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const durationMs = Date.now() - started;
    const text = await response.text();
    const preview = text.length > 1200 ? `${text.slice(0, 1200)}…` : text;

    return {
      kind: "success",
      status: response.status,
      durationMs,
      bodyPreview: preview,
    };
  } catch (error) {
    const durationMs = Date.now() - started;
    return {
      kind: "error",
      durationMs,
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "UnknownError",
    };
  } finally {
    clearTimeout(timer);
  }
}

function writeArtifacts(resultSummary, backendLogs) {
  const timestamp = new Date().toISOString();
  const hash = crypto.createHash("sha256").update(JSON.stringify(resultSummary)).digest("hex").slice(0, 12);
  const content = `# Orchestration Reproduction (REAL)

- Timestamp: ${timestamp}
- Endpoint: ${endpoint}
- Timeout Budget: ${timeoutMs} ms
- Result Hash: ${hash}

## Request Headers

- Authorization: Bearer ${redact(resultSummary.accessToken)}
- x-run-mode: ${resultSummary.headers["x-run-mode"]}
- Content-Type: ${resultSummary.headers["Content-Type"]}

## Payload

\`\`\`json
${JSON.stringify(resultSummary.payload, null, 2)}
\`\`\`

## Outcome

\`\`\`json
${JSON.stringify(resultSummary.outcome, null, 2)}
\`\`\`
`;

  fs.writeFileSync(reproArtifactPath, content, "utf8");

  if (backendLogs.length) {
    fs.writeFileSync(backendLogPath, backendLogs.join("\n"), "utf8");
  }
}

async function main() {
  ensureArtifactsFolder();

  const storageJson = readStorageState(storageStatePath);
  const auth = extractAuth(storageJson);

  let backendProcess;
  const collectedLogs = [];

  if (spawnBackend) {
    loadEnvFile(path.join(backendDir, ".env"));
    backendProcess = spawn("node", ["./bin/www"], {
      cwd: backendDir,
      env: {
        ...process.env,
        PORT: process.env.MFAI_BACKEND_PORT || "3002",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const capture = (kind, chunk) => {
      const text = chunk.toString();
      process.stdout.write(`[backend:${kind}] ${text}`);
      text.split(/\r?\n/).forEach((line) => {
        if (line.trim().length > 0) {
          collectedLogs.push(`[${new Date().toISOString()}] [${kind}] ${line}`);
        }
      });
    };

    backendProcess.stdout.on("data", (chunk) => capture("stdout", chunk));
    backendProcess.stderr.on("data", (chunk) => capture("stderr", chunk));

    await waitForBackendReady(backendProcess);
  }

  const outcome = await performRequest(auth);

  const summary = {
    endpoint,
    timeoutMs,
    payload: {
      input: orchestrationInput,
      userId: auth.userId,
      mode: auth.runMode || requestMode,
    },
    headers: {
      "Content-Type": "application/json",
      "x-run-mode": auth.runMode || requestMode,
    },
    accessToken: auth.accessToken,
    outcome,
  };

  console.log(JSON.stringify({
    endpoint,
    timeoutMs,
    userId: auth.userId,
    runMode: auth.runMode,
    outcome,
  }, null, 2));

  writeArtifacts(summary, collectedLogs);

  if (backendProcess) {
    backendProcess.kill();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ error: error?.message || String(error) }, null, 2));
  process.exitCode = 1;
});
