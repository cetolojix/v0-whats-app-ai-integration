// Mock Supabase client for when authentication is disabled
export function createClient() {
  // Return a mock client that doesn't do anything
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Authentication disabled") }),
      signUp: () => Promise.resolve({ data: null, error: new Error("Authentication disabled") }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: new Error("Database disabled") }),
        }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: () => Promise.resolve({ data: null, error: new Error("Database disabled") }),
      update: () => Promise.resolve({ data: null, error: new Error("Database disabled") }),
      delete: () => Promise.resolve({ data: null, error: new Error("Database disabled") }),
    }),
  }
}
