import { TagAuthorizationActions } from './Authorization';
import { TableData } from './Table';
import { User } from './User';

export interface Tag extends TableData, TagAuthorizationActions {
  id: string;
  visualID: string;
  issuer: boolean;
  active: boolean;
  userID?: string;
  description?: string;
  transactionsCount?: number;
  lastChangedBy?: Partial<User>;
  lastChangedOn?: Date;
  user?: User;
  default?: boolean;
  limit: TagLimit;
}

export interface TagLimit {
  limitKwhEnabled?: boolean;
  limitKwh?: number;
  limitKwhConsumed?: number;
  changeHistory?: TagChangeHistory[];
}

export interface TagChangeHistory extends TableData {
  lastChangedOn: Date;
  lastChangedBy: Partial<User>;
  oldLimitKwhEnabled: boolean;
  newLimitKwhEnabled: boolean;
  oldLimitKwh: number;
  oldLimitKwhConsumed: number;
  newLimitKwh: number;
  newLimitKwhConsumed: number;
}

export const TagRequiredImportProperties = [
  'id',
  'visualID'
];
export const TagOptionalImportProperties = [
  'description',
  'limitKwh',
  'email',
  'firstName',
  'name',
  'siteIDs',
];

export enum TagButtonAction {
  VIEW_TAG = 'view_tag',
  UNASSIGN_TAGS = 'unassign_tags',
  UNASSIGN_TAG = 'unassign_tag',
  ASSIGN_TAG = 'assign_tag',
  EDIT_TAG = 'edit_tag',
  EDIT_TAG_BY_VISUAL_ID = 'edit_tag_by_visual_id',
  DELETE_TAG = 'delete_tag',
  DELETE_TAGS = 'delete_tags',
  IMPORT_TAGS = 'import_tags',
  CREATE_TAG = 'create_tag',
  EXPORT_TAGS = 'export_tags',
  ACTIVATE_TAG = 'activate_tag',
  DEACTIVATE_TAG = 'deactivate_tag',
  NAVIGATE_TO_TAGS = 'navigate_to_tags'
}
