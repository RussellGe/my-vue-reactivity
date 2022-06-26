import { describe, expect, it, vi } from "vitest";
import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("happy path", () => {
    const obj = reactive({
      age: 10,
    });
    const double = computed(() => {
      return obj.age * 2;
    });
    expect(double.value).toBe(20);
    obj.age++;
    expect(double.value).toBe(22);
  });
  it("should be lazy", () => {
    const obj = reactive({
      age: 10,
    });
    const getter = vi.fn(() => {
      return obj.age * 2;
    });
    const double = computed(getter);
    expect(getter).toBeCalledTimes(0);
    expect(double.value).toBe(20);
    double.value;
    double.value
    expect(getter).toBeCalledTimes(1);
    obj.age++;
    expect(getter).toBeCalledTimes(1);
    double.value
    expect(getter).toBeCalledTimes(2);
    expect(double.value).toBe(22);
  });
});
