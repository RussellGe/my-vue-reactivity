import { describe, expect, it } from 'vitest'
import { computed } from '../computed'
import { effect } from '../effect'
import { isReactive, reactive } from '../reactive'
import type { Ref } from '../ref'
import { isRef, ref, unref } from '../ref'
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
  it('should unwrap nested ref in types', () => {
    const a = ref(0)
    const b = ref(a)

    expect(typeof (b.value + 1)).toBe('number')
  })
  it('should unwrap deep nested ref in types', () => {
    const a = ref(0)
    const b = ref(a)
    const c = ref(b)

    expect(typeof (c.value + 1)).toBe('number')
  })
  it('should unwrap nested values in types', () => {
    const a = {
      b: ref(0),
    }

    const c = ref(a)

    expect(typeof (c.value.b + 1)).toBe('number')
  })
  it('should NOT unwrap ref types nested inside arrays', () => {
    const arr = ref([1, ref(1)]).value
    ;(arr[0] as number)++
    ;(arr[1] as Ref<number>).value++

    const arr2 = ref([1, new Map<string, any>(), ref('1')]).value
    const value = arr2[0]
    if (isRef(value)) {
      `${value}foo`
    }
    else if (typeof value === 'number') {
      value + 1
    }
    else {
      // should narrow down to Map type
      // and not contain any Ref type
      value.has('foo')
    }
  })
  it('should keep tuple types', () => {
    const tuple: [number, string, { a: number }, () => number, Ref<number>] = [
      0,
      '1',
      { a: 1 },
      () => 0,
      ref(0),
    ]
    const tupleRef = ref(tuple)

    tupleRef.value[0]++
    expect(tupleRef.value[0]).toBe(1)
    tupleRef.value[1] += '1'
    expect(tupleRef.value[1]).toBe('11')
    tupleRef.value[2].a++
    expect(tupleRef.value[2].a).toBe(2)
    expect(tupleRef.value[3]()).toBe(0)
    tupleRef.value[4].value++
    expect(tupleRef.value[4].value).toBe(1)
  })

  it.todo('should keep symbols', () => {
    const customSymbol = Symbol('custom')
    const obj = {
      [Symbol.asyncIterator]: ref(1),
      [Symbol.hasInstance]: { a: ref('a') },
      [Symbol.isConcatSpreadable]: { b: ref(true) },
      [Symbol.iterator]: [ref(1)],
      [Symbol.match]: new Set<Ref<number>>(),
      [Symbol.matchAll]: new Map<number, Ref<string>>(),
      [Symbol.replace]: { arr: [ref('a')] },
      [Symbol.search]: { set: new Set<Ref<number>>() },
      [Symbol.species]: { map: new Map<number, Ref<string>>() },
      [Symbol.split]: new WeakSet<Ref<boolean>>(),
      [Symbol.toPrimitive]: new WeakMap<Ref<boolean>, string>(),
      [Symbol.toStringTag]: { weakSet: new WeakSet<Ref<boolean>>() },
      [Symbol.unscopables]: { weakMap: new WeakMap<Ref<boolean>, string>() },
      [customSymbol]: { arr: [ref(1)] },
    }

    const objRef = ref(obj)

    const keys: (keyof typeof obj)[] = [
      Symbol.asyncIterator,
      Symbol.hasInstance,
      Symbol.isConcatSpreadable,
      Symbol.iterator,
      Symbol.match,
      Symbol.matchAll,
      Symbol.replace,
      Symbol.search,
      Symbol.species,
      Symbol.split,
      Symbol.toPrimitive,
      Symbol.toStringTag,
      Symbol.unscopables,
      customSymbol,
    ]

    keys.forEach((key) => {
      console.log(key)
      expect(objRef.value[key]).toStrictEqual(obj[key])
    })
  })

  it('unref', () => {
    expect(unref(1)).toBe(1)
    expect(unref(ref(1))).toBe(1)
  })
  it('isRef', () => {
    expect(isRef(ref(1))).toBe(true)
    expect(isRef(computed(() => 1))).toBe(true)

    expect(isRef(0)).toBe(false)
    expect(isRef(1)).toBe(false)
    // an object that looks like a ref isn't necessarily a ref
    expect(isRef({ value: 0 })).toBe(false)
  })
})
