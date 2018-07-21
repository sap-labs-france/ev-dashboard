import { User } from './user';

export class ConsumptionValue {
  date: Date;
  value: Number;
}

export class ChargerConsumption {
  chargeBoxID: String;
  totalConsumption: Number;
  connectorId: Number;
  transactionId: Number;
  startDateTime: Date;
  endDateTime: Date;
  user: User;
  values: ConsumptionValue[];
}
