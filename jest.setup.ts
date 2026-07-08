// Jest setup file for global test configuration
import 'reflect-metadata';

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Set test timeout
jest.setTimeout(10000);

// Mock environment variables if needed
process.env.NODE_ENV = 'test';
