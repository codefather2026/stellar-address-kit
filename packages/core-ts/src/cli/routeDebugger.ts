import { extractRouting, ExtractRoutingError } from "../routing/extract";
import type { KnownMemoType } from "../routing/types";

export type CliIo = {
  stdout: (message: string) => void;
  stderr: (message: string) => void;
};

const VALID_MEMO_TYPES: KnownMemoType[] = [
  "none",
  "id",
  "text",
  "hash",
  "return",
];

const HELP_TEXT = `Debug Stellar deposit routing from the command line.

Usage:
  stellar-route --dest <address> [--memo <value>] [--type <memoType>] [--source-account <account>]

Options:
  --dest <address>           Destination G-address or M-address
  --memo <value>             Memo value to test
  --type <memoType>          Memo type: none, id, text, hash, or return
  --source-account <account> Optional source account for completeness in routing input
  -h, --help                 Show this help message

Examples:
  stellar-route --dest G... --memo 123 --type id
  stellar-route --dest M... --memo customer-42 --type text
`;

type ParsedArgs = {
  dest: string;
  memo?: string;
  type: KnownMemoType;
  sourceAccount?: string;
};

function parseMemoType(rawValue: string): KnownMemoType {
  if (VALID_MEMO_TYPES.includes(rawValue as KnownMemoType)) {
    return rawValue as KnownMemoType;
  }

  throw new Error(
    `Invalid memo type "${rawValue}". Expected one of: ${VALID_MEMO_TYPES.join(", ")}.`
  );
}

function readValue(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];

  if (!value || value.startsWith("-")) {
    throw new Error(`Missing value for ${flag}.`);
  }

  return value;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    dest: "",
    type: "none",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--dest") {
      parsed.dest = readValue(argv, index, token);
      index += 1;
      continue;
    }

    if (token === "--memo") {
      parsed.memo = readValue(argv, index, token);
      index += 1;
      continue;
    }

    if (token === "--type") {
      parsed.type = parseMemoType(readValue(argv, index, token));
      index += 1;
      continue;
    }

    if (token === "--source-account") {
      parsed.sourceAccount = readValue(argv, index, token);
      index += 1;
      continue;
    }

    if (token === "-h" || token === "--help") {
      throw new Error("__HELP__");
    }

    throw new Error(`Unknown option: ${token}`);
  }

  if (!parsed.dest) {
    throw new Error("Missing required option --dest.");
  }

  return parsed;
}

export async function runRouteDebuggerCli(
  argv: string[],
  io: CliIo
): Promise<number> {
  try {
    const options = parseArgs(argv);

    if (options.memo !== undefined && options.type === "none") {
      throw new Error(
        '--memo requires --type to be one of "id", "text", "hash", or "return".'
      );
    }

    const result = extractRouting({
      destination: options.dest,
      memoType: options.type,
      memoValue: options.memo ?? null,
      sourceAccount: options.sourceAccount ?? null,
    });

    io.stdout(`${JSON.stringify(result, null, 2)}\n`);
    return 0;
  } catch (error) {
    if (error instanceof Error && error.message === "__HELP__") {
      io.stdout(HELP_TEXT);
      return 0;
    }

    const message =
      error instanceof ExtractRoutingError || error instanceof Error
        ? error.message
        : "Unknown CLI failure.";

    io.stderr(`${message}\n`);
    return 1;
  }
}
