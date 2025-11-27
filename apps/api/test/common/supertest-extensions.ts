import supertest from 'supertest';
import { type Test as SuperTestTest } from 'supertest';

// Extend the Test prototype to add setApiKey helper
declare module 'supertest' {
  interface Test {
    setApiKey(apiKey: string): this;
  }
}

// Add setApiKey method to Test prototype
Object.assign(supertest.Test.prototype, {
  setApiKey(this: SuperTestTest, apiKey: string) {
    return this.set('x-api-key', apiKey);
  },
});

