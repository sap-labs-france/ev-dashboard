import {SortDirection} from '@angular/material/typings';

export declare type FilterType = 'dropdown' | 'dialog-table' | 'date' | '';
export declare type ActionType = 'button' | 'slide' | '';

export declare type DialogType = 'YES_NO' | 'OK_CANCEL';
export declare type ButtonType = 'OK' | 'CANCEL' | 'YES' | 'NO';

export interface KeyValue {
  key: string;
  value: string;
  objectRef?: any;
}

export interface TableFilterDef {
  id: string;
  httpId: string;
  type: FilterType;
  name: string;
  currentValue?: any;
  defaultValue?: string;
  class?: string;
  items?: KeyValue[];
  dialogComponent?: any;
  reset?: Function;
}

export interface DropdownItem {
  id: string;
  name: string;
  icon?: string;
  class?: string;
  disabled?: boolean;
}

export interface TableActionDef {
  id: string;
  type: ActionType;
  currentValue?: any;
  name: string;
  icon?: string;
  class?: string;
  isDropdownMenu?: boolean;
  dropdownItems?: DropdownItem[]
}

export interface RouteInfo {
  id: string;
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
  children?: ChildrenItems[];
  admin?: boolean;
  superAdmin?: boolean;
}

export interface ChildrenItems {
  path: string;
  title: string;
  ab: string;
  type?: string;
}

export interface DropdownLink {
  title: string;
  iconClass?: string;
  routerLink?: string;
}

export enum NavItemType {
  Sidebar = 1, // Only ever shown on sidebar
  NavbarLeft = 2, // Left-aligned icon-only link on navbar in desktop mode, shown above sidebar items on collapsed sidebar in mobile mode
  NavbarRight = 3 // Right-aligned link on navbar in desktop mode, shown above sidebar items on collapsed sidebar in mobile mode
}

export interface NavItem {
  type: NavItemType;
  title: string;
  routerLink?: string;
  iconClass?: string;
  numNotifications?: number;
  dropdownItems?: (DropdownLink | 'separator')[];
}

export interface ActionResponse {
  status: string;
  error: string;
}

export interface ChargerConfiguration {
  chargeBoxID: string;
  timestamp: Date;
  configuration: [
    {
      value: string;
      readonly: boolean;
      key: string;
    }
    ];
}

export interface ConsumptionValue {
  date: Date;
  value: number;
  cumulated: number;
  price: number;
  stateOfCharge: number;
}

export interface ChargerConsumption {
  chargeBoxID: string;
  totalConsumption: number;
  connectorId: number;
  transactionId: number;
  startDateTime: Date;
  endDateTime: Date;
  user: User;
  values: ConsumptionValue[];
}

export interface Connector {
  connectorId: number;
  errorCode: string;
  currentConsumption: number;
  totalConsumption: number;
  power: number;
  status: string;
  activeForUser: boolean;
  activeTransactionID: number;
  type: string;
  hasDetails: boolean;
}

export interface Charger {
  id: string;
  chargePointVendor: string;
  chargePointModel: string;
  chargePointSerialnumber: string;
  chargeBoxSerialnumber: string;
  firmwareVersion: string;
  iccid: string;
  imsi: string;
  lastReboot: Date;
  meterType: string;
  meterSerialnumber: string;
  endpoint: string;
  ocppVersion: string;
  lastHeartBeat: Date;
  lastHeartBeatChanged: boolean;
  inactive: boolean;
  chargingStationURL: string;
  numberOfConnectedPhase: number;
  connectors: Connector[];
  siteArea: SiteArea;
  site: Site;
  cannotChargeInParallel: boolean;
  maximumPower: number;
  powerLimitUnit: string;
}

export interface ChargerResult {
  count: number,
  result: Charger[]
}

