import { ValidatorFn } from '@angular/forms';
import { SortDirection } from '@angular/material/sort';
import { Dayjs } from 'dayjs';

import { AssetButtonAction } from './Asset';
import { AuthorizationActions, AuthorizationAttributes } from './Authorization';
import { BillingButtonAction, TransferButtonAction } from './Billing';
import { CarButtonAction } from './Car';
import { ChargingStationButtonAction } from './ChargingStation';
import { ChargingStationTemplateButtonAction } from './ChargingStationTemplate';
import { CompanyButtonAction } from './Company';
import { ButtonAction, ButtonActionColor, KeyValue } from './GlobalType';
import { LogButtonAction } from './Log';
import { OCPIButtonAction } from './ocpi/OCPIEndpoint';
import { OicpButtonAction } from './oicp/OICPEndpoint';
import { PricingButtonAction } from './Pricing';
import { RegistrationTokenButtonAction } from './RegistrationToken';
import { SiteButtonAction } from './Site';
import { SiteAreaButtonAction } from './SiteArea';
import { TagButtonAction } from './Tag';
import { TenantButtonAction } from './Tenant';
import { TransactionButtonAction } from './Transaction';
import { UserButtonAction } from './User';

export interface TableData extends AuthorizationAttributes, AuthorizationActions {
  id: string | number;
  key?: string;
  isSelected?: boolean;
  isSelectable?: boolean;
  isExpanded?: boolean;
}

export enum TableDataSourceMode {
  READ_WRITE = 'RW',
  READ_ONLY = 'RO',
}

export interface TableFilterDef {
  id: string;
  httpID: string;
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
  dateRangeTableFilterDef?: DateTimeTableFilterDef;
  dependentFilters?: TableFilterDef[];
  visible?: boolean;
}

export interface DateTimeTableFilterDef {
  startDate?: Dayjs;
  endDate?: Dayjs;
  startDateTimeHttpID?: string;
  endDateTimeHttpID?: string;
  singleDatePicker?: boolean;
  timePicker?: boolean;
  timePickerSeconds?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  displayRanges?: boolean;
}

export interface DateTimeRange {
  startDate: Date;
  endDate: Date;
}

export interface DropdownItem {
  id: string;
  name: string;
  icon?: string;
  class?: string;
  disabled?: boolean;
  tooltip: string;
}

export enum ActionType {
  BUTTON = 'button',
  SLIDE = 'slide'
}

export enum FilterType {
  ALL_KEY = 'all',
  DROPDOWN = 'dropdown',
  DIALOG_TABLE = 'dialog-table',
  DATE = 'date',
  DATE_RANGE = 'date-range',
}

export interface TableActionDef {
  id: ButtonAction | CompanyButtonAction | TenantButtonAction | SiteAreaButtonAction | ChargingStationButtonAction |
  UserButtonAction | TransactionButtonAction | SiteButtonAction | OCPIButtonAction | OicpButtonAction | AssetButtonAction |
  BillingButtonAction | CarButtonAction | LogButtonAction | RegistrationTokenButtonAction | TagButtonAction | PricingButtonAction | ChargingStationTemplateButtonAction |
  TransferButtonAction;
  type: ActionType;
  currentValue?: any;
  name: string;
  icon?: string;
  color?: ButtonActionColor;
  disabled?: boolean;
  visible?: boolean;
  isDropdownMenu?: boolean;
  dropdownActions?: TableActionDef[];
  tooltip: string;
  formRowAction?: boolean;
  linkedToListSelection?: boolean;
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
    additionalParameters?: any;
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
  visible?: boolean;
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
