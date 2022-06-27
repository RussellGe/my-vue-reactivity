import { describe, expect, it } from 'vitest'
import { effect } from '../effect'
import { reactive } from '../reactive'
import { ref } from '../ref'
describe.only('ref', () => {
  it('should hold a value', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
    a.value = 2
    expect(a.value).toBe(2)
  })
  it.only('should be reactive', () => {
    const a = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    a.value = 2
    expect(dummy).toBe(2)
    expect(calls).toBe(2)
    // same value should not trigger
    a.value = 2
    // expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })
  it('should work without initial value', () => {
    const a = ref()
    let dummy
    effect(() => {
      dummy = a.value
    })
    expect(dummy).toBe(undefined)
    a.value = 2
    expect(dummy).toBe(2)
  })
  it.only('should work like a normal property when nested in a reactive object', () => {
    const a = ref(1)
    const obj = reactive({
      a,
      b: {
        c: a,
      },
    })

    let dummy1: number
    let dummy2: number

    effect(() => {
      dummy1 = obj.a
      dummy2 = obj.b.c
    })

    const assertDummiesEqualTo = (val: number) =>
      [dummy1, dummy2].forEach(dummy => expect(dummy).toBe(val))

    assertDummiesEqualTo(1)
    a.value++
    assertDummiesEqualTo(2)
    obj.a++
    console.log(obj.a, obj.b.c)
    assertDummiesEqualTo(3)
    obj.b.c++
    assertDummiesEqualTo(4)
  })
})
