// One-Line Office Jokes — one joke about the office printer, the one
// machine that can smell a deadline. It is written to stdout and to
// $MAKEFUN_OUTPUT_DIR/entry.txt (default /output/entry.txt). The file must
// hold exactly one line of 1-199 characters with no trailing newline.
// Stdlib only, no network, the same output on every run.
const { mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const JOKE =
  "The office printer only jams on the one document you actually need, five minutes before the meeting where your boss finally learns your name.";

const MAX_CHARS = 199;

function fail(message) {
  process.stderr.write(`error: ${message}\n`);
  process.exit(1);
}

const charCount = [...JOKE].length;

if (charCount === 0 || charCount > MAX_CHARS) {
  fail(`entry must be 1-${MAX_CHARS} characters, got ${charCount}`);
}
if (JOKE.includes("\n") || JOKE.trim().length === 0) {
  fail("entry must be a single non-blank line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), JOKE, "utf8");
process.stdout.write(JOKE + "\n");
