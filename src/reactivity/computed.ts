import { effect, ReactiveEffect } from "./effect";

class ComputedRefImpl {
  private _getter;
  private _dirty: boolean = true;
  private _value: any;
  private _effect: ReactiveEffect;
  constructor(getter: () => unknown) {
    this._getter = getter;
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }
  get value() {
    if (this._dirty) {
      this._value = this._effect.run();
      this._dirty = false;
    }
    return this._value;
  }
  set value(val) {
    console.warn("computed data should not be set");
  }
}

export function computed(getter: () => unknown) {
  return new ComputedRefImpl(getter);
}
