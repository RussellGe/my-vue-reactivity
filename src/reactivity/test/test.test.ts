import { describe, it, expect } from "vitest";
import {reactive} from 'vue'
describe('vue test', () => {
    it('should not pollute original object with Proxies', () => {
        const original: any = { foo: 1 }
        const original2 = { bar: 2 }
        const observed = reactive(original)
        const observed2 = reactive(original2)
        observed.bar = observed2
        expect(observed.bar).toBe(observed2)
        expect(original.bar).toBe(original2)
      })
})