import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const setDefaultResultOrder = vi.fn();

vi.mock("node:dns", () => ({ setDefaultResultOrder }));

const ORIGINAL_RUNTIME = process.env.NEXT_RUNTIME;

beforeEach(() => {
  setDefaultResultOrder.mockClear();
});

afterEach(() => {
  if (ORIGINAL_RUNTIME === undefined) delete process.env.NEXT_RUNTIME;
  else process.env.NEXT_RUNTIME = ORIGINAL_RUNTIME;
});

describe("instrumentation register()", () => {
  it("forces ipv4first on the nodejs runtime", async () => {
    process.env.NEXT_RUNTIME = "nodejs";
    const { register } = await import("./instrumentation");
    await register();
    expect(setDefaultResultOrder).toHaveBeenCalledWith("ipv4first");
  });

  it("is a no-op outside the nodejs runtime", async () => {
    process.env.NEXT_RUNTIME = "edge";
    const { register } = await import("./instrumentation");
    await register();
    expect(setDefaultResultOrder).not.toHaveBeenCalled();
  });
});
