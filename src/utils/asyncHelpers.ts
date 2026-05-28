export async function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  timeoutMessage: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(timeoutMessage)), ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}
