import { SortDirection } from '@angular/material/typings';

export interface RouteInfo {
  id: string;
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
  children?: ChildrenItems[];
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

export interface Role {
  key: string;
  description: string;
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

export interface Status {
  key: string;
  description: string;
}

export interface SubjectInfo {
  action: string;
  data: {
    id: string;
    type: string;
  };
}

export interface TableDef {
  lineSelection?: {
    enabled: boolean;
    multiple?: boolean;
  },
  footer?: {
    enabled: boolean;
  },
  search?: {
    enabled: boolean;
  }
}

export interface TableColumnDef {
  id: string;
  name: string;
  footerName?: string;
  type?: string;
  headerClass?: string;
  class?: string;
  formatter?: Function,
  formatterOptions?: any,
  sorted?: boolean;
  direction?: SortDirection;
}

export interface Transaction {
  id: number;
  timestamp: Date;
  chargeBox: Charger;
  connectorId: number;
  meterStart: number;
  user: User;
  tagID: string;
  stop: {
    user: User;
    tagID: string;
    timestamp: Date;
    meterStop: number;
    totalConsumption: number;
    price: number;
    priceUnit: string;
  };
  dateTimestring: string;
  consumptionstring: string;
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
