export const rpc_method = {
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
