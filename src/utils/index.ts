export const isObject = (target: any): boolean => {
  return target !== null && typeof target === "object";
};

export const traverse = (target: any, seen = new Set()) => {
  if (typeof target !== "object" || target === null || seen.has(target)) return;
  seen.add(target);
  for (const key of target) {
    traverse(target[key], seen);
  }
  return target;
};
