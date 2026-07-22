import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const source = await readFile(new URL("../dist/backend.js", import.meta.url), "utf8")
const checks = [
  ["filesystem module access", /(?:from\s*["'`](?:node:)?fs(?:\/promises)?["'`]|require\s*\(\s*["'`](?:node:)?fs(?:\/promises)?["'`]\s*\)|import\s*\(\s*["'`](?:node:)?fs(?:\/promises)?["'`]\s*\))/],
  ["subprocess module access", /(?:from\s*["'`](?:node:)?child_process["'`]|require\s*\(\s*["'`](?:node:)?child_process["'`]\s*\)|import\s*\(\s*["'`](?:node:)?child_process["'`]\s*\))/],
  ["direct socket module access", /(?:from\s*["'`](?:node:)?(?:net|tls|dgram|http|https)["'`]|require\s*\(\s*["'`](?:node:)?(?:net|tls|dgram|http|https)["'`]\s*\)|import\s*\(\s*["'`](?:node:)?(?:net|tls|dgram|http|https)["'`]\s*\))/],
  ["worker or cluster module access", /(?:from\s*["'`](?:node:)?(?:worker_threads|cluster)["'`]|require\s*\(\s*["'`](?:node:)?(?:worker_threads|cluster)["'`]\s*\)|import\s*\(\s*["'`](?:node:)?(?:worker_threads|cluster)["'`]\s*\))/],
  ["direct SQLite module access", /(?:from\s*["'`](?:bun:sqlite|node:sqlite)["'`]|require\s*\(\s*["'`](?:bun:sqlite|node:sqlite)["'`]\s*\)|import\s*\(\s*["'`](?:bun:sqlite|node:sqlite)["'`]\s*\))/],
  ["dangerous Bun system API usage", /\bBun\.(?:file|write|spawn|spawnSync|serve|connect|listen)\b/],
  ["dangerous process API usage", /\bprocess\.(?:env|exit|kill|chdir|dlopen)\b/],
  ["dynamic code execution", /\beval\s*\(|\bFunction\s*\(/],
  ["base64 decoding", /\bBuffer\.from\s*\([^)]*["'`]base64["'`]/],
]

const blocked = checks.filter(([, pattern]) => pattern.test(source)).map(([label]) => label)
assert.deepEqual(blocked, [])
assert.match(source, /showCompletionToast\s*===\s*true/)
assert.match(source, /\/Output\//)
console.log("backend safety patterns: clear")
