import * as moment from "moment";

export interface Locale {
  daysOfWeek?: string[];
  monthNames?: string[];
  firstDay?: number;
  displayFormat?: string;
  applyLabel?: string;
}

export interface DateRangeCurrentValue {
  startDate: moment.Moment,
  endDate: moment.Moment
}

export enum FilterHttpIDs {
  ISSUER = 'Issuer',
  STATUS = 'Active',
  CONNECTOR = 'ConnectorID',
  ERROR_TYPE = 'ErrorType',
  SITE = 'SiteID',
  CAR_MAKER = 'CarMaker',
  CHARGING_STATION = 'ChargingStationID',
  COMPANY = 'CompanyID',
  REPORTS = 'ReportIDs',
  SITE_AREA = 'SiteAreaID',
  TAG = 'VisualTagID',
  USER = 'UserID',
  ALTERNATE = 'ALTERNATE',
  START_DATE_TIME = 'StartDateTime',
  END_DATE_TIME = 'EndDateTime',
}

export enum FilterIDs {
  ISSUER = 'issuer',
  STATUS = 'status',
  CONNECTOR = 'connector',
  ERROR_TYPE = 'errorType',
  SITE = 'sites',
  CAR_MAKER = 'carMakers',
  CHARGING_STATION = 'charger',
  COMPANY = 'companies',
  REPORTS = 'refundData',
  SITE_AREA = 'siteAreas',
  TAG = 'tag',
  USER = 'user',
  DATE_RANGE = 'dateRange',
}
