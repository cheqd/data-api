declare global {
  namespace NodeJS {
    interface ProcessEnv {
        TOKEN_EXPONENT: string;
        REST_API: string;
        GRAPHQL_API: string;
    }
  }
}

export {}
