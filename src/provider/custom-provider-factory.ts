import { CustomJsonRpcProvider } from './custom-http-provider';
import { CustomWebSocketProvider } from './custom-ws-provider';
import { CustomProviderOptions } from './type';

export function createCustomProvider(providerType: 'jsonRpc' | 'webSocket', endpoint: string, options?: CustomProviderOptions) {
  if (providerType === 'jsonRpc') {
    return new CustomJsonRpcProvider(endpoint, options);
  } else if (providerType === 'webSocket') {
    return new CustomWebSocketProvider(endpoint, options);
  } else {
    throw new Error("Invalid provider type. Use 'jsonRpc' or 'webSocket'.");
  }
}
