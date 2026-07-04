import { base44 as transitionalBase44 } from './base44Client.js';
import { supabase } from './supabaseClient.js';

async function invokeSupabaseFunction(functionName, payload) {
  const { data, error } = await supabase.functions.invoke(functionName, { body: payload || {} });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return { data };
}

const functionsBridge = new Proxy(transitionalBase44.functions, {
  get(target, property, receiver) {
    if (property !== 'invoke') return Reflect.get(target, property, receiver);

    return async (functionName, payload) => {
      if (functionName === 'searchConsoleData') {
        return invokeSupabaseFunction('search-console-data', payload);
      }

      return target.invoke(functionName, payload);
    };
  },
});

export const base44 = new Proxy(transitionalBase44, {
  get(target, property, receiver) {
    if (property === 'functions') return functionsBridge;
    return Reflect.get(target, property, receiver);
  },
});
