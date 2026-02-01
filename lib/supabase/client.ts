// Lightweight shim for legacy Supabase imports.
// The project uses Firebase now; this file exists only to keep build imports working.

type AnyObj = Record<string, any>;

function makeQuery() {
  return {
    select() { return this; },
    eq() { return this; },
    order() { return this; },
    limit() { return this; },
    single: async () => ({ data: null }),
    maybeSingle: async () => ({ data: null }),
    insert: async (rows: AnyObj) => ({ data: null }),
    update: async (rows: AnyObj) => ({ data: null }),
    delete: async () => ({ data: null }),
  };
}

export function createBrowserClient() {
  return {
    auth: {
      // Returns null user; migrate to Firebase auth for real behavior.
      getUser: async () => ({ data: { user: null } }),
    },
    from: (_table: string) => makeQuery(),
  };
}

export function createClient() {
  // kept as async-compatible (some code awaits createClient())
  return Promise.resolve(createBrowserClient());
}

export default createBrowserClient;
