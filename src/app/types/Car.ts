import { Data } from './Table';

export interface Car extends Data {
  id: number;
  vehicleModel: string;
  vehicleMake: string;
  vehicleModelVersion?: string;
  batteryCapacityFull: number;
  fastchargeChargeSpeed: number;
  performanceTopspeed: number;
  performanceAcceleration: number;
  rangeReal: number;
  efficiencyReal: number;
  images: string[];
  image: string;
  drivetrainPropulsion: string;
  drivetrainTorque: number;
  batteryCapacityUseable: number;
  chargePlug: string;
  fastChargePlug: string;
  fastChargePowerMax?: number;
  chargePlugLocation: string;
  chargeStandardPower: number;
  chargeStandardPhase: number;
  chargeStandardChargeSpeed: number;
  chargeStandardChargeTime: number;
  miscSeats: number;
  miscBody: string;
  miscIsofix: boolean;
  miscTurningCircle: number;
  miscSegment: string;
  miscIsofixSeats: number;
  chargeStandardTables: ChargeStandardTable[];
}

export interface ChargeStandardTable extends Data {
  type: string;
  evsePhaseVolt: number;
  evsePhaseAmp: number;
  evsePhase: number;
  chargePhaseVolt: number;
  chargePhaseAmp: number;
  chargePhase: number;
  chargePower: number;
  chargeTime: number;
  chargeSpeed: number;
}
export interface CarMakersTable extends Data {
  carMaker: string;
}

export interface ImageObject extends Data {
  image: string;
}

export enum CarImage {
  NO_IMAGE = 'assets/img/theme/no-logo.png',
}

export enum CarButtonAction {
  SYNCHRONIZE = 'synchronize',
}
