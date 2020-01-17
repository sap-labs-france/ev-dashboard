import { ValidatorFn } from '@angular/forms';
import { SortDirection } from '@angular/material/typings';
import { KeyValue, ButtonAction } from './GlobalType';
import { ChargingStationButtonAction } from './ChargingStation';
import { UserButtonAction } from './User';
import { TransactionButtonAction } from './Transaction';
import { SiteButtonAction } from './Site';

export interface Data {
  id: string|number;
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
  cleared?: boolean;
}

export interface DropdownItem {
  id: string;
  name: string;
  icon?: string;
  class?: string;
  disabled?: boolean;
  tooltip: string;
}

export declare type FilterType = 'dropdown' | 'dialog-table' | 'date' | '';
export declare type ActionType = 'button' | 'dropdown-button' | 'slide' | '';

export declare type DialogType = 'YES_NO' | 'OK_CANCEL' | 'OK' | 'YES_NO_CANCEL' | 'DIRTY_CHANGE' | 'INVALID_CHANGE';
export declare type ButtonType = 'OK' | 'CANCEL' | 'YES' | 'NO' | 'SAVE_AND_CLOSE' | 'DO_NOT_SAVE_AND_CLOSE';

export enum ButtonColor {
  PRIMARY = 'primary',
  ACCENT = 'accent',
  WARN = 'warn',
}

export interface TableActionDef {
  id: ButtonAction|ChargingStationButtonAction|UserButtonAction|TransactionButtonAction|SiteButtonAction;
  type: ActionType;
  currentValue?: any;
  name: string;
  icon?: string;
  color?: ButtonColor;
  disabled?: boolean;
  isDropdownMenu?: boolean;
  dropdownItems?: DropdownItem[];
  tooltip: string;
  action?(...args: any[]): void;
}

export interface TableDef {
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
  validators?: ValidatorFn[];
  errorMessage?: string;
  headerClass?: string;
  class?: string;
  formatter?: (value: any, row?: any) => string | null;
  sortable?: boolean;
  sorted?: boolean;
  direction?: SortDirection;
  isAngularComponent?: boolean;
  angularComponent?: any;
  defaultValue?: any;
}

export interface TableSearch {
  search: string;
}

export enum TableEditType {
  RADIO_BUTTON = 'radiobutton',
  CHECK_BOX = 'checkbox',
  INPUT = 'input',
}
