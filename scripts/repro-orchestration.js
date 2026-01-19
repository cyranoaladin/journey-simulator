#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const STORAGE_PATH = process.argv[2] || path.join(__dirname, "../journey-simulator/test-results/.auth/user.json");
const ENDPOINT = process.env.MFAI_ORCHESTRATION_URL || "http://127.0.0.1:3002/orchestration";

function loadStorage(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function extractAccessToken(storageJson) {
  const origins = storageJson?.origins;
  if (!Array.isArray(origins)) {
    throw new Error("Invalid storage state: missing origins array");
  }
  for (const origin of origins) {
    const localStorage = origin?.localStorage;
    if (!Array.isArray(localStorage)) {
      continue;
    }
    for (const entry of localStorage) {
      if (entry?.name === "accessToken" && typeof entry.value === "string" && entry.value.length > 10) {
        return entry.value;
      }
    }
  }
  throw new Error("accessToken not found in storage state");
}

function decodeJwt(token) {
  const segments = token.split(".");
  if (segments.length < 2) {
    throw new Error("Invalid JWT format");
  }
  const payload = Buffer.from(segments[1], "base64").toString("utf8");
  return JSON.parse(payload);
}

async function main() {
  const storage = loadStorage(STORAGE_PATH);
  const accessToken = extractAccessToken(storage);
  const payload = decodeJwt(accessToken);
  const userId = payload?.id;
  if (!userId) {
    throw new Error("User ID missing from token payload");
  }

  const body = {
    input: "DAO plan deterministic smoke",
    userId,
    mode: "real",
    phase: "Learn"
  };

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "x-run-mode": "real"
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180000)
  });

  const text = await response.text();
  const snapshot = text.length > 1024 ? `${text.slice(0, 1024)}...` : text;

  const output = {
    endpoint: ENDPOINT,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    bodyPreview: snapshot
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error("{\n  \"error\": \"" + (error?.message || String(error)) + "\"\n}");
  process.exit(1);
});
