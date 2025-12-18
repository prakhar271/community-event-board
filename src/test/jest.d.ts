import '@types/jest';

declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createTestUser: () => any;
        createTestEvent: () => any;
      };
    }
  }
}

export {};