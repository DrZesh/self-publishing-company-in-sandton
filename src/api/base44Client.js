import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { supabase } from '@/api/supabaseClient';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const base44Sdk = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl,
});

const functionsBridge = new Proxy(base44Sdk.functions, {
  get(target, property, receiver) {
    if (property === 'invoke') {
      return async (functionName, payload) => {
        if (functionName === 'captureFormSubmission') {
          const { data, error } = await supabase.functions.invoke('capture-form-submission', {
            body: payload,
          });

          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          return data;
        }

        return target.invoke(functionName, payload);
      };
    }

    return Reflect.get(target, property, receiver);
  },
});

// Transitional client: existing Base44 modules remain available while selected
// workflows are migrated to Supabase incrementally.
export const base44 = new Proxy(base44Sdk, {
  get(target, property, receiver) {
    if (property === 'functions') return functionsBridge;
    return Reflect.get(target, property, receiver);
  },
});
