import { TableData } from '../Table';

export interface OicpEndpoint extends TableData {
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

export interface OicpEndpointDetail extends TableData {
  id: string;
  oicpendpoint: OicpEndpoint;
  status: string;
  backgroundPatchJob: boolean;
  lastPatchJobOn: Date;
  successNbr: number;
  failureNbr: number;
  totalNbr: number;
}

export enum OicpButtonAction {
  PUSH_EVSES = 'oicp_push_evses',
  PUSH_EVSE_STAUSES = 'oicp_push_evse_statuses',
  SYNC_ALL = 'oicp_sync_all',
  START_JOB = 'stop_start_job',
}

export enum OicpEndpointStatus {
  NEW = 'new',
  REGISTERED = 'registered',
  UNREGISTERED = 'unregistered',
}

export enum OicpRole {
  CPO = 'CPO',
  EMSP = 'EMSP',
}

export enum OicpEndpointPatchJobStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