export interface Address {
  address1: string;
  address2: string;
  postalCode: string;
  city: string;
  department: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Company {
  id: string;
  name: string;
  address: Address;
  logo: string;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface Image {
  id: string;
  image: string;
}

export interface Images {
  id: string;
  images: string[];
}

export interface Log {
  id: string;
  level: string;
  source: string;
  module: string;
  method: string;
  timestamp: Date;
  action: string;
  type: string;
  message: string;
  user: string,
  actionOnUser: string,
  detailedMessages: string[];
}

export interface LogResult {
  count: number,
  result: Log[]
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  subdomain: string;
}

export interface TenantResult {
  count: number,
  result: Tenant[]
}

export interface Setting {
  id: string;
  identifier: string;
  content: any;
}

export interface SettingResult {
  count: number,
  result: Setting[]
}

export interface Ocpiendpoint {
  id: string;
  name: string;
  countryCode: string;
  partyID: string;
  version: string;
  status: string;
}

export interface OcpiendpointResult {
  count: number,
  result: Ocpiendpoint[]
}

export interface TransactionResult {
  count: number,
  result: Transaction[]
}

export interface Logo {
  id: string;
  logo: string;
}

export interface Ordering {
  field: string;
  direction: string;
}

export interface Paging {
  limit: number;
  skip: number;
}

export interface Pricing {
  id: string;
  timestamp: Date;
  priceKWH: number;
  priceUnit: string;
}

export interface SiteArea {
  id: string;
  name: string;
  image: string;
  accessControl: boolean;
  siteID: string;
  site: Site;
  chargeBoxes: Charger[];
}

export interface Site {
  id: string;
  name: string;
  companyID: string;
  company: Company;
  siteAreas: SiteArea[];
  address: Address;
  image: string;
  images: Object[];
  gps: string;
  consumptionData: Object;
  occupationData: Object;
  userIDs: string[];
  users: User[];
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface SiteResult {
  count: number,
  result: Site[]
}

export interface SiteAreaResult {
  count: number,
  result: SiteArea[]
}

export interface SubjectInfo {
  action: string;
  data: {
    id: string;
    type: string;
  };
}

export interface TableDef {
  class?: string;
  rowSelection?: {
    enabled: boolean;
    multiple?: boolean;
  },
  footer?: {
    enabled: boolean;
  },
  search?: {
    enabled: boolean;
  },
  design?: {
    flat: boolean;
  },
  rowDetails?: {
    enabled: boolean;
    detailsField?: string;
    isDetailComponent?: boolean;
    detailComponentName?: any;
    hideShowField?: string;
  },
  rowFieldNameIdentifier?: string,
  isSimpleTable?: boolean;
}

export interface TableColumnDef {
  id: string;
  name: string;
  footerName?: string;
  type?: string;
  headerClass?: string;
  class?: string;
  dynamicClass?: Function;
  formatter?: Function,
  sortable?: boolean,
  sorted?: boolean;
  direction?: SortDirection;
  isAngularComponent?: boolean
  angularComponentName?: any;
  defaultValue?: any;
}

export interface TableSearch {
  search: string;
}

export interface Transaction {
  id: number;
  timestamp: Date;
  chargeBox: Charger;
  chargeBoxID: string;
  connectorId: number;
  meterStart: number;
  currentConsumption: number;
  totalConsumption: number;
  totalInactivitySecs: number;
  totalDurationSecs: number;
  stateOfCharge: number;
  currentStateOfCharge: number;
  isLoading: boolean;
  user: User;
  tagID: string;
  status: string;
  stop: {
    user: User;
    tagID: string;
    timestamp: Date;
    meterStop: number;
    totalConsumption: number;
    stateOfCharge: number;
    price: number;
    priceUnit: string;
  };
  dateTimestring: string;
  values: ConsumptionValue[];
}

export interface User {
  id: string;
  name: string;
  firstName: string;
  fullName: string;
  tagIDs: string;
  email: string;
  phone: Date;
  mobile: string;
  address: {
    address1: string;
    address2: string;
    postalCode: string;
    city: string;
    department: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  iNumber: string;
  costCenter: boolean;
  status: string;
  image: string;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
  role: string;
  locale: string;
  auths: any;
  language: string;
  numberOfSites: number;
  activeComponents?: Array<string>;
}

export interface UserResult {
  count: number,
  result: User[]
}

export interface VehicleManufacturer {
  id: string;
  logo: string;
  name: string;
  vehicles: Vehicle[];
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface Vehicle {
  id: string;
  images: string[];
  numberOfImages: number;
  manufacturer: string;
  model: string;
  batteryKW: number;
  autonomyKmWLTP: number;
  autonomyKmReal: number;
  horsePower: number;
  torqueNm: number;
  performance0To100kmh: number;
  weightKg: number;
  lengthMeter: number;
  widthMeter: number;
  heightMeter: number;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface ScheduleSlot {
  start: Date;
  end: Date;
  limit: number;
}
export interface ConnectorSchedule {
  connectorId: number;
  slots: ScheduleSlot[];
}
