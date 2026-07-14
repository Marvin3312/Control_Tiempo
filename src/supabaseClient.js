export const supabase = {
  auth: {
    getSession: () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOtp: async () => ({ error: null }),
    signOut: async () => ({ error: null })
  },
  from: (table) => ({
    select: async () => {
      console.warn(`Supabase mock called for table ${table}. You need to migrate this to api.js.`);
      return { data: [], error: null };
    },
    upsert: async () => ({ error: null }),
    insert: async () => ({ data: [], error: null }),
    update: async () => ({ data: [], error: null }),
    delete: async () => ({ data: [], error: null }),
    eq: function() { return this; },
    single: async () => ({ data: null, error: null })
  }),
  rpc: async (fn) => {
    console.warn(`Supabase RPC mock called for ${fn}.`);
    return { data: [], error: null };
  }
};
