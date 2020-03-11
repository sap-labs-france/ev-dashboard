import { Data } from './Table';

export interface Car extends Data {
  id: number;
  VehicleModel: string;
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
}

export enum CarImage {
  NO_IMAGE = 'assets/img/theme/no-logo.png',
}
