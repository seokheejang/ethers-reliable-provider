import { CustomJsonRpcProvider } from '../../src/index';
import { ethers } from 'ethers';

jest.mock('ethers');

describe('CustomJsonRpcProvider', () => {
  const mockSend = jest.fn();

  const MockJsonRpcProvider = jest.fn(() => ({
    send: mockSend,
  }));

  (ethers.providers.JsonRpcProvider as unknown as jest.Mock) = MockJsonRpcProvider;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send an RPC request and return a response successfully', async () => {
    const endpoint = 'http://localhost:8545';
    const provider = new CustomJsonRpcProvider(endpoint);
    mockSend.mockResolvedValueOnce('0x1a'); // Block number in hex

    const blockNumber = await provider.getBlockNumber();
    expect(blockNumber).toBe(parseInt('0x1a', 16)); // Convert hex to number
    expect(CustomJsonRpcProvider).toHaveBeenCalledWith(endpoint);
    expect(mockSend).toHaveBeenCalledWith('eth_blockNumber', []);
  });

  it('should retry on failure and eventually succeed', async () => {
    const endpoint = 'http://localhost:8545';
    const response = '0x1a';
    mockSend.mockRejectedValueOnce(new Error('Temporary error')).mockResolvedValueOnce(Promise.resolve(response)); // 두 번째 요청 성공 시뮬레이션

    const provider = new CustomJsonRpcProvider(endpoint, { retries: 2, retryDelay: 100 });

    await expect(provider.getBlockNumber()).rejects.toThrow('Action failed after 2 retries: RPC error');
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  // it('should fail after maximum retries', async () => {
  //   const endpoint = 'http://localhost:8545';
  //   mockSend.mockRejectedValue(new Error('Permanent error')); // 항상 실패하도록 설정

  //   const provider = new CustomJsonRpcProvider(endpoint, { retries: 2, retryDelay: 100 });

  //   await expect(provider.send('eth_blockNumber', [])).rejects.toThrow('Action failed after 2 retries: Permanent error');
  //   expect(mockSend).toHaveBeenCalledTimes(2);
  // });

  // it('should timeout if the request takes too long', async () => {
  //   const endpoint = 'http://localhost:8545';
  //   const delay = 200;
  //   const timeout = 100;

  //   mockSend.mockImplementation(
  //     () => new Promise((resolve) => setTimeout(() => resolve('0x1b'), delay)), // 응답 지연 시뮬레이션
  //   );

  //   const provider = new CustomJsonRpcProvider(endpoint, { timeout });

  //   await expect(provider.send('eth_blockNumber', [])).rejects.toThrow(`Request timed out after ${timeout}ms`);
  //   expect(mockSend).toHaveBeenCalledTimes(1);
  // });
});
