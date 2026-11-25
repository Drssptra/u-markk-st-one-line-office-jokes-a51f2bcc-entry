// One-Line Office Jokes — resubmit v2.
//
// The entry is a single joke about the Monday meeting: the weekly ritual
// whose only output is scheduling the next one. The program assembles the
// joke from its clauses, validates it against the 1-199 character gate,
// and writes it (no trailing newline) to $MAKEFUN_OUTPUT_DIR/entry.txt
// (default /output/entry.txt), echoing it to stdout. Stdlib only, no
// network, deterministic on every run.

const fs = require("node:fs");
const path = require("node:path");

// Each clause is one breath of the joke; joined with a single space they
// form the exact entry text. Do not edit the wording.
const CLAUSES = [
  "I joined the Monday meeting to find out what we're doing this week,",
  "and the only decision was that we meet again on Tuesday.",
];

const GATE = Object.freeze({ min: 1, max: 199 });
const FALLBACK_OUTPUT_DIR = "/output";
const ENTRY_FILENAME = "entry.txt";

class EntryError extends Error {
  constructor(message) {
    super(message);
    this.name = "EntryError";
  }
}

function assembleEntry(clauses) {
  return clauses.join(" ");
}

function countChars(text) {
  // Spread counts Unicode code points, not UTF-16 units.
  return [...text].length;
}

function validateEntry(text) {
  const checks = [
    {
      ok: countChars(text) >= GATE.min && countChars(text) <= GATE.max,
      why: `entry must be ${GATE.min}-${GATE.max} characters, got ${countChars(text)}`,
    },
    {
      ok: !/[\r\n]/.test(text),
      why: "entry must be a single line (no CR or LF)",
    },
    {
      ok: text.trim().length > 0,
      why: "entry must not be blank",
    },
    {
      ok: text === text.trim(),
      why: "entry must not have leading or trailing whitespace",
    },
  ];
  for (const check of checks) {
    if (!check.ok) throw new EntryError(check.why);
  }
}

function resolveOutputDir() {
  const raw = process.env.MAKEFUN_OUTPUT_DIR;
  return raw && raw.trim().length > 0 ? raw : FALLBACK_OUTPUT_DIR;
}

function writeEntry(text, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const target = path.join(outDir, ENTRY_FILENAME);
  fs.writeFileSync(target, text, "utf8");
  const roundTrip = fs.readFileSync(target, "utf8");
  if (roundTrip !== text) {
    throw new EntryError("round-trip check failed: file content differs from entry");
  }
  return target;
}

function main() {
  try {
    const entry = assembleEntry(CLAUSES);
    validateEntry(entry);
    const target = writeEntry(entry, resolveOutputDir());
    process.stdout.write(`${entry}\n`);
    process.stderr.write(`wrote ${target} (${countChars(entry)} chars)\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`error: ${message}\n`);
    process.exit(1);
  }
}

main();
