/**
 * Integration tests for audit-filter using mocked dependencies
 *
 * These tests demonstrate how to use the mock implementations for fs and child_process
 * to test the audit-filter CLI wrapper without touching the filesystem or spawning processes.
 */

/* global process */

// Import path is not used
// import { join } from 'path';
import { analyzeAuditReport } from '../core';

// Import fs and child_process modules - these will be the mocked versions
import * as fs from 'fs';
import * as childProcess from 'child_process';

// Import mock control functions
import fsMock from '../__mocks__/fs';
import cpMock from '../__mocks__/child_process';

// Import our mock helpers
import {
  // createDefaultMockFileSystem not used directly
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  createDefaultMockFileSystem,
  createCleanAuditResult,
  createHighVulnerabilitiesAuditResult,
  createMockAllowlist,
} from '../__mocks__/mockHelpers';

// Set up a consistent path for tests
const MOCK_ALLOWLIST_PATH = '/path/to/.audit-allowlist.json';

// Mock process.cwd to return a consistent path for tests
jest.spyOn(process, 'cwd').mockReturnValue('/path/to');

// Set up mock functions for filesystem operations
const mockFiles: Record<string, string> = {
  [MOCK_ALLOWLIST_PATH]: createMockAllowlist([
    {
      id: '1234',
      package: 'vulnerable-package-1',
      reason: 'False positive, fixed in our usage',
      expires: '2099-12-31T23:59:59.000Z',
    },
    {
      id: '5678',
      package: 'vulnerable-package-2',
      reason: 'Working on upgrade',
      expires: '2099-12-31T23:59:59.000Z',
    },
  ]),
};

// Create a simplified version of the readAllowlistFile function from audit-filter-new.ts
function readAllowlistFile(allowlistPath: string): string | null {
  try {
    if (!fs.existsSync(allowlistPath)) {
      console.log(
        'Allowlist file not found. All high/critical vulnerabilities will fail the audit.'
      );
      return null;
    }

    return fs.readFileSync(allowlistPath, 'utf-8');
  } catch (error) {
    console.error('Error loading allowlist:', (error as Error).message);
    return null;
  }
}

