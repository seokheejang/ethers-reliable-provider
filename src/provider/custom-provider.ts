import { ethers } from 'ethers';
import { RetryOptions, withRetry } from './retry-utils';
import { hexToDecimal } from '../utils/eth-utils';
import { CustomProviderOptions } from './type';

export class CustomProvider {
  private provider: ethers.providers.JsonRpcProvider | ethers.providers.WebSocketProvider;
  private timeout: number;
  private retryOptions: RetryOptions;

  constructor(providerType: 'jsonRpc' | 'webSocket', endpoint: string, options?: CustomProviderOptions) {
    // 기본 옵션 설정
    const { timeout = 5000, retries = 3, retryDelay = 1000 } = options || {};
    this.timeout = timeout;
    this.retryOptions = { retries, retryDelay };

    // Provider 인스턴스 생성
    if (providerType === 'jsonRpc') {
      this.provider = new ethers.providers.JsonRpcProvider(endpoint);
    } else if (providerType === 'webSocket') {
      this.provider = new ethers.providers.WebSocketProvider(endpoint);
    } else {
      throw new Error("Invalid provider type. Use 'jsonRpc' or 'webSocket'.");
    }
  }

  // 요청을 감싸는 메서드 (timeout + retry)
  async send(method: string, params: any[]): Promise<any> {
    return withRetry(async () => {
      return this.withTimeout(this.callRpc(method, params), this.timeout);
    }, this.retryOptions);
  }

  // RPC 호출을 수행하는 메서드
  private async callRpc(method: string, params: any[]): Promise<any> {
    if ('send' in this.provider) {
      // WebSocketProvider와의 호환성을 위해
      return (this.provider as ethers.providers.JsonRpcProvider).send(method, params);
    }
    // JsonRpcProvider의 perform 메서드를 활용
    return (this.provider as ethers.providers.JsonRpcProvider).perform(method, params);
  }

  // 주어진 Promise에 timeout 적용
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

  async getBlockNumber(): Promise<number> {
    const blockNumberHex = await this.send('eth_blockNumber', []);
    return hexToDecimal(blockNumberHex);
  }

  getBalance(address: string, blockTag?: string): Promise<string> {
    return this.send('eth_getBalance', [address, blockTag || 'latest']);
  }

  // 추가 메서드 필요 시 여기에 구현
}
