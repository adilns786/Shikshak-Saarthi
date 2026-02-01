// Supabase server shim - maps legacy imports to a minimal API using Firebase in future.

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

export function createServerClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null } }),
    },
    from: (_table: string) => makeQuery(),
  };
}

export async function createClient() {
  return createServerClient();
}

export { createServerClient as createRawClient };
