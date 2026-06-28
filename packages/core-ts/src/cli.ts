#!/usr/bin/env node

import { runRouteDebuggerCli } from "./cli/routeDebugger";

declare const process: {
  argv: string[];
  stdout: { write: (message: string) => void };
  stderr: { write: (message: string) => void };
  exit: (code?: number) => never;
};

void (async () => {
  const exitCode = await runRouteDebuggerCli(process.argv.slice(2), {
    stdout: (message) => {
      process.stdout.write(message);
    },
    stderr: (message) => {
      process.stderr.write(message);
    },
  });

  process.exit(exitCode);
})();
