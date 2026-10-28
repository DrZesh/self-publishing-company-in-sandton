export function createClientFromRequest() { globalThis.gatewayBackendCalls++; return { asServiceRole: globalThis.gatewayBackend }; }
