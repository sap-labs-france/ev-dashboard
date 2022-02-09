import { KeyValue } from "./GlobalType";

export type FilterValue = string[] | string | Date[] | Date | Number[] | Number | KeyValue[] | KeyValue;

export interface BaseFilterDef {
  id: string;
  httpId: FilterHttpIDs;
  currentValue: FilterValue;
}
export interface FilterDef extends BaseFilterDef{
  name: string;
  cssClass: string;
  label: string;
  // dependentFilters?: BaseFilter[];
  visible?: boolean;
}

export interface DropdownFilterDef extends FilterDef {
  items: KeyValue[];
  multiple: boolean;
}

export interface DialogFilterDef extends FilterDef {
  dialogComponent: any;
  multiple: boolean;
  dialogComponentData?: any;
}

export interface DateRangeFilterDef extends FilterDef {
  singleDatePicker?: boolean;
  minDate?: Date;
  maxDate?: Date;
  timePicker?: boolean;
  timePicker24Hour?: boolean;
  timePickerSeconds?: boolean;
  startDate?: moment.Moment;
  endDate?: moment.Moment;
  locale?: Locale;
  startDateTimeHttpId?: string;
  endDateTimeHttpId?: string;
}

export interface Locale {
  daysOfWeek?: string[];
  monthNames?: string[];
  firstDay?: number;
  displayFormat?: string;
  applyLabel?: string;
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
}
