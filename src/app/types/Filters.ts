import { BaseFilter } from "shared/filters/structures/base-filter.component";

import { KeyValue } from "./GlobalType";

export type FilterValue = string[] | string | Date[] | Date | Number[] | Number | KeyValue[] | KeyValue;

export interface FilterDef {
  id: string;
  httpId: string;
  name: string;
  currentValue: FilterValue;
  cssClass: string;
  label: string;
  dependentFilters?: BaseFilter[];
  visible?: boolean;
}

export interface DropdownFilterDef extends FilterDef {
  items: KeyValue[];
  multiple: boolean;
}

export interface DialogFilterDef extends FilterDef {
  dialogComponent: any;
  multiple: boolean;
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

export enum FilterImplementationTypes {
  ISSUER = 'issuer',
  STATUS = 'status'
}
