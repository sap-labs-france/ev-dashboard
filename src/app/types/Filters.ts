import { KeyValue } from "./GlobalType";
import { FilterType } from "./Table";

export type FilterValue = string[] | string | Date[] | Date | Number[] | Number;

export interface FilterDef {
  id: string;
  type: FilterType;
  class: string;
  label: string;
  currentValue: FilterValue;
  displayValue?: () => string;
  reset?: () => void;
  dependentFilters?: FilterDef[];
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
