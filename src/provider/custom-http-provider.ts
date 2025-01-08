import { ethers } from 'ethers';
import { RetryOptions, withRetry } from './retry-utils';
import { CustomProviderOptions } from './type';

export class CustomJsonRpcProvider extends ethers.providers.JsonRpcProvider {
  private timeout: number;
  private retryOptions: RetryOptions;

  constructor(endpoint: string, options?: CustomProviderOptions) {
    super(endpoint);
    const { timeout = 5000, retries = 3, retryDelay = 1000 } = options || {};
    this.timeout = timeout;
    this.retryOptions = { retries, retryDelay };
  }

  async send(method: string, params: any[], options?: { signal?: AbortSignal }): Promise<any> {
    const { signal } = options || {};

    if (signal?.aborted) {
      throw new Error('Request aborted by the user');
    }

    return withRetry(async () => {
      if (signal) {
        return this.withAbortableTimeout(super.send(method, params), this.timeout, signal);
      } else {
        return this.withTimeout(super.send(method, params), this.timeout);
      }
    }, this.retryOptions);
  }

  private withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);

      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private withAbortableTimeout<T>(promise: Promise<T>, timeout: number, signal?: AbortSignal): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);

      const onAbort = () => {
        clearTimeout(timer);
        reject(new Error('Request aborted by the user'));
      };

      if (signal) {
        signal.addEventListener('abort', onAbort);
      }

      promise
        .then((result) => {
          clearTimeout(timer);
          if (signal) {
            signal.removeEventListener('abort', onAbort);
          }
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          if (signal) {
            signal.removeEventListener('abort', onAbort);
          }
          reject(error);
        });
    });
  }
}
