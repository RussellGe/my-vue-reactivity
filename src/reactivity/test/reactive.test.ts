import {
  reactive,
  isReactive,
  isProxy,
  readonly,
  isReadonly,
} from "../reactive";
import { describe, it, expect, vi } from "vitest";
describe("reactive", () => {
  it("happy path", () => {
    const user = {
      age: 10,
    };
    const observed = reactive(user);
    expect(observed).not.toBe(user);
    expect(observed.age).toBe(10);
    expect(isReactive(observed)).toBe(true);
    expect(isProxy(observed)).toBe(true);
    expect(isReactive(user)).toBe(false);
  });
  it("readonly", () => {
    console.warn = vi.fn();
    const user = {
      age: 10,
    };
    const observed = readonly(user);
    expect(observed).not.toBe(user);
    expect(isReadonly(observed)).toBe(true);
    expect(observed.age).toBe(10);
    observed.age = 12;
    expect(console.warn).toBeCalledTimes(1);
    expect(observed.age).toBe(10);
  });
  it("nested reactive", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
});
