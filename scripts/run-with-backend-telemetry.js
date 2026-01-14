#!/usr/bin/env node
"use strict";

/**
 * Wrapper script to run orchestration repro WITH backend spawning and log capture
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const backendDir = path.join(projectRoot, "mf-back");
const artifactsDir = path.join(projectRoot, "artifacts");
const backendLogPath = path.join(artifactsDir, "backend-raw.log");
const telemetryNdjsonPath = path.join(artifactsDir, "orchestration-telemetry.ndjson");

const prompt = process.argv[2] || "PROMPT_A_UNIQUE_CACHE_MISS_TEST";
const timeout = process.argv[3] || "200000";

console.log(`[wrapper] Starting backend with log capture...`);
console.log(`[wrapper] Prompt: ${prompt}`);
console.log(`[wrapper] Timeout: ${timeout}ms`);

// Ensure artifacts dir exists
if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
}

// Start backend
const backendProcess = spawn("npm", ["run", "dev"], {
    cwd: backendDir,
    env: { ...process.env, PORT: "3002" },
    stdio: ["ignore", "pipe", "pipe"],
});

const backendLogStream = fs.createWriteStream(backendLogPath, { flags: "a" });

backendProcess.stdout.on("data", (chunk) => {
    backendLogStream.write(chunk);
    process.stdout.write(`[backend:stdout] ${chunk}`);
});

backendProcess.stderr.on("data", (chunk) => {
    backendLogStream.write(chunk);
    process.stderr.write(`[backend:stderr] ${chunk}`);
});

// Wait for backend ready
console.log(`[wrapper] Waiting for backend to be ready...`);
setTimeout(() => {
    console.log(`[wrapper] Backend should be ready, running repro script...`);

    const reproProcess = spawn("node", [
        path.join(projectRoot, "scripts/repro_orchestration_real.js"),
        "--prompt",
        prompt
    ], {
        cwd: projectRoot,
        env: {
            ...process.env,
            MFAI_SPAWN_BACKEND: "false",
            MFAI_ORCHESTRATION_TIMEOUT: timeout,
        },
        stdio: "inherit",
    });

    reproProcess.on("close", (code) => {
        console.log(`[wrapper] Repro script exited with code ${code}`);

        // Extract NDJSON from backend logs
        console.log(`[wrapper] Extracting NDJSON from backend logs...`);
        const backendLogs = fs.readFileSync(backendLogPath, "utf8");
        const jsonLines = backendLogs
            .split("\n")
            .filter(line => {
                try {
                    const parsed = JSON.parse(line);
                    return parsed.type && parsed.type.startsWith("orchestration_");
                } catch {
                    return false;
                }
            });

        fs.writeFileSync(telemetryNdjsonPath, jsonLines.join("\n") + "\n", "utf8");
        console.log(`[wrapper] Extracted ${jsonLines.length} NDJSON lines to ${telemetryNdjsonPath}`);

        // Kill backend
        backendProcess.kill();
        backendLogStream.end();
        process.exit(code);
    });
}, 5000);

backendProcess.on("error", (err) => {
    console.error(`[wrapper] Backend error:`, err);
    process.exit(1);
});