// Create a simplified version of the executeNpmAudit function from audit-filter-new.ts
function executeNpmAudit(): string {
  try {
    return childProcess.execSync('npm audit --json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (error) {
    // npm audit exits with non-zero code when it finds vulnerabilities
    // We need to parse the output and make our own decision
    if (error && typeof error === 'object' && 'stdout' in error) {
      const stdout = (error as { stdout: string }).stdout;
      return stdout;
    }

    throw new Error(`Error running npm audit: ${(error as Error).message}`);
  }
}

// Mock setup functions to create different test scenarios
function setupCleanAudit(): void {
  // Reset mocks to clean state
  fsMock.resetMock();
  cpMock.resetMock();

  // Configure child_process mock to return clean audit result
  cpMock.mockState.defaultNpmAuditOutput = createCleanAuditResult();

  // Configure fs mock to have the allowlist file
  fsMock.addMockFile(MOCK_ALLOWLIST_PATH, mockFiles[MOCK_ALLOWLIST_PATH]);
}

function setupVulnerabilities(): void {
  // Reset mocks to clean state
  fsMock.resetMock();
  cpMock.resetMock();

  // Configure child_process mock to return vulnerabilities
  cpMock.mockState.defaultNpmAuditOutput = createHighVulnerabilitiesAuditResult();

  // Configure fs mock to have the allowlist file
  fsMock.addMockFile(MOCK_ALLOWLIST_PATH, mockFiles[MOCK_ALLOWLIST_PATH]);
}

function setupMissingAllowlist(): void {
  // Reset mocks to clean state
  fsMock.resetMock();
  cpMock.resetMock();

  // Configure child_process mock to return clean audit result
  cpMock.mockState.defaultNpmAuditOutput = createCleanAuditResult();

  // Clear the default filesystem to ensure no allowlist file exists
  fsMock.mockState.fileSystem = { files: {} };
}

function setupMalformedAllowlist(): void {
  // Reset mocks to clean state
  fsMock.resetMock();
  cpMock.resetMock();

  // Configure child_process mock to return clean audit result
  cpMock.mockState.defaultNpmAuditOutput = createCleanAuditResult();

  // Configure fs mock to have a malformed allowlist file
  fsMock.addMockFile(MOCK_ALLOWLIST_PATH, '{malformed json');
}

describe('Audit Filter CLI Integration', () => {
  // Reset custom mock state before each test, but don't reset Jest mocks
  beforeEach(() => {
    fsMock.resetMock();
    cpMock.resetMock();
  });

  test('should handle a clean audit with no vulnerabilities', () => {
    // Setup mocks
    setupCleanAudit();

    // Read allowlist and execute audit
    const allowlistContent = readAllowlistFile(MOCK_ALLOWLIST_PATH);
    const __auditOutput = executeNpmAudit();
    const currentDate = new Date('2023-01-01');

    // Analyze results
    const result = analyzeAuditReport(__auditOutput, allowlistContent, currentDate);

    // Verify results
    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.allowedVulnerabilities).toHaveLength(0);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.isSuccessful).toBe(true);

    // Verify mocks were called correctly
    expect(fsMock.mockState.lastExistsFilePath).toBe(MOCK_ALLOWLIST_PATH);
    expect(fsMock.mockState.lastReadFilePath).toBe(MOCK_ALLOWLIST_PATH);
    expect(cpMock.mockState.lastCommand).toBe('npm audit --json');
  });

  test('should handle vulnerabilities with matching allowlist entries', () => {
    // Setup mocks
    setupVulnerabilities();

    // Read allowlist and execute audit
    const allowlistContent = readAllowlistFile(MOCK_ALLOWLIST_PATH);
    const __auditOutput = executeNpmAudit();
    const currentDate = new Date('2023-01-01');

    // Analyze results
    const result = analyzeAuditReport(__auditOutput, allowlistContent, currentDate);

    // Verify results
    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.allowedVulnerabilities).toHaveLength(2);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.isSuccessful).toBe(true);

    // Verify the allowed vulnerabilities
    if (result.allowedVulnerabilities.length > 0) {
      expect(result.allowedVulnerabilities[0]!.package).toBe('vulnerable-package-1');
      expect(result.allowedVulnerabilities[0]!.allowlistStatus).toBe('allowed');
    }
  });

  test('should handle missing allowlist file', () => {
    // Setup mocks
    setupMissingAllowlist();

    // Read allowlist and execute audit
    const allowlistContent = readAllowlistFile(MOCK_ALLOWLIST_PATH);
    const __auditOutput = executeNpmAudit();
    const currentDate = new Date('2023-01-01');

    // Verify allowlist is null when file doesn't exist
    expect(allowlistContent).toBeNull();

    // Analyze results
    const result = analyzeAuditReport(__auditOutput, allowlistContent, currentDate);

    // With a clean audit, there should be no vulnerabilities despite no allowlist
    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.allowedVulnerabilities).toHaveLength(0);
    expect(result.expiredAllowlistEntries).toHaveLength(0);
    expect(result.isSuccessful).toBe(true);

    // Verify existsSync was called but readFileSync was not (file doesn't exist)
    expect(fsMock.mockState.lastExistsFilePath).toBe(MOCK_ALLOWLIST_PATH);
    expect(fsMock.mockState.lastReadFilePath).toBe(''); // Empty because no file was read
  });

  test('should handle malformed allowlist JSON', () => {
    // Setup mocks
    setupMalformedAllowlist();

    // Read allowlist and execute audit
    const allowlistContent = readAllowlistFile(MOCK_ALLOWLIST_PATH);
    const __auditOutput = executeNpmAudit();
    const currentDate = new Date('2023-01-01');

    // Verify we still got the content of the malformed file
    expect(allowlistContent).toBe('{malformed json');

    // Expect an error when analyzing with malformed JSON
    expect(() => {
      analyzeAuditReport(__auditOutput, allowlistContent, currentDate);
    }).toThrow('Failed to parse allowlist file as JSON');
  });
});
