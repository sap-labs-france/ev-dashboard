import { Data } from './Table';
import { PowerLimitUnits } from 'app/types/ChargingStation';

export interface ScheduleSlot {
  start: Date;
  end: Date;
  limit: number;
}

export interface ConnectorSchedule {
  connectorId: number;
  slots: ScheduleSlot[];
}

export interface ChargingProfile extends Data {
  id: number;
  chargingProfileId: number;
  transactionId?: number;
  stackLevel: number;
  chargingProfilePurpose: ChargingProfilePurposeType;
  chargingProfileKind: ChargingProfileKindType;
  recurrencyKind: RecurrencyKindType;
  validFrom?: Date;
  validTo?: Date;
  chargingSchedule: ChargingSchedule
}

export interface ChargingSchedule {
  duration?: number;
  startSchedule?: Date;
  chargingRateUnit: PowerLimitUnits;
  chargingSchedulePeriod: ChargingSchedulePeriod[]
  minChargeRate?: number;
}

export interface ChargingSchedulePeriod {
  startPeriod: number;
  limit: number;
  numberPhases?: number;
}


export enum ChargingProfileKindType{
  ABSOLUTE = 'Absolute',
  RECURRING = 'Recurring',
  RELATIVE = 'Relative'
}

export enum ChargingProfilePurposeType {
  CHARGE_POINT_MAX_PROFILE = 'ChargePointMaxProfile',
  TX_DEFAULT_PROFILE = 'TxDefaultProfile',
  TX_PROFILE = 'TxProfile'
}

export enum RecurrencyKindType {
  DAILY = 'Daily',
  WEEKLY = 'Weekly'
}

export interface Slot {
  id: number;
  displayedStartValue: Date;
  duration: number;
  limit: number;
  displayedLimitInkW: number;
}

