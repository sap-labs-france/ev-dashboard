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
  GET_TOKENS = 'get_tokens',
  GET_LOCATIONS = 'get_locations',
  SYNC_ALL = 'sync_all',
  START_JOB = 'stop_start_job',
}
