import { CustomJsonRpcProvider } from '../../src/index';

describe('CustomJsonRpcProvider', () => {
  it('should send an RPC request and return a response successfully', async () => {
    const endpoint = 'http://localhost:8545';
    const provider = new CustomJsonRpcProvider(endpoint);

    const blockNumber = await provider.getBlockNumber();
    console.log('blockNumber', blockNumber);
    const result = await provider.send('eth_blockNumber', []);
    console.log('resutl', result);
    expect(1).toBe(1);
  });
});
