import { InfrastructurePlanV2, SecretRef } from "../index";
export interface PersistentResource { id: string; source: string; uid: number; gid: number; backup_required: true }
export interface SuppliedService {
  id: string; image: string; uid: number; gid: number; command: string[]; entrypoint?: string[];
  environment?: Record<string, string>; requires: string[];
  mounts: { resource: string; target: string; read_only: boolean }[];
  secret_mounts: { ref: SecretRef; consumer: string; target: string; format: "raw" | "redis-client-config" }[];
  listener_ports?: number[];
  healthcheck?: { test: string[]; interval?: string; timeout?: string; retries: number; start_period?: string };
  validation_command?: string[]; effect?: "idempotent"; artifact_revision?: string;
}
export interface Distribution {
  contract_version: "1"; id: string; profile: "infrastructure" | "kernel";
  helper_image: string; kernel?: SuppliedService; services?: SuppliedService[]; init_jobs: SuppliedService[];
  persistent_resources: PersistentResource[]; schema_versions: Record<string, string>; external_writers: "none";
  provenance: { repository: string; revision: string; path: string; acceptance: "infrastructure" | "contract-fixture" | "real-kernel" };
}
export interface Composition {
  contract_version: "1"; revision: string; plan_revision: string; project: string; instance_id: string;
  plan: InfrastructurePlanV2; distribution: Distribution;
  compose: Record<string, unknown>; resources: Record<string, unknown>[]; projections: Record<string, unknown>[];
  activation_order: string[]; shutdown_order: string[]; applicability: "validated-composition"; acceptance: string;
}
export interface ExecutionContext {
  root: string; authorized: true; create_resources?: boolean; recover?: boolean;
  imports?: { ref: SecretRef; file: string }[];
  backup_evidence?: { directory: string; manifest_digest: string };
  quiescence?: "stop-owned-writers"; resume_after_backup?: boolean;
}
export interface PreparedDeployment {
  contract_version: "1"; project: string; instance_id: string; root: string; secret_store: string;
  revision: string; desired_revision: string; composition: Composition; compose: Record<string, unknown>;
  compose_file: string; candidate: string; files: Record<string, unknown>[];
  fingerprints: { ref: SecretRef; owner: string; type: string; consumers: string[]; fingerprint: string }[];
  certificate?: { fingerprint: string; ca_fingerprint: string | null; expires_at: string; activation_required: true };
  zone?: { file: string; zone_digest: string; serial: number; domain: string };
  prepared: true; activated: false;
}
export interface DeploymentState {
  contract_version: "1"; root: string; project?: string; desired_revision?: string; active_revision: string | null;
  ready: boolean; diagnostic_codes: string[]; acceptance?: string;
  assurance?: "controlled-recreation-and-protocol-verification"; in_memory_config_measured?: false;
  services?: { service: string; container_id: string; protocol_functional: true }[];
  schema_versions?: Record<string, string>; certificate?: Record<string, unknown>;
}
export function composeDeployment(plan: InfrastructurePlanV2, distribution: Distribution): Composition;
export function prepareDeployment(composition: Composition, context: ExecutionContext): Promise<PreparedDeployment>;
export function activateDeployment(prepared: PreparedDeployment, context: ExecutionContext): Promise<DeploymentState & { effect: string; change?: { compatible: boolean; categories: string[] } }>;
export function inspectDeployment(root: string, context: ExecutionContext): Promise<DeploymentState>;
export function diagnoseDeployment(state: DeploymentState): { ready: boolean; diagnostic_codes: string[]; acceptance: string };
export function classifyChanges(active: { prepared: PreparedDeployment; revision: string } | null, prepared: PreparedDeployment): { compatible: boolean; categories: string[] };
export function stopDeployment(prepared: PreparedDeployment, context: ExecutionContext): Promise<{ revision: string; stopped: true; data_preserved: true }>;
export function backupDeployment(root: string, directory: string, context: ExecutionContext): Promise<{ id: string; directory: string; source_revision: string; manifest_digest: string; protected: true; resources: string[] }>;
export function validateBackup(directory: string, schema_versions: Record<string, string>, context: ExecutionContext): Record<string, unknown>;
export function restoreDeployment(directory: string, composition: Composition, context: ExecutionContext): Promise<{ prepared: PreparedDeployment; restored: true; activated: false; kernel_recovery_verified: false; source_revision: string }>;
export function rollbackDeployment(root: string, revision: string, context: ExecutionContext): Promise<DeploymentState>;
export function rotateSecret(root: string, operation: { authorized: true; ref: SecretRef; expected_fingerprint: string; consumer_transition: string }, context: ExecutionContext): Promise<{ id: string; status: string; active_fingerprint: string; previous_fingerprint: string; consumers: string[]; transitioned: string[]; pending_cleanup: true }>;
export function resumeSecretRotation(root: string, id: string, context: ExecutionContext): Promise<Record<string, unknown>>;
export function renewDeployment(root: string, context: ExecutionContext): Promise<DeploymentState>;
export function renewalTrigger(root: string, context: ExecutionContext, now?: number): { applicable: boolean; due?: boolean; expired?: boolean; automatic: false; scheduler?: string; fingerprint?: string };
