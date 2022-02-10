import { ChartTypeValues } from './Chart';
import { AssetInError, ChargingStationInError } from './InError';

export enum CardTypes {
  DANGER = 'danger',
  SUCCESS = 'success',
  PRIMARY = 'primary',
  WARNING = 'warning'
}

export interface BaseCard {
  display: boolean,
  title: string,
  description: string,
  type?: CardTypes,
  details?: ChargingStationInError[] | AssetInError[],
}

export interface NumberCard extends BaseCard{
  icon?: string,
};

export interface ChartCard extends BaseCard{
  chartType: ChartTypeValues,
}
