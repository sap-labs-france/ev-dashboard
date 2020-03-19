import { Data } from './Table';

export interface Car extends Data {
  id: number;
  vehicleModel: string;
  vehicleMake: string;
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
  chargePlugLocation: string;
  chargeStandardPower: number;
  chargeStandardChargeSpeed: number;
  chargeStandardChargeTime: number;
  miscSeats: number;
  miscBody: string;
  miscIsofix: boolean;
  miscTurningCircle: number;
  miscSegment: string;
  miscIsofixSeats: number;
  chargeStandardTables: ChargeStandardTable[];
  carObject?: any;
}

export interface ChargeStandardTable {
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

export enum CarImage {
  NO_IMAGE = 'assets/img/theme/no-logo.png',
}
