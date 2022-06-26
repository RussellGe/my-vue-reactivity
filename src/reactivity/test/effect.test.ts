import { reactive } from "../reactive";
import { effect } from "../effect";
import { describe, it, expect, vi } from "vitest";
import { effect as v_effect, reactive as v_reactive } from "vue";
describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);
    user.age = 20;
    expect(nextAge).toBe(21);
  });
  it("self add avoid loop", () => {
    const user = reactive({
      age: 10,
      name: "russ",
    });
    effect(() => {
      console.log(user.name);
      user.age++;
    });
    expect(user.name).toBe("russ");
    expect(user.age).toBe(11);
  });
  it("conditional effect", () => {
    console.warn = vi.fn();
    const user = reactive({
      ok: true,
      age: 10,
    });
    effect(() => {
      console.warn(user.ok ? user.age : "hhh");
    });
    user.ok = false;
    user.age = 11;
    user.age = 12;
    expect(user.age).toBe(12);
    expect(console.warn).toBeCalledTimes(2);
  });
  it("nested effect", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const user = reactive({
      foo: 1,
      bar: 1,
    });

    effect(() => {
      fn1();
      effect(function f2() {
        fn2();
        console.log("bar", user.bar);
      });
      console.log("foo", user.foo);
    });

    user.foo++;
    user.bar++;

    const v_user = v_reactive({
      foo: 1,
      bar: 1,
    });
    v_effect(() => {
      v_effect(function f2() {
        console.log("v_bar", v_user.bar);
      });
      console.log("v_foo", v_user.foo);
    });
    v_user.foo++;
    v_user.foo++;
    v_user.foo++;
    v_user.foo++;
    v_user.foo++;
    v_user.bar++;

    expect(fn1).toBeCalledTimes(2);
    expect(fn2).toBeCalledTimes(4);
  });
});

// it("should return runner", () => {
//   let foo = 10;
//   const runner = effect(() => {
//     foo++;
//     return "foo";
//   });
//   expect(foo).toBe(11);
//   const r = runner();
//   expect(foo).toBe(12);
//   expect(r).toBe("foo");
// });

// it("scheduler", () => {
//   // 1. 通过effect第二个参数给定一个scheduler的fn
//   // 2. 当effect第一次执行的时候，还会执行fn
//   // 3. 当响应式对象set update 不会执行fn 而是执行scheduler
//   // 如果说执行当前runner 会再次执行fn
//   let dummy;
//   let run: any;
//   const scheduler = vi.fn(() => {
//     run = runner;
//   });
//   const obj = reactive({ foo: 1 });
//   const runner = effect(
//     () => {
//       dummy = obj.foo;
//     },
//     { scheduler }
//   );
//   expect(scheduler).not.toHaveBeenCalled();
//   expect(dummy).toBe(1);
//   obj.foo++;
//   expect(scheduler).toHaveBeenCalledTimes(1);
//   // should not run yet
//   expect(dummy).toBe(1);
//   // manually run
//   run();
//   expect(dummy).toBe(2);
// });

// it("stop", () => {
//   let dummy;
//   const obj = reactive({ props: 1 });
//   const runner = effect(() => {
//     dummy = obj.prop;
//   });
//   obj.prop = 2;
//   expect(dummy).toBe(2);
//   stop(runner);
//   // obj.prop = 3
//   obj.prop++;
//   expect(dummy).toBe(2);

//   // stoped effect should still be mannually callable
//   runner();
//   expect(dummy).toBe(3);
// });

// it("onStop", () => {
//   const obj = reactive({
//     foo: 1,
//   });
//   const onStop = jest.fn();
//   let dummy;
//   const runner = effect(
//     () => {
//       dummy = obj.foo;
//     },
//     {
//       onStop,
//     }
//   );
//   stop(runner);
//   expect(onStop).toBeCalledTimes(1);
// });
