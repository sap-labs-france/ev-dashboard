import * as moment from "moment";

import { KeyValue } from "./GlobalType";

export type FilterValue = string[] | KeyValue[] | DateRangeCurrentValue;

export interface BaseFilterDef {
  id: string;
  httpId: FilterHttpIDs;
  currentValue: FilterValue;
  startDateTimeHttpId?: string;
  endDateTimeHttpId?: string;
}
export interface FilterDef extends BaseFilterDef{
  name: string;
  cssClass: string;
  label: string;
  defaultValue: FilterValue;
  dependentFilters?: FilterHttpIDs[];
  visible?: boolean;
}

export interface DropdownFilterDef extends FilterDef {
  items: KeyValue[];
}

export interface DialogFilterDef extends FilterDef {
  dialogComponent: any;
  dialogComponentData?: any;
}

export interface DateRangeFilterDef extends FilterDef {
  timePicker: boolean;
  timePicker24Hour: boolean;
  timePickerSeconds: boolean;
  locale?: Locale;
  ranges?: any;
}

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
