export const isObject = (target: any): boolean => {
  return target !== null && typeof target === 'object'
}

export const traverse = (target: any, seen = new Set()) => {
  if (typeof target !== 'object' || target === null || seen.has(target))
    return
  seen.add(target)
  for (const key of target)
    traverse(target[key], seen)

  return target
}

export const isArray = Array.isArray

export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
export function makeMap(
  str: string,
  expectsLowerCase?: boolean,
): (key: string) => boolean {
  const map: Record<string, boolean> = Object.create(null)
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++)
    map[list[i]] = true

  return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val]
}
export const def = (obj: object, key: string | symbol, value: any) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value,
  })
}

export const hasChanged = (val: any, newVal: any) => {
  return !Object.is(val, newVal)
}
