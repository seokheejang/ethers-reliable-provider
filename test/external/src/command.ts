import { CustomJsonRpcProvider } from 'ethers-reliable-provider';
import { rpc_method } from './rpc';

export const multiCallCmd = {
  command: 'multi-call',
  describe: 'Execute multiple JSON-RPC calls',
  builder: {
    url: {
      string: true,
      describe: 'chain url',
      demandOption: true,
    },
    retry: {
      number: true,
      describe: 'retry count',
      default: 3,
    },
    timeout: {
      number: true,
      describe: 'request timeout',
      default: 5000,
    },
    method: {
      string: true,
      describe: 'call jsonrpc method',
      default: 'getBlockNumber',
    },
    loop: {
      number: true,
      describe: 'loop count',
      default: 10,
    },
  },
  handler: async (argv: any) => {
    const method = argv.method as keyof typeof rpc_method;

    if (!rpc_method[method]) {
      console.error(`Invalid method: ${method}`);
      return;
    }
    const provider = new CustomJsonRpcProvider(argv.url, { retries: argv.retry, timeout: argv.timeout });
    await testManyCall(provider, rpc_method[method], argv.loop).catch((error) => {
      console.error('Error in testManyCall:', error);
    });
  },
};

export const timeoutCallCmd = {
  command: 'timeout-call',
  builder: {
    url: {
      string: true,
      describe: 'chain url',
      default: 'http://localhost:8545',
      demandOption: true,
    },
    retry: {
      number: true,
      describe: 'retry count',
      default: 3,
    },
    timeout: {
      number: true,
      describe: 'request timeout',
      default: 5000,
    },
    method: {
      string: true,
      describe: 'call json-rpc method',
      choices: Object.keys(rpc_method),
      default: 'getBlockNumber',
    },
    loop: {
      number: true,
      describe: 'loop count',
      default: 10,
    },
  },
  handler: async (argv: any) => {
    const method = argv.method as keyof typeof rpc_method; // argv.method가 rpc_method의 키 중 하나로 제한됨

    if (!rpc_method[method]) {
      console.error(`Invalid method: ${method}`);
      return;
    }
    const provider = new CustomJsonRpcProvider(argv.url, { retries: argv.retry, timeout: argv.timeout });
    await testTimeoutCall(provider, rpc_method[method], argv.loop).catch((error) => {
      console.error('Error in testManyCall:', error);
    });
  },
};

const testManyCall = async (provider: CustomJsonRpcProvider, { method, params }: { method: string; params: any[] }, loop = 100) => {
  let successCount = 0;
  let failureCount = 0;

  const promises = Array.from({ length: loop }, (_, i) => {
    return provider
      .send(method, params)
      .then((response) => {
        successCount++;
        console.log(`Request ${i + 1}: Success - ${JSON.stringify(response)}`);
      })
      .catch((error) => {
        failureCount++;
        console.error(`Request ${i + 1}: Failed - ${error.message}`);
      });
  });

  await Promise.all(promises);

  console.log(`Total successful requests: ${successCount}`);
  console.log(`Total failed requests: ${failureCount}`);
};

const testTimeoutCall = async (
  provider: CustomJsonRpcProvider,
  { method, params }: { method: string; params: any[] },
  loop = 100,
  timeout = 5000, // 타임아웃 시간 (밀리초)
) => {
  const timeoutPromises: Promise<void>[] = [];
  const successfulResponses: any[] = [];
  const timeoutErrors: number[] = [];

  for (let i = 0; i < loop; i++) {
    const requestPromise = new Promise<void>(async (resolve, reject) => {
      const controller = new AbortController();

      const timeoutPromise = new Promise<void>((_, reject) =>
        setTimeout(() => {
          controller.abort(); // 타임아웃 발생 시 요청을 취소
          reject(new Error(`Request ${i + 1} timed out`)); // 타임아웃 에러 발생
        }, timeout),
      );

      try {
        const response = await Promise.race([
          provider.send(method, params, { signal: controller.signal }), // 실제 요청
          timeoutPromise, // 타임아웃
        ]);
        successfulResponses.push(response);
        console.log(`Request ${i + 1}: Success - ${JSON.stringify(response)}`);
        resolve();
      } catch (error: any) {
        console.error(`Request ${i + 1}: Error - ${error.message}`);
        timeoutErrors.push(1);
        reject(error);
      }
    });

    timeoutPromises.push(requestPromise);
  }

  const results = await Promise.allSettled(timeoutPromises);
  const fulfilledCount = results.filter((result) => result.status === 'fulfilled').length;
  const rejectedCount = results.filter((result) => result.status === 'rejected').length;

  console.log(`Total successful requests: ${fulfilledCount}`);
  console.log(`Total timeout errors: ${rejectedCount}`);
};
