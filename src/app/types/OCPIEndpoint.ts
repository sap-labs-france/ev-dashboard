import { Data } from './Table';

export interface OcpiEndpoint extends Data {
  id: string;
  name: string;
  role: string;
  baseUrl: string;
  countryCode: string;
  partyId: string;
  version?: string;
  status?: string;
  localToken: string;
  token: string;
  backgroundPatchJob: boolean;
  lastPatchJobOn: Date;
  lastPatchJobResult?: any;
}

export interface OcpiEndpointDetail extends Data {
  id: string;
  ocpiendpoint: OcpiEndpoint;
  status: string;
  backgroundPatchJob: boolean;
  lastPatchJobOn: Date;
  successNbr: number;
  failureNbr: number;
  totalNbr: number;
}

export enum OcpiButtonAction {
  PUSH_TOKENS = 'push_tokens',
  PUSH_LOCATIONS = 'push_locations',
  GET_CDRS = 'get_cdrs',
  GET_LOCATIONS = 'get_locations',
  GET_SESSIONS = 'get_sessions',
  GET_TOKENS = 'get_tokens',
  SYNC_ALL = 'sync_all',
  START_JOB = 'stop_start_job',
}

export enum OcpiEndpointStatus {
  NEW = 'new',
  REGISTERED = 'registered',
  UNREGISTERED = 'unregistered',
}

export enum OcpiRole {
  CPO = 'CPO',
  EMSP = 'EMSP',
}

export enum OcpiEndpointPatchJobStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
