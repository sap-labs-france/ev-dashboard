import { User } from './user';

export interface ConsumptionValue {
  date: Date;
  value: number;
}

export interface ChargerConsumption {
  chargeBoxID: string;
  totalConsumption: number;
  connectorId: number;
  transactionId: number;
  startDateTime: Date;
  endDateTime: Date;
  user: User;
  values: ConsumptionValue[];
}
