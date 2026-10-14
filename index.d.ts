// Documentation declarations only. Runtime implementation is CommonJS JavaScript.
export interface SecretRef { resource: string; key: string }
export interface Endpoint { host: string; port: number; transport: "tcp" }
export interface InfrastructureSpec {
  contract_version: "1";
  instance: { id: string; domain?: string };
  dns: { mode: "none" | "local" | "localhost" };
  http: { enabled: boolean; https: boolean; accepted_hosts?: string[] };
  tls?: { provider: "provided"; certificate_ref: SecretRef; private_key_ref: SecretRef };
}
export interface KernelInfrastructureRequirements {
  contract_version: "1";
  http: {
    service_endpoint: Endpoint; page_endpoint: Endpoint; websocket_endpoint: Endpoint;
    public_assets: { id: string; url_prefix: string; root: string }[];
    delegated_artifact_root: string; internal_artifact_prefix: string;
    max_binary_chunk_bytes: number; readiness_path: string; bootstrap_paths: string[];
  };
}
export interface DockerNginxInput {
  kind: "docker-nginx"; project: string; network: string; image: string;
  listen_port: number; health_port: number;
  bindings: { host_address: string; host_port: number }[];
  artifact_view: { source: string; target: string; kernel_target: string };
  public_views: { id: string; source: string; target: string }[];
  tls_views?: { ref: SecretRef; source: string; target: string }[];
  tmpfs_bytes: number;
  timeouts: { client_body_seconds: number; upstream_seconds: number; websocket_seconds: number; send_seconds: number };
}
export interface Diagnostic { code: string; field: string; severity: "error" | "info" }
export interface Observation { ports?: { address: string; port: number; protocol: "tcp" | "udp" }[] }
export interface InfrastructurePlan {
  contract_version: "1"; applicable: boolean; revision?: string; effective_domain?: string;
  diagnostics: Diagnostic[]; conflicts: Diagnostic[];
  artifacts: { path: string; digest: string; content: string; mode: number }[];
  resources: object[]; compatibility: { code: string; validation?: string; satisfied?: boolean }[];
  prerequisites: { owner: string; code: string }[];
  inputs?: { spec: InfrastructureSpec; requirements: KernelInfrastructureRequirements; adapter_input: DockerNginxInput };
}
export interface Deployment {
  id: string; desired_revision: string; container_id?: string;
  /** Required by docker-nginx; exact applicable plan, not caller-provided URLs. */
  plan?: InfrastructurePlan;
}
export interface GatewayObservation {
  running?: boolean; health?: string; observed_revision?: string; active_revision?: string; http_ready?: boolean;
  diagnostic_codes?: string[];
  loaded_configuration?: { status: "unknown" | "unverified" | "verified"; revision?: string; evidence?: "activation-attestation" | "process-attestation" };
  protected_delivery_verified?: boolean;
}
export interface InfrastructureState {
  contract_version: "1"; deployment: string; desired_revision: string; observed_revision?: string;
  /** Compatibility alias for observed_revision; never evidence of loaded config. */
  active_revision?: string;
  loaded_configuration: { status: "unknown" | "unverified" | "verified"; revision?: string; evidence?: string };
  verification: { functional: boolean; protected_delivery: "verified" | "unverified" };
  capabilities: { name: string; required: boolean; readiness: "ready" | "degraded" | "failed"; diagnostic_codes: string[] }[];
  dependencies: { name: string; readiness: "ready" | "unknown" }[];
  metadata: { adapter: string; runtime_id?: string };
}
/** Opt-in IL-2 contract. Version 1 fields retain their original semantics. */
export type CapabilityName = "http-gateway" | "tls" | "dns" | "database" | "redis" | "smtp";
export interface SecretDescriptor {
  ref: SecretRef;
  type: "database-admin" | "database-service" | "redis-auth" | "tls-ca-key" | "tls-leaf-key" | "acme-account-key" | "acme-dns-credential" | "dkim-key" | "smtp-relay-credential" | "dns-tsig";
  consumers: string[];
}
export type DnsSpec = { mode: "none" | "localhost" } | {
  mode: "local"; ipv4: string; ipv6?: string; ipv6_reachable?: true;
  serial: number; clients: string[]; listen: string[]; recursion: boolean;
  forwarders?: string[]; tsig_ref?: SecretRef; split_horizon?: true; state_resource: string;
};
export type TlsSpec = {
  certificate_ref: SecretRef; private_key_ref: SecretRef; ca_bundle_ref: SecretRef;
} & ({ provider: "provided" } | {
  provider: "local"; ca_key_ref: SecretRef; state_resource: string; leaf_days: number; renew_before_days: number;
} | {
  provider: "acme"; account_key_ref: SecretRef; challenge_secret_ref: SecretRef;
  state_resource: string; leaf_days: number; renew_before_days: number;
  acme_directory: "https://acme-v02.api.letsencrypt.org/directory" | "https://acme-staging-v02.api.letsencrypt.org/directory";
  dns_provider: "cloudflare"; email: string;
});
export type DatabaseSpec = { endpoint: Endpoint; engine_series: "11.4"; service_user: string; service_secret_ref: SecretRef } &
  ({ mode: "external" } | { mode: "managed"; admin_secret_ref: SecretRef; state_resource: string; initialize: boolean });
