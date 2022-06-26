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
  it("oldVal and newVal in watch", () => {
    const user = reactive({
      age: 10,
    });
    let oldVal, newVal;
    watch(
      () => user.age,
      (n, o) => {
        newVal = n;
        oldVal = o;
      }
    );
    user.age++
    expect(oldVal).toBe(10)
    expect(newVal).toBe(11)
    user.age = 20
    expect(oldVal).toBe(11)
    expect(newVal).toBe(20)
  });
});
