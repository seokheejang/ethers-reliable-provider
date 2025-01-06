import { CustomProvider, withRetry, RetryOptions } from '../../src/index';
import { ethers } from 'ethers';

jest.mock('ethers');

describe('CustomProvider', () => {
  const mockSend = jest.fn();
  const mockJsonRpcProvider = jest.fn(() => ({
    send: mockSend,
  }));

  const mockWebSocketProvider = jest.fn(() => ({
    send: mockSend,
  }));

  (ethers.providers.JsonRpcProvider as unknown as jest.Mock) = mockJsonRpcProvider;
  (ethers.providers.WebSocketProvider as unknown as jest.Mock) = mockWebSocketProvider;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully get the block number using JSON-RPC provider', async () => {
    const endpoint = 'http://localhost:8545';
    const provider = new CustomProvider('jsonRpc', endpoint);
    mockSend.mockResolvedValueOnce('0x1a'); // Block number in hex

    const blockNumber = await provider.getBlockNumber();
    expect(blockNumber).toBe(parseInt('0x1a', 16)); // Convert hex to number
    expect(mockJsonRpcProvider).toHaveBeenCalledWith(endpoint);
    expect(mockSend).toHaveBeenCalledWith('eth_blockNumber', []);
  });

  it('should fail to get the block number after retries', async () => {
    const endpoint = 'http://localhost:8545';
    const provider = new CustomProvider('jsonRpc', endpoint, { retries: 2, retryDelay: 100 });
    mockSend.mockRejectedValueOnce(new Error('RPC error')).mockRejectedValueOnce(new Error('RPC error'));

    await expect(provider.getBlockNumber()).rejects.toThrow('Action failed after 2 retries: RPC error');
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('should use WebSocket provider and succeed', async () => {
    const endpoint = 'ws://localhost:8546';
    const provider = new CustomProvider('webSocket', endpoint);
    mockSend.mockResolvedValueOnce('0x2a'); // Block number in hex

    const blockNumber = await provider.getBlockNumber();
    expect(blockNumber).toBe(parseInt('0x2a', 16)); // Convert hex to number
    expect(mockWebSocketProvider).toHaveBeenCalledWith(endpoint);
    expect(mockSend).toHaveBeenCalledWith('eth_blockNumber', []);
  });

  it('should timeout during RPC call', async () => {
    const endpoint = 'http://localhost:8545';
    const provider = new CustomProvider('jsonRpc', endpoint, { timeout: 100 });
    mockSend.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('0x1b'), 200)), // Delay response
    );

    await expect(provider.getBlockNumber()).rejects.toThrow('Request timed out after 100ms');
  });
});

describe('withRetry', () => {
  it('should retry and eventually succeed', async () => {
    const action = jest.fn().mockRejectedValueOnce(new Error('Temporary error')).mockResolvedValueOnce('Success');

    const result = await withRetry(action, { retries: 2, retryDelay: 100 });
    expect(result).toBe('Success');
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('should fail after maximum retries', async () => {
    const action = jest.fn().mockRejectedValue(new Error('Permanent error'));

    await expect(withRetry(action, { retries: 3, retryDelay: 100 })).rejects.toThrow('Action failed after 3 retries: Permanent error');
    expect(action).toHaveBeenCalledTimes(3);
  });

  it('should not retry if the first attempt succeeds', async () => {
    const action = jest.fn().mockResolvedValue('Success');

    const result = await withRetry(action, { retries: 3, retryDelay: 100 });
    expect(result).toBe('Success');
    expect(action).toHaveBeenCalledTimes(1);
  });
});
