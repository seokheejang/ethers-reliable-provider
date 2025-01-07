import { CustomJsonRpcProvider } from '../../src/index';
const endpoint = 'http://localhost:8545';

describe('CustomJsonRpcProvider', () => {
  let provider: CustomJsonRpcProvider;

  beforeEach(() => {
    provider = new CustomJsonRpcProvider(endpoint, { timeout: 5000, retries: 3, retryDelay: 1000 });
  });

  it('should successfully send a request to the endpoint', async () => {
    const method = 'eth_blockNumber'; // 예시 메소드
    const params = [] as any;

    // 실제 엔드포인트에서 요청을 보내고 응답을 확인
    const result = await provider.send(method, params);
    expect(result).toBeDefined(); // 응답이 정의되어 있는지 확인
    expect(typeof result).toBe('string'); // 응답이 예상되는 타입인지 확인
  });

  it('should retry the request on failure and succeed within retries', async () => {
    const method = 'eth_blockNumber';
    const params = [] as any;

    // 실패 후 재시도 테스트
    const mockSend = jest.spyOn(provider, 'send');
    mockSend
      .mockRejectedValueOnce(new Error('Network Error')) // 첫 번째 실패
      .mockResolvedValueOnce('0x12345'); // 두 번째에서 성공

    const result = await provider.send(method, params);
    expect(result).toBe('0x12345'); // 성공적인 응답이 돌아왔는지 확인
  });

  it('should throw an error after all retries fail', async () => {
    const method = 'eth_blockNumber';
    const params = [] as any;

    // 모든 재시도가 실패하는 경우
    const mockSend = jest.spyOn(provider, 'send');
    mockSend
      .mockRejectedValueOnce(new Error('Network Error')) // 첫 번째 실패
      .mockRejectedValueOnce(new Error('Network Error')) // 두 번째 실패
      .mockRejectedValueOnce(new Error('Network Error')); // 세 번째 실패

    await expect(provider.send(method, params)).rejects.toThrow('Request timed out after 5000ms');
  });
});
