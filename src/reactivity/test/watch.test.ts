import { describe, expect, it, vi } from "vitest";
import { reactive } from "../reactive";
import { watch } from "../watch";

describe("watch", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });
    const fn = vi.fn();
    watch(
      () => user.age,
      () => {
        fn();
      }
    );
    expect(fn).toBeCalledTimes(0);
    user.age++;
    expect(fn).toBeCalledTimes(1);
  });
});
