import { describe, expect, it, vi } from 'vitest'
import { effect } from '../effect'
import { flushJobs, queueJobs } from '../nextTick'
import { reactive } from '../reactive'

describe('nexttick', () => {
  it('happy path', () => {
    const a = reactive({
      age: 10,
    })
    const fn = vi.fn()
    const effectFn = effect(
      () => {
        fn()
        console.log(a.age)
      },
      {
        scheduler() {
          queueJobs(effectFn)
          flushJobs()
        },
      },
    )
    a.age++
    a.age++
    a.age++
    a.age++
    a.age++
    a.age++
    a.age++
    setTimeout(() => {
      expect(fn).toBeCalledTimes(2)
    }, 0)
  })
})
