import { Data } from './Table';

export interface Image {
  id: string;
  image: string;
}

export interface Images {
  id: string;
  images: string[];
}

export interface Logo {
  id: string;
  logo: string;
}

export interface SubjectInfo {
  action: string;
  data: {
    id: string;
    type: string;
  };
}

export interface KeyValue {
  key: string;
  value: string;
  objectRef?: any;
  readonly?: boolean;
  icon?: string;
  tooltip?: string;
}

export interface FilterParams {
  [param: string]: string | string[];
}

export enum ButtonAction {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  EDIT = 'edit',
  OPEN_IN_MAPS = 'open_in_maps',
  MORE = 'more',
  DELETE = 'delete',
  DELETE_MANY = 'delete_many',
  INLINE_DELETE = 'inline-delete',
  REFRESH = 'refresh',
  AUTO_REFRESH = 'auto-refresh',
  EXPORT = 'export',
  EXPORT_AS_CSV = 'export-as-csv',
  ADD = 'add',
  CREATE = 'create',
  COPY = 'copy',
  MULTI_COPY = 'multi-copy',
  MULTI_CREATE = 'multi-create',
  NO_ACTION = 'block',
  OPEN = 'open',
  OPEN_URL = 'open_url',
  REGISTER = 'register',
  REMOVE = 'remove',
  RESET_FILTERS = 'reset-filters',
  REVOKE = 'revoke',
  SEND = 'send',
  SETTINGS = 'settings',
  START = 'start',
  STOP = 'stop',
  UNREGISTER = 'unregister',
  VIEW = 'view',
  INLINE_SAVE = 'inline-save',
  DOWNLOAD = 'download',
}

export enum ChipType {
  PRIMARY = 'chip-primary',
  DEFAULT = 'chip-default',
  INFO = 'chip-info',
  SUCCESS = 'chip-success',
  DANGER = 'chip-danger',
  WARNING = 'chip-warning',
  GREY = 'chip-grey',
}

export enum LevelText {
  INFO = 'text-success',
  DANGER = 'text-danger',
  WARNING = 'text-warning',
}

export enum RestResponse {
  SUCCESS = 'Success',
}
