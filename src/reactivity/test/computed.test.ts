import { describe, expect, it, vi } from 'vitest'
import { computed } from '../computed'
import { effect, stop } from '../effect'
import { reactive } from '../reactive'

describe('computed', () => {
  it('happy path', () => {
    const obj = reactive({
      age: 10,
    })
    const double = computed(() => {
      return obj.age * 2
    })
    expect(double.value).toBe(20)
    obj.age++
    expect(double.value).toBe(22)
  })
  it('should be lazy', () => {
    const obj = reactive({
      age: 10,
    })
    const getter = vi.fn(() => {
      return obj.age * 2
    })
    const double = computed(getter)
    expect(getter).toBeCalledTimes(0)
    expect(double.value).toBe(20)
    double.value
    double.value
    expect(getter).toBeCalledTimes(1)
    obj.age++
    expect(getter).toBeCalledTimes(1)
    double.value
    expect(getter).toBeCalledTimes(2)
    expect(double.value).toBe(22)
  })
  it('should trigger effect', () => {
    const value = reactive({})
    const cValue = computed(() => value.foo)
    let dummy
    effect(() => {
      dummy = cValue.value
    })
    expect(dummy).toBe(undefined)
    value.foo = 1
    expect(dummy).toBe(1)
  })
  it('should work when chained', () => {
    const value = reactive({ foo: 0 })
    const c1 = computed(() => value.foo)
    const c2 = computed(() => c1.value + 1)
    expect(c2.value).toBe(1)
    expect(c1.value).toBe(0)
    value.foo++
    expect(c2.value).toBe(2)
    expect(c1.value).toBe(1)
  })
  it('should trigger effect when chained', () => {
    const value = reactive({ foo: 0 })
    const getter1 = vi.fn(() => value.foo)
    const getter2 = vi.fn(() => {
      return c1.value + 1
    })
    const c1 = computed(getter1)
    const c2 = computed(getter2)

    let dummy
    effect(() => {
      dummy = c2.value
    })
    expect(dummy).toBe(1)
    expect(getter1).toHaveBeenCalledTimes(1)
    expect(getter2).toHaveBeenCalledTimes(1)
    value.foo++
    expect(dummy).toBe(2)
    // should not result in duplicate calls
    expect(getter1).toHaveBeenCalledTimes(2)
    expect(getter2).toHaveBeenCalledTimes(2)
  })

  it.todo('should trigger effect when chained (mixed invocations)', () => {
    const value = reactive({ foo: 0 })
    const getter1 = vi.fn(() => value.foo)
    const getter2 = vi.fn(() => {
      return c1.value + 1
    })
    const c1 = computed(getter1)
    const c2 = computed(getter2)

    let dummy
    effect(() => {
      dummy = c1.value + c2.value
    })
    expect(dummy).toBe(1)

    expect(getter1).toHaveBeenCalledTimes(1)
    expect(getter2).toHaveBeenCalledTimes(1)
    value.foo++
    expect(c1.value).toBe(1)
    expect(c2.value).toBe(2)
    expect(dummy).toBe(3)
    // should not result in duplicate calls
    expect(getter1).toHaveBeenCalledTimes(2)
    expect(getter2).toHaveBeenCalledTimes(2)
  })
  it('should no longer update when stopped', () => {
    const value = reactive({})
    const cValue = computed(() => value.foo)
    let dummy
    effect(() => {
      dummy = cValue.value
    })
    expect(dummy).toBe(undefined)
    value.foo = 1
    expect(dummy).toBe(1)
    cValue.effect.stop()
    value.foo = 2
    expect(dummy).toBe(1)
  })
  it.todo('should support setter', () => {
    const n = ref(1)
    const plusOne = computed({
      get: () => n.value + 1,
      set: (val) => {
        n.value = val - 1
      },
    })

    expect(plusOne.value).toBe(2)
    n.value++
    expect(plusOne.value).toBe(3)

    plusOne.value = 0
    expect(n.value).toBe(-1)
  })
})
