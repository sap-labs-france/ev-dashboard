import { ChargingRateUnitType, ChargingStation } from '../types/ChargingStation';
import { ChargingProfileAuthorizationActions, DialogData } from './Authorization';
import { TableData } from './Table';

export interface ChargingProfile
  extends ChargingProfileAuthorizationActions,
  TableData,
  DialogData {
  id: string;
  chargingStationID: string;
  chargingStation?: ChargingStation;
  chargePointID: number;
  connectorID?: number;
  profile: Profile;
}

export interface Profile extends TableData {
  chargingProfileId: number;
  transactionId?: number;
  stackLevel: number;
  chargingProfilePurpose: ChargingProfilePurposeType;
  chargingProfileKind: ChargingProfileKindType;
  recurrencyKind: RecurrencyKindType;
  validFrom?: Date;
  validTo?: Date;
  chargingSchedule: ChargingSchedule;
}

export interface ChargingSchedule {
  duration?: number;
  startSchedule?: Date;
  chargingRateUnit: ChargingRateUnitType;
  chargingSchedulePeriod: ChargingSchedulePeriod[];
  minChargeRate?: number;
}

export interface ChargingSchedulePeriod {
  startPeriod: number;
  limit: number;
  numberPhases?: number;
}

export enum ChargingProfileKindType {
  ABSOLUTE = 'Absolute',
  RECURRING = 'Recurring',
  RELATIVE = 'Relative',
}

export enum ChargingProfilePurposeType {
  CHARGE_POINT_MAX_PROFILE = 'ChargePointMaxProfile',
  TX_DEFAULT_PROFILE = 'TxDefaultProfile',
  TX_PROFILE = 'TxProfile',
}

export enum GetCompositeScheduleStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export interface GetCompositeScheduleCommandResult {
  status: GetCompositeScheduleStatus;
  connectorId?: number;
  scheduleStart?: Date;
  chargingSchedule: ChargingSchedule;
}

export enum RecurrencyKindType {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
}

export interface Schedule extends TableData {
  id: number;
  startDate: Date;
  endDate?: Date;
  duration: number;
  limit: number;
  limitInkW: number;
}
