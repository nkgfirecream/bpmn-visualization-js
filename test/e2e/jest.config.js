/**
 * Copyright 2020 Bonitasoft S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = {
  rootDir: '../..',
  roots: ['./test/e2e', './src'],
  preset: 'jest-puppeteer',
  testMatch: ['**/?(*.)+(spec|test).[t]s'],
  testPathIgnorePatterns: ['/node_modules/', 'dist', 'src'],
  testTimeout: 200000,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testEnvironment: 'jest-environment-puppeteer-jsdom',
  globalSetup: 'jest-environment-puppeteer-jsdom/setup',
  globalTeardown: 'jest-environment-puppeteer-jsdom/teardown',
  collectCoverageFrom: ['**/*.{ts,js}'],
  coveragePathIgnorePatterns: ['/node_modules/', 'dist', 'test', 'src/demo', 'src/static', 'src/model'],
  coverageReporters: ['lcov', 'text-summary'],
  coverageDirectory: 'build/test-report/e2e',
  setupFiles: ['./test/e2e/config/jest.globals.ts', './test/e2e/config/copy.bpmn.diagram.ts'],
  // jest-image-snapshot configuration doesn't work with setupFiles, fix with setupFilesAfterEnv: see https://github.com/testing-library/jest-dom/issues/122#issuecomment-650520461
  setupFilesAfterEnv: ['./test/e2e/config/jest.image.ts'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'bpmn-visualization E2E Test Report',
        outputPath: 'build/test-report/e2e/index.html',
        includeFailureMsg: true,
        includeSuiteFailure: true,
      },
    ],
    [
      'jest-sonar',
      {
        outputDirectory: 'build/test-report/e2e',
      },
    ],
  ],
};
