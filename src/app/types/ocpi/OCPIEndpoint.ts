import CreatedUpdatedProps from 'types/CreatedUpdatedProps';
import { OcpiEndpointAuthorizationActions } from 'types/Authorization';
import { TableData } from '../Table';
import { OCPIBusinessDetails } from './OCPIBusinessDetails';
import { OCPIRole } from './OCPIRole';

export interface OCPIEndpoint
  extends TableData,
  OcpiEndpointAuthorizationActions,
  CreatedUpdatedProps {
  id: string;
  role: OCPIRole;
  name: string;
  baseUrl: string;
  localToken: string;
  token: string;
  countryCode: string;
  partyId: string;
  backgroundPatchJob: boolean;
  status?: OCPIRegistrationStatus;
  version?: string;
  businessDetails?: OCPIBusinessDetails;
  availableEndpoints?: OCPIAvailableEndpoints;
  versionUrl?: string;
  lastCpoPushStatuses?: OCPILastCpoPushStatus;
  lastEmspPushTokens?: OCPILastEmspPushToken;
  lastEmspPullLocations?: OCPILastEmspPullLocation;
  lastCpoPullTokens?: OCPILastCpoPullToken;
}

export interface OCPILastEmspPushToken {
  lastUpdatedOn: Date;
  partial: boolean;
  successNbr: number;
  failureNbr: number;
  totalNbr: number;
  tokenIDsInFailure?: string[];
}

export interface OCPILastEmspPullLocation {
  lastUpdatedOn: Date;
  partial: boolean;
  successNbr: number;
  failureNbr: number;
  totalNbr: number;
  locationIDsInFailure?: string[];
}

export interface OCPILastCpoPullToken {
  lastUpdatedOn: Date;
  partial: boolean;
  successNbr: number;
  failureNbr: number;
  totalNbr: number;
  tokenIDsInFailure?: string[];
}

export interface OCPILastCpoPushStatus {
  lastUpdatedOn: Date;
  partial: boolean;
  successNbr: number;
  failureNbr: number;
  totalNbr: number;
  chargeBoxIDsInFailure?: string[];
}

export interface OCPIAvailableEndpoints {
  credentials: string;
  locations: string;
  tokens: string;
  commands: string;
  sessions: string;
  cdrs: string;
  tariffs: string;
}

export enum OCPIButtonAction {
  PUSH_TOKENS = 'push_tokens',
  PUSH_EVSE_STATUSES = 'push_evse_statuses',
  CHECK_CDRS = 'check_cdrs',
  CHECK_LOCATIONS = 'check_locations',
  CHECK_SESSIONS = 'check_sessions',
  PULL_CDRS = 'pull_cdrs',
  PULL_LOCATIONS = 'pull_locations',
  PULL_SESSIONS = 'pull_sessions',
  PULL_TOKENS = 'pull_tokens',
  START_JOB = 'stop_start_job',
  UPDATE_CREDENTIALS = 'update_credentials',
}

export enum OCPIRegistrationStatus {
  NEW = 'new',
  REGISTERED = 'registered',
  UNREGISTERED = 'unregistered',
}

export enum OCPIEndpointPatchJobStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
