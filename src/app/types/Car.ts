import CreatedUpdatedProps from './CreatedUpdatedProps';
import { Data } from './Table';
import { User, UserCar } from './User';

export interface CarCatalog extends Data {
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
  chargeOptionPower?: number;
  chargeAlternativePower?: number;
  chargeOptionPhase?: number;
  chargeAlternativePhase?: number;
  chargeOptionPhaseAmp?: number;
  chargeAlternativePhaseAmp?: number;
  chargeStandardPhaseAmp?: number;
}

export interface Car extends Data, CreatedUpdatedProps {
  id: string;
  vin: string;
  licensePlate: string;
  carCatalogID: number;
  carCatalog?: CarCatalog;
  userIDs?: string;
  users?: User[];
  carUsers?: UserCar[];
  type?: CarType;
  converter?: CarConverter;
}

export interface CarConverter {
  type: CarConverterType;
  powerWatts: number;
  amperagePerPhase: number;
  numberOfPhases: number;
}

export enum CarConverterType {
  STANDARD = 'S',
  OPTION = 'O',
  ALTERNATIVE = 'A',
}

export interface CarUser extends Data, CreatedUpdatedProps {
  id: string;
  car: Car;
  userID: string;
  default?: boolean;
  owner?: boolean;
}

export enum CarType {
  PRIVATE = 'P',
  COMPANY = 'C',
  POOL_CAR = 'PC',
}

export interface CarMaker extends Data {
  carMaker: string;
}

export interface ChangeEvent {
  changed: boolean;
}

export interface ImageObject extends Data {
  image: string;
}

export enum CarButtonAction {
  VIEW_CAR = 'view_car',
  VIEW_CAR_CATALOG = 'view_car_catalog',
  SYNCHRONIZE = 'synchronize',
  CREATE_CAR = 'create_car',
  EDIT_CAR = 'edit_car',
  DELETE_CAR = 'delete_car'
}
