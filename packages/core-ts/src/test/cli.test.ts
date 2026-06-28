import { describe, expect, it } from "vitest";
import { encodeMuxed } from "../muxed/encode";
import { runRouteDebuggerCli } from "../cli/routeDebugger";

const G_ADDRESS =
  "GAYCUYT553C5LHVE2XPW5GMEJT4BXGM7AHMJWLAPZP53KJO7EIQADRSI";
const M_ADDRESS = encodeMuxed(G_ADDRESS, 42n);

function createIo() {
  const stdout: string[] = [];
  const stderr: string[] = [];

  return {
    stdout,
    stderr,
    io: {
      stdout: (message: string) => {
        stdout.push(message);
      },
      stderr: (message: string) => {
        stderr.push(message);
      },
    },
  };
}

describe("stellar-route CLI", () => {
  it("prints a RoutingResult as pretty JSON for a G-address memo-id", async () => {
    const { io, stdout, stderr } = createIo();

    const exitCode = await runRouteDebuggerCli(
      ["--dest", G_ADDRESS, "--memo", "007", "--type", "id"],
      io
    );

    expect(exitCode).toBe(0);
    expect(stderr).toEqual([]);

    const result = JSON.parse(stdout.join(""));
    expect(result.destinationBaseAccount).toBe(G_ADDRESS);
    expect(result.routingId).toBe("7");
    expect(result.routingSource).toBe("memo");
    expect(result.warnings).toHaveLength(1);
  });

  it("routes from the muxed address and ignores conflicting memo routing", async () => {
    const { io, stdout } = createIo();

    const exitCode = await runRouteDebuggerCli(
      ["--dest", M_ADDRESS, "--memo", "99999", "--type", "id"],
      io
    );

    expect(exitCode).toBe(0);

    const result = JSON.parse(stdout.join(""));
    expect(result.destinationBaseAccount).toBe(G_ADDRESS);
    expect(result.routingId).toBe("42");
    expect(result.routingSource).toBe("muxed");
    expect(result.warnings[0].code).toBe("MEMO_PRESENT_WITH_MUXED");
  });

  it("returns a helpful error when --memo is supplied without a memo type", async () => {
    const { io, stdout, stderr } = createIo();

    const exitCode = await runRouteDebuggerCli(
      ["--dest", G_ADDRESS, "--memo", "123"],
      io
    );

    expect(exitCode).toBe(1);
    expect(stdout).toEqual([]);
    expect(stderr.join("")).toContain("--memo requires --type");
  });

  it("returns a helpful error for unsupported memo types", async () => {
    const { io, stdout, stderr } = createIo();

    const exitCode = await runRouteDebuggerCli(
      ["--dest", G_ADDRESS, "--type", "memo-id"],
      io
    );

    expect(exitCode).toBe(1);
    expect(stdout).toEqual([]);
    expect(stderr.join("")).toContain("Invalid memo type");
  });
});
