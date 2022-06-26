import { effect, ReactiveEffect, track, trigger } from "./effect";
import { toRaw } from "./reactive";

class ComputedRefImpl {
  private _getter;
  private _dirty: boolean = true;
  private _value: any;
  public effect: ReactiveEffect;
  constructor(getter: () => unknown) {
    this._getter = getter;
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        trigger(this, "value");
      }
    });
  }
  get value() {
    const self = toRaw(this);
    if (this._dirty) {
      this._value = this.effect.run();
      track(self, "value");
      this._dirty = false;
    }
    return self._value;
  }
  set value(val) {
    console.warn("computed data should not be set");
  }
}

export function computed(getter: () => unknown) {
  return new ComputedRefImpl(getter);
}
