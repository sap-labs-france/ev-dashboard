import { ValidatorFn } from '@angular/forms';
import { SortDirection } from '@angular/material/sort';
import * as moment from 'moment';

import { AssetButtonAction } from './Asset';
import { BillingButtonAction } from './Billing';
import { CarButtonAction } from './Car';
import { ChargingStationButtonAction } from './ChargingStation';
import { CompanyButtonAction } from './Company';
import { ButtonAction, KeyValue } from './GlobalType';
import { LogButtonAction } from './Log';
import { SiteButtonAction } from './Site';
import { SiteAreaButtonAction } from './SiteArea';
import { TenantButtonAction } from './Tenant';
import { TransactionButtonAction } from './Transaction';
import { UserButtonAction } from './User';
import { OcpiButtonAction } from './ocpi/OCPIEndpoint';

export interface Data {
  id: string | number;
  key: string;
  isSelected?: boolean;
  isSelectable?: boolean;
  isExpanded?: boolean;
}

export interface TableFilterDef {
  id: string;
  httpId: string;
  type: FilterType;
  name: string;
  label?: string;
  currentValue?: any;
  defaultValue?: any;
  class?: string;
  items?: KeyValue[];
  dialogComponent?: any;
  dialogComponentData?: any;
  reset?: () => void;
  multiple?: boolean;
  exhaustive?: boolean;
  cleared?: boolean;
  dateRangeTableFilterDef?: DateRangeTableFilterDef;
}

export interface DateRangeTableFilterDef {
  singleDatePicker?: boolean;
  minDate?: Date;
  maxDate?: Date;
  timePicker?: boolean;
  timePicker24Hour?: boolean;
  timePickerSeconds?: boolean;
  startDate?: moment.Moment;
  endDate?: moment.Moment;
  locale?: Locale;
}

export interface Locale {
  daysOfWeek: string[];
  monthNames: string[];
  firstDay: number;
}
export interface DropdownItem {
  id: string;
  name: string;
  icon?: string;
  class?: string;
  disabled?: boolean;
  tooltip: string;
}

// export declare type FilterType = 'dropdown' | 'dialog-table' | 'date' | '';
export declare type ActionType = 'button' | 'dropdown-button' | 'slide' | '';
// export declare type DialogType = 'YES_NO' | 'OK_CANCEL' | 'OK' | 'YES_NO_CANCEL' | 'DIRTY_CHANGE' | 'INVALID_CHANGE';
// export declare type ButtonType = 'OK' | 'CANCEL' | 'YES' | 'NO' | 'SAVE_AND_CLOSE' | 'DO_NOT_SAVE_AND_CLOSE';

export enum FilterType {
  ALL_KEY = 'all',
  DROPDOWN = 'dropdown',
  DIALOG_TABLE = 'dialog-table',
  DATE = 'date',
  DATE_RANGE = 'date-range',
}

export enum ButtonType {
  OK = 'OK',
  CANCEL = 'CANCEL',
  YES = 'YES',
  NO = 'NO',
  SAVE_AND_CLOSE = 'SAVE_AND_CLOSE',
  DO_NOT_SAVE_AND_CLOSE = 'DO_NOT_SAVE_AND_CLOSE',
}

export enum ButtonColor {
  BASIC = '',
  PRIMARY = 'primary',
  ACCENT = 'accent',
  WARN = 'warn',
}

export enum DialogType {
  OK = 'OK',
  YES_NO = 'YES_NO',
  OK_CANCEL = 'OK_CANCEL',
  YES_NO_CANCEL = 'YES_NO_CANCEL',
  INVALID_CHANGE = 'INVALID_CHANGE',
  DIRTY_CHANGE = 'DIRTY_CHANGE',
}

export interface TableActionDef {
  id: ButtonAction | CompanyButtonAction | TenantButtonAction | SiteAreaButtonAction | ChargingStationButtonAction |
  UserButtonAction | TransactionButtonAction | SiteButtonAction | OcpiButtonAction | AssetButtonAction |
  BillingButtonAction | CarButtonAction | LogButtonAction;
  type: ActionType;
  currentValue?: any;
  name: string;
  icon?: string;
  color?: ButtonColor;
  disabled?: boolean;
  isDropdownMenu?: boolean;
  dropdownActions?: TableActionDef[];
  tooltip: string;
  formRowAction?: boolean;
  action?(...args: any[]): void;
}

export interface TableDef {
  id?: string;
  class?: string;
  isEditable?: boolean;
  errorMessage?: string;
  rowSelection?: {
    enabled: boolean;
    multiple?: boolean;
  };
  footer?: {
    enabled: boolean;
  };
  search?: {
    enabled: boolean;
  };
  design?: {
    flat: boolean;
  };
  rowDetails?: {
    enabled: boolean;
    detailsField?: string;
    angularComponent?: any;
    showDetailsField?: string;
  };
  rowFieldNameIdentifier?: string;
  isSimpleTable?: boolean;
  hasDynamicRowAction?: boolean;
}

export interface TableColumnDef {
  id: string;
  name: string;
  footerName?: string;
  type?: string;
  editType?: TableEditType;
  unique?: boolean;
  canBeDisabled?: boolean;
  validators?: ValidatorFn[];
  errors?: {
    id: string;
    message: string;
    messageParams?: Record<string, unknown>;
  }[];
  headerClass?: string;
  class?: string;
  formatter?: (value: any, row?: any) => string | null;
  sortable?: boolean;
  sorted?: boolean;
  direction?: SortDirection;
  isAngularComponent?: boolean;
  angularComponent?: any;
  defaultValue?: any;
  additionalParameters?: any;
}

export interface TableSearch {
  search: string;
}

export enum TableEditType {
  RADIO_BUTTON = 'radiobutton',
  CHECK_BOX = 'checkbox',
  INPUT = 'input',
  DATE_TIME_PICKER = 'datetimepicker',
  DISPLAY_ONLY = 'displayonly',
}
