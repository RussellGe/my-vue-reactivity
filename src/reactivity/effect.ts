let activeEffect: ReactiveEffect | undefined;
let shouldTrack = false;
const effectFnStack: Array<myFunction> = [];
const bucket = new WeakMap();
type myFunction = () => unknown;
interface Options {
  scheduler?: myFunction;
}
export class ReactiveEffect {
  private _fn: myFunction;
  public scheduler: myFunction | undefined;
  public deps: Array<Set<myFunction>> = [];
  active = true;
  onStop?: () => void;
  constructor(fn: myFunction, scheduler: myFunction | undefined) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    if (!this.active) {
      return this._fn();
    }
    shouldTrack = true;
    activeEffect = this;
    const result = this._fn();
    shouldTrack = false;
    activeEffect = undefined;
    return result;
  }
}
export function track(
  target: Record<string, any>,
  key: string | number | symbol
) {
  if (!activeEffect) return;
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set<myFunction>()));
  }
  deps.add(activeEffect);
}

export function trigger(
  target: Record<string, any>,
  key: string | number | symbol
) {
  let depsMap = bucket.get(target);
  if (!depsMap) return;
  let deps = depsMap.get(key);
  console.log(deps);
  deps.forEach((fn: ReactiveEffect) => fn.run());
}
export function effect(fn: myFunction, options?: Options) {
  const _effect = new ReactiveEffect(fn, options?.scheduler);

  _effect.run();

  const runner = _effect.run.bind(_effect);
  return runner;
}
