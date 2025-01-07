export interface RetryOptions {
  retries: number;
  retryDelay: number; // ms 단위
}

export async function withRetry<T>(action: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { retries, retryDelay } = options;
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await action();
    } catch (error: any) {
      attempt++;
      if (attempt >= retries) {
        throw new Error(`Action failed after ${retries} retries: ${error.message}`);
      } else {
        console.log(`Retry attempt: ${attempt}`);
      }
      await delay(retryDelay);
    }
  }
  throw new Error('Unexpected error in retry logic');
}

// Delay 유틸리티
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
