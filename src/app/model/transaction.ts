import { Charger } from './charger';
import { User } from './user';

export interface Transaction {
  id: number;
  timestamp: Date;
  chargeBox: Charger;
  connectorId: number;
  meterStart: number;
  user: User;
  tagID: string;
  stop: {
    user: User;
    tagID: string;
    timestamp: Date;
    meterStop: number;
    totalConsumption: number;
    price: number;
    priceUnit: string;
  };
  dateTimestring: string;
  consumptionstring: string;
}
