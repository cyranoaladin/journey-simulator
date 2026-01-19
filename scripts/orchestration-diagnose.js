#!/usr/bin/env node
"use strict";

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const backendDir = path.join(projectRoot, "mf-back");
const storagePath = path.join(projectRoot, "journey-simulator/test-results/.auth/user.json");
const artifactsDir = path.join(projectRoot, "artifacts");
const reproReportPath = path.join(artifactsDir, "orchestration-repro.md");
const backendLogPath = path.join(artifactsDir, "backend-orchestration-500.log");

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      return;
    }
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
}

loadEnvFile(path.join(backendDir, ".env"));

if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

function decodeBase64Url(segment) {
  const padded = segment.padEnd(segment.length + (4 - (segment.length % 4)) % 4, "=");
  const normalized = padded.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function extractTokenAndUser() {
  const raw = fs.readFileSync(storagePath, "utf8");
  const json = JSON.parse(raw);
  const origins = Array.isArray(json.origins) ? json.origins : [];
  for (const origin of origins) {
    const entries = origin?.localStorage;
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (entry?.name === "accessToken" && typeof entry.value === "string") {
        const token = entry.value;
        const payloadSegment = token.split(".")[1];
        if (!payloadSegment) {
          throw new Error("Invalid accessToken format");
        }
        const payloadJson = decodeBase64Url(payloadSegment);
        const payload = JSON.parse(payloadJson);
        if (!payload?.id) {
          throw new Error("User ID missing in JWT payload");
        }
        return { token, userId: payload.id };
      }
    }
  }
  throw new Error("accessToken not found in storage state");
}

async function waitForServerReady(server) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Backend did not start within 15s"));
    }, 15000);

    const onData = (chunk) => {
      const text = chunk.toString();
      if (text.includes("Listening on port")) {
        clearTimeout(timeout);
        server.stdout.off("data", onData);
        resolve();
      }
    };

    server.stdout.on("data", onData);
    server.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      if (text.toLowerCase().includes("error")) {
        // keep collecting but surface early signals
        console.error(`[backend:stderr] ${text.trim()}`);
      }
    });
    server.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function performRequest({ token, userId }, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  try {
    const response = await fetch("http://127.0.0.1:3002/orchestration", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-run-mode": "real",
      },
      body: JSON.stringify({
        input: "DAO plan deterministic smoke",
        userId,
        mode: "real",
        phase: "Learn",
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const durationMs = Date.now() - startedAt;
    const text = await response.text();
    const preview = text.length > 1024 ? `${text.slice(0, 1024)}...` : text;
    return {
      status: response.status,
      ok: response.ok,
      durationMs,
      bodyPreview: preview,
    };
  } catch (error) {
    clearTimeout(timer);
    const durationMs = Date.now() - startedAt;
    return {
      status: null,
      ok: false,
      durationMs,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log("[diag] Spawning backend server...");
  const server = spawn("node", ["./bin/www"], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: process.env.PORT || "3002",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const collectedLogs = [];
  const appendLog = (prefix, chunk) => {
    const text = chunk.toString();
    process.stdout.write(`[${prefix}] ${text}`);
    text.split(/\r?\n/).forEach((line) => {
      if (line.trim().length > 0) {
        collectedLogs.push(`[${new Date().toISOString()}] [${prefix}] ${line}`);
      }
    });
  };

  server.stdout.on("data", (chunk) => appendLog("stdout", chunk));
  server.stderr.on("data", (chunk) => appendLog("stderr", chunk));

  try {
    await waitForServerReady(server);
    console.log("[diag] Backend ready. Extracting auth token...");
    const auth = extractTokenAndUser();

    console.log("[diag] Performing request with 10s timeout (mirrors UI AbortController)...");
    const abortResult = await performRequest(auth, 10_000);
    console.log("[diag] Abort-mode result:", abortResult);

    console.log("[diag] Performing request with 3 min timeout...");
    const longResult = await performRequest(auth, 180_000);
    console.log("[diag] Long-mode result:", longResult);

    const reproReport = `# Orchestration Reproduction\n\n- Timestamp: ${new Date().toISOString()}\n- Endpoint: http://127.0.0.1:3002/orchestration\n\n## Request Payload\n\n\`\`\`json\n${JSON.stringify({ input: "DAO plan deterministic smoke", mode: "real", phase: "Learn" }, null, 2)}\n\`\`\`\n\n## Results\n\n### Abort after 10s\n\n\`\`\`json\n${JSON.stringify(abortResult, null, 2)}\n\`\`\`\n\n### Allow up to 180s\n\n\`\`\`json\n${JSON.stringify(longResult, null, 2)}\n\`\`\`\n`;
    fs.writeFileSync(reproReportPath, reproReport, "utf8");
    fs.writeFileSync(backendLogPath, collectedLogs.join("\n"), "utf8");
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error("[diag] Failure:", error);
  process.exitCode = 1;
});
