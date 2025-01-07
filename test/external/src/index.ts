import { CustomJsonRpcProvider } from 'ethers-reliable-provider';
import dotenv from 'dotenv';

dotenv.config();

const rpc_method = {
  getBlockNumber: {
    method: 'eth_blockNumber',
    params: [],
  },
  getTransactionReceipt: {
    method: 'eth_getTransactionReceipt',
    params: ['0x33a18c21c3c62b6f69425afdd4b776e47b31482aad6a76eb62ac7aec51b8765a'],
  },
  sendRawTransaction: {
    method: 'eth_sendRawTransaction',
    params: [
      '0x02f87583066eee6a842a33fc50842a33fc5082543b944ba7f616e2dee0bf2cc7138f3af92b2ce67292448814d1120d7b16000080c080a0029672fd5ccfc75a23fd457e97f044051e45f392acf0f1fdd70215bbe38f9778a01fddf86d6894d717bc9214f64957526aec3596bdb6ea22577262fc747081c9c6',
    ],
  },
};

async function externalMain() {
  const rpcUrl = process.env.ENV_NODE_URL;

  if (!rpcUrl) {
    throw new Error('ENV_NODE_URL is not defined in the .env file');
  }

  const provider = new CustomJsonRpcProvider(rpcUrl);
  const oriGetBN = await provider.getBlockNumber();
  const cusGetBN = await provider.send('eth_blockNumber', []);

  console.log(`Using RPC URL: ${rpcUrl}`);
  console.log(`provider.getBlockNumber(): ${oriGetBN}`);
  console.log(`provider.send('eth_blockNumber', []): ${cusGetBN}`);

  testManyCall(provider, rpc_method.sendRawTransaction, 1000).catch((error) => {
    console.error('Error in testManyCall:', error);
  });
}

externalMain().catch((error) => {
  console.error('externalMain Error:', error);
});

const testManyCall = async (provider: CustomJsonRpcProvider, { method, params }: { method: string; params: any[] }, loop = 100) => {
  const retriesCount: number[] = [];
  const maxRetries = 3;

  for (let i = 0; i < loop; i++) {
    try {
      // 실패를 유도하려면 일부러 실패를 던질 수 있습니다 (예: 네트워크 오류)
      const response = await provider.send(method, params);
      console.log(`Request ${i + 1}: Success - ${JSON.stringify(response)}`);
    } catch (error: any) {
      console.error(`Request ${i + 1}: Failed - ${error.message}`);

      // 실패한 경우, 재시도 로직이 동작하는지 확인하기 위해 횟수를 추적
      retriesCount.push(1); // 실패한 요청은 카운팅
      if (retriesCount.length > maxRetries) {
        console.error(`Max retries reached for request ${i + 1}`);
      }
    }
  }

  console.log(`Total retried requests: ${retriesCount.length}`);
};
