let activeEffect: ReactiveEffect | undefined;
let shouldTrack = false;
const effectFnStack: Array<ReactiveEffect> = [];
const bucket = new WeakMap();
type myFunction = () => unknown;
interface Options {
  scheduler?: myFunction;
  lazy?: boolean;
}
export class ReactiveEffect {
  private _fn: myFunction;
  public scheduler: myFunction | undefined;
  public deps: Array<Set<ReactiveEffect>> = [];
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
    cleanup(this);
    console.log("run");
    shouldTrack = true;
    activeEffect = this;
    effectFnStack.push(activeEffect);
    const result = this._fn();
    shouldTrack = false;
    effectFnStack.pop();
    activeEffect = effectFnStack[effectFnStack.length - 1];
    return result;
  }
  stop() {
    if (this.active) {
      cleanup(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

// export function isTracking() {
//   console.log(shouldTrack)
//   return shouldTrack && activeEffect !== undefined;
// }

// 清除依赖函数 在它所有相关的deps里清除它
function cleanup(effect: ReactiveEffect) {
  if (effect.deps.length) {
    for (let i = 0; i < effect.deps.length; i++) {
      effect.deps[i].delete(effect);
    }
    effect.deps.length = 0;
  }

  // console.log(effect);
}
export interface ReactiveEffectRunner<T = any> {
  (): T
  effect: ReactiveEffect
}
export function stop(runner: ReactiveEffectRunner) {
  runner.effect.stop();
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
    depsMap.set(key, (deps = new Set<ReactiveEffect>()));
  }
  deps.add(activeEffect);

  // console.log(key, "deps", deps.size);
  activeEffect.deps.push(deps);
}

export function trigger(
  target: Record<string, any>,
  key: string | number | symbol
) {
  let depsMap = bucket.get(target);
  if (!depsMap) return;
  let effects = depsMap.get(key);
  const effectsToRun = new Set<ReactiveEffect>();
  if (!effects) return;
  effects.forEach((fn: ReactiveEffect) => {
    if (fn !== activeEffect) {
      effectsToRun.add(fn);
    }
  });
  // console.log(effectsToRun);
  effectsToRun.forEach((effect) => {
    if (!effect.scheduler) {
      effect.run();
    } else {
      effect.scheduler();
    }
  });
}
export function effect(fn: myFunction, options?: Options) {
  const _effect = new ReactiveEffect(fn, options?.scheduler);
  if (!options?.lazy) {
    _effect.run();
  }

  const runner = _effect.run.bind(_effect);
  return runner;
}
