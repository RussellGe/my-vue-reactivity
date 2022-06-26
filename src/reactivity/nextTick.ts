const jobQueue = new Set<Function>();
const p = Promise.resolve();
let isFlushing = false;

export function queueJobs(job: Function) {
  if (!jobQueue.has(job)) {
    jobQueue.add(job);
  }
}

export function flushJobs() {
  if (isFlushing) return;
  isFlushing = true;
  p.then(() => {
    jobQueue.forEach((job): void => {
      job();
    });
  }).finally(() => {
    isFlushing = false;
  });
}
