import { Address } from './Address';
import { Company } from './Company';

export interface StatisticData {
  month: number;
  [key: string]: number;
}

export interface CurrentMetrics {
  name: string;
  id: string;
  companyID: string;
  company: Company;
  currentInstantWatts: number;
  totalConsumption: number;
  currentTotalInactivitySecs: number;
  maximumPower: number;
  maximumNumberOfChargingPoint: number;
  occupiedChargingPoint: number;
  address: Address[];
  image: any;
  trends: any;
  dataConsumptionChart: any;
  dataDeliveredChart: any;
}
