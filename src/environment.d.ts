declare global {
  namespace NodeJS {
    interface ProcessEnv {
        TOKEN_EXPONENT: string;
        NODE_RPC_API_URL: string;
        ANEKA_API_URL: string;
        BIG_DIPPER_GRAPHQL_URL: string;
    }
  }
}

export {}
