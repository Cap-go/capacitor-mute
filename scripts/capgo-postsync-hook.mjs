#!/usr/bin/env node
/**
 * Capgo `capacitor:sync:after` hook.
 *
 * Wired in package.json so it runs at the very end of `npx cap sync`
 * (see https://capacitorjs.com/docs/plugins/plugin-hooks). Fetches a single
 * postsync message from https://a0.capgo.app/v0 and prints it to the console.
 *
 * Placement:
 *   - Capacitor invokes sync hooks once per platform (android, ios, web).
 *     We want to print exactly ONCE, at the very end of the user's sync.
 *     We walk up the process tree to find the parent `cap` command, parse
 *     its argv, and figure out which platforms were actually requested:
 *       `cap sync`        → android, ios, web → last = web
 *       `cap sync ios`    → ios only          → last = ios
 *       `cap sync android`→ android only      → last = android
 *     We only print when CAPACITOR_PLATFORM_NAME matches the last one.
 *     If we can't read the parent (weird shell, sandboxed CI), we fall back
 *     to "print on web" and let the cooldown handle anything weird.
 *
 * Throttling:
 *   - In addition to the platform gate, we use a marker file in /tmp with a
 *     5-second cooldown so back-to-back syncs (or unexpected re-invocations)
 *     don't spam the user.
 *
 * Reporting (not skipping):
 *   - CI / non-TTY are NOT skipped. Instead we forward `ci` and `tty` as
 *     query params so the postsync endpoint can decide what to do.
 *
 * Safety:
 *   - Completely silent on any failure (network, parse, fs, …).
 *   - Never exits non-zero — must never break a consumer's `cap sync`.
 *   - 1.5s fetch timeout so it never hangs the build.
 *   - Honors hard opt-outs: CAPGO_NO_AD=1, ADBLOCK=1, DISABLE_OPENCOLLECTIVE=1.
 */

import { tmpdir, platform as osPlatform } from "node:os";
import { join } from "node:path";
import {
  statSync,
  utimesSync,
  closeSync,
  openSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { execFileSync } from "node:child_process";

const PLATFORM_ORDER = ["android", "ios", "web"];
const CAP_TOKEN = /\b(cap|capacitor)\b/;
const SYNC_VERB = /\bsync\b/;

const POSTSYNC_ENDPOINT = "https://a0.capgo.app/v0";
const MARKER_FILE = join(tmpdir(), "capgo-capacitor-mute-postsync-shown");
const COOLDOWN_MS = 5_000;
const FETCH_TIMEOUT_MS = 1_500;

function isOptedOut() {
  return (
    process.env.CAPGO_NO_AD === "1" ||
    process.env.ADBLOCK === "1" ||
    process.env.DISABLE_OPENCOLLECTIVE === "1"
  );
}

function withinCooldown() {
  try {
    const { mtimeMs } = statSync(MARKER_FILE);
    return Date.now() - mtimeMs < COOLDOWN_MS;
  } catch {
    return false;
  }
}

function touchMarker() {
  try {
    const fd = openSync(MARKER_FILE, "a");
    closeSync(fd);
    const now = new Date();
    utimesSync(MARKER_FILE, now, now);
  } catch {
    // ignore — worst case we show the message one extra time
  }
}

/**
 * Take a single snapshot of every process (pid, ppid, args) and return it as
 * a Map<pid, {ppid, args}>. We do this in ONE call so we never have to spawn
 * `ps` repeatedly while walking the tree, and we use width flags so the args
 * column is never truncated.
 *
 *   - linux: read /proc directly, no fork
 *   - darwin / *bsd: `ps -axww -o pid=,ppid=,args=`  (-ww = unlimited width)
 *   - win32: `wmic process get ProcessId,ParentProcessId,CommandLine`
 *
 * Returns an empty Map on any failure.
 */
function snapshotProcesses() {
  const plat = osPlatform();
  const map = new Map();
  try {
    if (plat === "linux") {
      for (const entry of readdirSync("/proc")) {
        if (!/^\d+$/.test(entry)) continue;
        const pid = Number(entry);
        try {
          const cmdline = readFileSync(`/proc/${entry}/cmdline`)
            .toString("utf8")
            .replace(/\0/g, " ")
            .trim();
          const status = readFileSync(`/proc/${entry}/status`, "utf8");
          const m = status.match(/^PPid:\s+(\d+)/m);
          map.set(pid, { ppid: m ? Number(m[1]) : 0, args: cmdline });
        } catch {
          // process exited between readdir and read — skip
        }
      }
      return map;
    }
    if (plat === "darwin" || plat === "freebsd" || plat === "openbsd") {
      // -axww  = all processes, all users, no width truncation
      // -o pid=,ppid=,args=  = no headers, just the columns we need
      const out = execFileSync(
        "ps",
        ["-axww", "-o", "pid=,ppid=,args="],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 16 * 1024 * 1024 },
      );
      for (const line of out.split("\n")) {
        const m = line.match(/^\s*(\d+)\s+(\d+)\s+(.*)$/);
        if (!m) continue;
        map.set(Number(m[1]), { ppid: Number(m[2]), args: m[3].trim() });
      }
      return map;
    }
    if (plat === "win32") {
      const out = execFileSync(
        "wmic",
        ["process", "get", "ProcessId,ParentProcessId,CommandLine", "/format:csv"],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 16 * 1024 * 1024 },
      );
      // CSV header: Node,CommandLine,ParentProcessId,ProcessId
      const lines = out.split(/\r?\n/);
      for (const line of lines) {
        if (!line.trim() || line.startsWith("Node,")) continue;
        // CommandLine itself can contain commas — split from the right.
        const lastComma = line.lastIndexOf(",");
        const secondLast = line.lastIndexOf(",", lastComma - 1);
        const firstComma = line.indexOf(",");
        if (lastComma < 0 || secondLast < 0 || firstComma < 0) continue;
        const args = line.slice(firstComma + 1, secondLast).trim();
        const ppid = Number(line.slice(secondLast + 1, lastComma));
        const pid = Number(line.slice(lastComma + 1));
        if (Number.isNaN(pid)) continue;
        map.set(pid, { ppid, args });
      }
      return map;
    }
  } catch {
    return map;
  }
  return map;
}

