/**
 * Zod schemas for raw npm audit JSON formats
 *
 * This file contains Zod schemas that validate the different formats
 * of npm audit JSON output across various npm versions.
 */

import { z } from 'zod';

/**
 * Schema for npm v6 advisory structure
 */
const AdvisorySchemaV6 = z.object({
  id: z.union([z.number(), z.string()]),
  module_name: z.string(),
  severity: z.enum(['info', 'low', 'moderate', 'high', 'critical']),
  title: z.string(),
  url: z.string(),
  vulnerable_versions: z.string(),
});

/**
 * Schema for vulnerability counts metadata (used in both v6 and v7+)
 */
const VulnerabilityCountsSchema = z.object({
  info: z.number().int().min(0),
  low: z.number().int().min(0),
  moderate: z.number().int().min(0),
  high: z.number().int().min(0),
  critical: z.number().int().min(0),
  total: z.number().int().min(0),
});

/**
 * Schema for npm v6 audit JSON output format
 *
 * npm v6 uses an "advisories" object containing advisory details
 * keyed by advisory ID.
 */
export const RawNpmV6AuditSchema = z.object({
  advisories: z.record(z.string(), AdvisorySchemaV6),
  metadata: z.object({
    vulnerabilities: VulnerabilityCountsSchema,
  }),
});

/**
 * Schema for npm v7+ vulnerability "via" item
 *
 * These are detailed vulnerability objects that appear in the `via` array.
 * Some fields may be optional depending on the npm version and vulnerability type.
 */
const ViaItemSchemaV7Plus = z.object({
  source: z.number(),
  name: z.string(),
  dependency: z.string(),
  title: z.string(),
  url: z.string(),
  severity: z.enum(['info', 'low', 'moderate', 'high', 'critical']),
  range: z.string(),
  // Additional fields that may appear in newer npm versions
  cwe: z.array(z.string()).optional(),
  cvss: z
    .object({
      score: z.number(),
      vectorString: z.string().nullable(),
    })
    .optional(),
});

/**
 * Schema for npm v7+ fix information
 */
const FixInfoSchemaV7Plus = z.object({
  name: z.string(),
  version: z.string(),
  isSemVerMajor: z.boolean(),
});

/**
 * Schema for npm v7+ vulnerability structure
 *
 * Note: The `via` field can be either:
 * - An array of strings (referencing other vulnerable packages)
 * - An array of objects (detailed vulnerability information)
 */
const VulnerabilitySchemaV7Plus = z.object({
  name: z.string(),
  severity: z.enum(['info', 'low', 'moderate', 'high', 'critical']),
  isDirect: z.boolean(),
  via: z.union([
    z.array(z.string()), // Simple format: references to other packages
    z.array(ViaItemSchemaV7Plus), // Complex format: detailed vulnerability info
  ]),
  effects: z.array(z.string()),
  range: z.string(),
  nodes: z.array(z.string()),
  fixAvailable: z.union([z.boolean(), FixInfoSchemaV7Plus]),
});

/**
 * Schema for npm v7+ audit JSON output format
 *
 * npm v7+ uses a "vulnerabilities" object containing vulnerability details
 * keyed by package name.
 */
export const RawNpmV7PlusAuditSchema = z.object({
  vulnerabilities: z.record(z.string(), VulnerabilitySchemaV7Plus),
  metadata: z.object({
    vulnerabilities: VulnerabilityCountsSchema,
  }),
});

/**
 * Type inference for npm v6 audit schema
 */
export type RawNpmV6Audit = z.infer<typeof RawNpmV6AuditSchema>;

/**
 * Type inference for npm v7+ audit schema
 */
export type RawNpmV7PlusAudit = z.infer<typeof RawNpmV7PlusAuditSchema>;

/**
 * Union type for all supported raw npm audit formats
 */
export type RawNpmAudit = RawNpmV6Audit | RawNpmV7PlusAudit;
