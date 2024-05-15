const sleep = (delay: number) => {
  if (delay > 0) {
    return new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), delay));
  }

  return;
};

export const retry = <T extends unknown[], R>(
  func: (...args: T) => R | Promise<R>,
  count: number,
  delay = 0,
) =>
async (...args: T) => {
  for (let attempts = 0;; attempts += 1) {
    try {
      return await func(...args);
    } catch (error) {
      if (attempts >= count) {
        throw error;
      }

      attempts += 1;
      await sleep(delay);
    }
  }
};