/**
 * Walk up the in-memory process tree from our parent looking for the cap
 * invocation. Returns its command line or null. Up to 8 hops because some
 * shells / tool wrappers can stack a few layers between us and cap.
 */
function findCapCommand() {
  const procs = snapshotProcesses();
  if (procs.size === 0) return null;

  let pid = process.ppid;
  const seen = new Set();
  for (let i = 0; i < 8 && pid && pid > 1 && !seen.has(pid); i++) {
    seen.add(pid);
    const entry = procs.get(pid);
    if (!entry) return null;
    if (CAP_TOKEN.test(entry.args) && SYNC_VERB.test(entry.args)) {
      return entry.args;
    }
    pid = entry.ppid;
  }
  return null;
}

/**
 * Given a cap command line, return the LAST platform cap will process.
 * `cap sync`            → web
 * `cap sync ios`        → ios
 * `cap sync android`    → android
 * `cap sync ios web`    → web
 * Returns null if we can't tell.
 */
function lastPlatformForCommand(cmd) {
  if (!cmd) return null;
  const tokens = cmd.split(/\s+/);
  const requested = tokens.filter((t) => PLATFORM_ORDER.includes(t));
  const set = requested.length > 0 ? new Set(requested) : new Set(PLATFORM_ORDER);
  for (let i = PLATFORM_ORDER.length - 1; i >= 0; i--) {
    if (set.has(PLATFORM_ORDER[i])) return PLATFORM_ORDER[i];
  }
  return null;
}

function buildUrl() {
  const url = new URL(POSTSYNC_ENDPOINT);
  url.searchParams.set("ci", process.env.CI ? "1" : "0");
  url.searchParams.set("tty", process.stdout.isTTY ? "1" : "0");
  if (process.env.CAPACITOR_PLATFORM_NAME) {
    url.searchParams.set("platform", process.env.CAPACITOR_PLATFORM_NAME);
  }
  return url;
}

async function fetchMessage() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(buildUrl(), { signal: controller.signal });
    if (!res.ok) return null;
    const body = await res.json();
    // Expected shape: { a: null } or { a: { a: string } }
    if (body && body.a && typeof body.a.a === "string") {
      return body.a.a;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  if (isOptedOut()) return;
  const currentPlatform = process.env.CAPACITOR_PLATFORM_NAME;
  // Detect what `cap` was actually asked to do, so we print after the real
  // last platform (handles `cap sync ios`, `cap sync android`, etc.).
  // If detection fails (sandboxed shell, weird wrapper), fall back to "web".
  const lastPlatform = lastPlatformForCommand(findCapCommand()) || "web";
  if (currentPlatform && currentPlatform !== lastPlatform) return;
  if (withinCooldown()) return;
  // Touch BEFORE printing so a Ctrl+C mid-print still counts toward cooldown.
  touchMarker();
  const text = await fetchMessage();
  if (!text) return;
  console.log("");
  console.log(text);
  console.log("");
}

main().catch(() => {});
