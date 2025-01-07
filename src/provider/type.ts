export interface CustomProviderOptions {
  timeout?: number; // 요청 타임아웃 (ms)
  retries?: number; // 최대 재시도 횟수
  retryDelay?: number; // 재시도 간격 (ms)
}
