import { BlockDefProperties } from '@inf-monkeys/vines';

export enum AuthType {
  none = 'none',
  service_http = 'service_http',
}

export enum ApiType {
  openapi = 'openapi',
}

export enum SchemaVersion {
  v1 = 'v1',
}

export enum CredentialAuthType {
  AKSK = 'AKSK',
  OAUTH2 = 'OAUTH2',
  QRCODE = 'QRCODE',
}

export interface CredentialDefinition {
  trigger?: boolean;
  name: string;
  displayName: string;
  properties: BlockDefProperties[];
  logo: string;
  type: CredentialAuthType;
}

export interface AuthConfig {
  type: AuthType;
  authorization_type?: 'bearer';
  verification_tokens?: { [x: string]: string };
}

export interface ManifestJson {
  schema_version: SchemaVersion;
  display_name: string;
  namespace: string;
  auth: AuthConfig;
  api: {
    type: ApiType;
    url: string;
  };
  contact_email: string;
  credentials?: CredentialDefinition[];
  credentialEncryptKey?: string;
}
