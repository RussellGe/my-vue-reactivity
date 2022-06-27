import { hasChanged, isObject } from '../utils'
import type { ReactiveEffect } from './effect'
import { isTracking, trackEffect, triggerEffect } from './effect'
import { reactive, toRaw } from './reactive'

class RefImpl<T> {
  private _value: T
  private _rawValue: T
  public deps: Set<ReactiveEffect>
  public readonly __v_isRef = true
  constructor(val: T) {
    this._rawValue = val
    this._value = convert(val)
    this.deps = new Set()
  }

  get value() {
    trackRefEffect(this)
    return this._value
  }

  set value(val: any) {
    if (hasChanged(val, this._rawValue)) {
      this._rawValue = val
      this._value = convert(val)
      triggerRefEffect(this)
    }
  }
}

function convert(obj: any) {
  return isObject(obj) ? reactive(obj) : obj
}
function trackRefEffect(ref: RefImpl<any>) {
  if (isTracking())
    trackEffect(ref.deps)
}
function triggerRefEffect(ref: RefImpl<any>) {
  ref = toRaw(ref)
  if (ref.deps)
    triggerEffect(ref.deps)
}

export function ref(value: unknown) {
  return new RefImpl(value)
}