export type RedisSpec = { endpoint: Endpoint; auth_secret_ref: SecretRef } &
  ({ mode: "external"; persistence: "ephemeral" | "aof" } | { mode: "managed"; persistence: "ephemeral" } | { mode: "managed"; persistence: "aof"; state_resource: string });
export interface MailSpec {
  mode: "capture" | "relay"; endpoint: Endpoint; hostname: string; relay_endpoint: Endpoint;
  relay_tls: "none" | "required"; relay_user?: string; relay_secret_ref?: SecretRef;
  submission_user?: string; submission_secret_ref?: SecretRef; clients: string[];
  queue_resource: string; initialize: boolean;
  dkim?: { domain: string; selector: string; key_ref: SecretRef; public_key?: string };
}
export interface InfrastructureSpecV2 {
  contract_version: "2"; instance: InfrastructureSpec["instance"]; http: InfrastructureSpec["http"];
  dns: DnsSpec; secrets: { store_resource: string; resources: SecretDescriptor[] };
  tls?: TlsSpec; database?: DatabaseSpec; redis?: RedisSpec; mail?: MailSpec;
}
export interface KernelInfrastructureRequirementsV2 { contract_version: "2"; capabilities: CapabilityName[]; http?: KernelInfrastructureRequirements["http"] }
export interface DockerServiceInput {
  image: string; uid: number; gid: number; listen_port: number; data_source?: string;
  bindings: { host_address: string; host_port: number; protocol: "tcp" | "udp" }[];
}
export interface DockerServicesInput {
  kind: "docker-services"; project: string; network: string;
  services: Partial<Record<"dns" | "database" | "redis" | "mail" | "dkim", DockerServiceInput>>;
  resource_sources: { ref: SecretRef; source: string }[]; gateway?: DockerNginxInput;
}
export interface InfrastructurePlanV2 extends Omit<InfrastructurePlan, "contract_version" | "inputs"> {
  contract_version: "2"; capabilities: { name: CapabilityName; required: boolean }[];
  required_secrets?: SecretDescriptor[];
  inputs?: { spec: InfrastructureSpecV2; requirements: KernelInfrastructureRequirementsV2; adapter_input: DockerServicesInput };
}
export interface DeploymentV2 { contract_version: "2"; id: string; desired_revision: string; plan: InfrastructurePlanV2; containers?: Record<string, string> }
export interface CapabilityObservation {
  name: CapabilityName; observed_revision?: string; resource_present?: boolean; configuration_valid?: boolean;
  loaded_configuration?: { revision: string; evidence: "runtime-configuration-attestation" };
  running?: boolean; health?: string; protocol_functional?: boolean; dependencies_satisfied?: boolean;
  pending_activation?: boolean; engine_compatible?: boolean; protected_delivery_verified?: boolean; diagnostic_codes?: string[];
}
export interface InfrastructureStateV2 {
  contract_version: "2"; deployment: string; desired_revision: string; metadata: { adapter: string };
  capabilities: { name: CapabilityName; required: boolean; readiness: "ready" | "degraded" | "unknown";
    diagnostic_codes: string[]; observed_revision?: string; configuration_valid: "valid" | "unverified";
    resource_present: boolean; process_healthy: boolean; protocol_functional: boolean;
    loaded_configuration: "verified" | "unverified"; dependencies_satisfied: boolean; pending_activation: boolean;
    schema_prerequisites?: "kernel-module-owner"; engine_compatible?: "compatible" | "incompatible" | "unverified"; version?: string; certificate_fingerprint?: string; expires_at?: string }[];
}
export function validateSpec(spec: InfrastructureSpecV2, requirements: KernelInfrastructureRequirementsV2): { valid: boolean; diagnostics: Diagnostic[]; effective_domain?: string; spec?: InfrastructureSpecV2; requirements?: KernelInfrastructureRequirementsV2 };
export function planInfrastructure(spec: InfrastructureSpecV2, requirements: KernelInfrastructureRequirementsV2, adapter_input: DockerServicesInput, observation?: Observation): InfrastructurePlanV2;
export function renderPlan(plan: InfrastructurePlanV2, output_directory: string): { revision: string; files: string[]; activated: false };
export function inspectInfrastructure(deployment: DeploymentV2, adapter: { kind?: string; observe(deployment: DeploymentV2): Promise<{ capabilities?: CapabilityObservation[]; error?: string }> }): Promise<InfrastructureStateV2>;
export function diagnoseInfrastructure(state: InfrastructureStateV2, requirements: KernelInfrastructureRequirementsV2): { ready: boolean; diagnostics: { code: string; capability?: string }[] };

export function validateSpec(spec: unknown, requirements: unknown): {
  valid: boolean; diagnostics: Diagnostic[]; effective_domain?: string;
  spec?: InfrastructureSpec; requirements?: KernelInfrastructureRequirements;
};
export function planInfrastructure(spec: unknown, requirements: unknown, adapter_input: unknown, observation?: Observation): InfrastructurePlan;
export function renderPlan(plan: InfrastructurePlan, output_directory: string): { revision: string; files: string[]; activated: false };
export function inspectInfrastructure(deployment: Deployment, adapter: { kind?: string; observe(deployment: Deployment): Promise<GatewayObservation> }): Promise<InfrastructureState>;
export function diagnoseInfrastructure(state: InfrastructureState, requirements: KernelInfrastructureRequirements): { ready: boolean; diagnostics: { code: string; capability?: string }[] };
