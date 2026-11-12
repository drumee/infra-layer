export interface Mailbox { id: string; address: string; quota_bytes: number; receive_enabled: boolean; imap_enabled: boolean; submission_enabled: boolean }
export interface Alias { address: string; mailbox_id: string; receive_enabled: boolean }
export interface Account { id: string; enabled: boolean; credential_generation: number; envelope_from: string[]; header_from: string[] }
export interface Registry { contract: 'drumee.mail-registry/1'; generation: number; mailboxes: Mailbox[]; aliases: Alias[]; accounts: Account[]; domains?: string[]; service_hostname?: string }
export interface MailServiceSpec {
  contract: 'drumee.mail-service/1';
  deployment: { id: string; project: string; root: string; backup_root: string; owner_uid: number; owner_gid: number; images: Record<'postfix'|'dovecot'|'opendkim'|'helper', string> };
  hostname: string; domains: string[]; ip_family?: 'ipv4';
  networks: { edge_subnet: string; edge_gateway: string; private_submission: { address: string; port: number; allowed_sources: string[] } };
  listeners: Record<'smtp25'|'submission587'|'submissions465'|'imaps993', { enabled?: boolean; address: string }>;
  tls: { provider: 'provided'; certificate_ref: string; key_ref: string; client_ca_ref: string; minimum: 'TLSv1.2'; renew_before_days?: number };
  outbound: { mode: 'direct-mx'; tls?: 'opportunistic'|'required-verify'; require_verify_domains?: string[]; maximal_queue_lifetime_seconds?: number; bounce_queue_lifetime_seconds?: number; minimal_backoff_seconds?: number; maximal_backoff_seconds?: number; queue_run_delay_seconds?: number };
  delivery: { transport: 'lmtp-unix'; layout: 'maildir-by-id'; quota_failure: 'temporary'; default_quota_bytes?: number; message_size_bytes?: number };
  dkim: { domain: string; selector: string; key_ref: string }[];
  registry: { schema: 'drumee.mail-registry/1'; bootstrap: 'empty' };
}
export interface Diagnostic { code: string; path: string; severity: 'error'|'warning' }
export interface MailPlan { private_endpoint: { address:string;hostname:string;port:number;network:string }; contract: 'drumee.mail-plan/1'; implementation: string; applicable: true; revision: string; spec: MailServiceSpec; registry: Registry; secret_sources: { ref: string; file: string }[]; artifacts: Record<string,string>; diagnostics: Diagnostic[] }
export interface PreparedMail { contract: 'drumee.mail-prepared/1'; hostname: string; private_port: number; root: string; project: string; revision: string; compose: object; compose_file: string; certificate_fingerprint: string; registry_generation: number; transport_digest: string; files: Record<string,string>; private_files: Record<string,string>; storage: Record<string,{dev:number;ino:number;uid:number;gid:number;mode:number}>; mailbox_identities: Record<string,Record<string,{dev:number;ino:number}>> }
export function validateMailService(spec: unknown): { valid: boolean; normalized?: MailServiceSpec; diagnostics: Diagnostic[] };
export function validateRegistry(registry: unknown, spec: MailServiceSpec): Registry;
export function planMailService(spec: MailServiceSpec, resources?: { registry?: Registry; secret_sources?: { ref: string; file: string }[] }): MailPlan | { applicable: false; diagnostics: Diagnostic[] };
export function composeMailService(plan: MailPlan, distribution?: { acceptance?: boolean; private_bind?: boolean }): object;
export function prepareMailService(plan: MailPlan, context: { authorized: boolean; acceptance?: boolean; private_bind?: boolean; verifiers?: Record<string,string> }): PreparedMail;
export function operateMailService(prepared: PreparedMail, operation: 'start'|'stop'|'restart'|'status'|'preflight', context: { authorized: boolean; acceptance?: boolean }): { revision: string; operation: string; native_output: string };

export function activateMailRegistry(prepared: PreparedMail, context: { authorized: boolean; expected_generation: number }): { applied: true; changed: boolean; generation: number; smtp_revocation?: string; imap_affected_sessions_kicked?: boolean };

export function observeMailService(prepared: PreparedMail, context: { authorized: boolean; queue_age_seconds?: number; auth_failures?: number }): { contract: 'drumee.mail-observation/1'; healthy:boolean; queue: {count:number|null;oldest_age_seconds:number|null}; disks: Record<string,{available_bytes:number;total_bytes:number}>; quotas: {id:string;used_bytes:number;limit_bytes:number}[]; authentication_failures_10m:number; certificate_expires_at:string; alerts: {code:string;resource?:string;mailbox_id?:string}[] };

export function rotateMailTLS(prepared: PreparedMail, sources: {certificate_file:string;key_file:string;ca_file:string}, context:{authorized:boolean}): {changed:boolean;fingerprint:string;endpoints?:object[]};
export function reconcileMailTLS(prepared: PreparedMail, context:{authorized:boolean}): {reconciled:true;fingerprint:string;endpoints:object[]};
