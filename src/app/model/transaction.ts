import { Charger } from './charger';
import { User } from './user';

export class Transaction {
  id: Number;
  timestamp: Date;
  chargeBox: Charger;
  connectorId: Number;
  meterStart: Number;
  user: User;
  tagID: String;
  stop: {
    user: User;
    tagID: String;
    timestamp: Date;
    meterStop: Number;
    totalConsumption: Number;
    price: Number;
    priceUnit: String;
  };
  dateTimeString: String;
  consumptionString: String;
}
