import { TableActionDef } from '../../../common.types';

export interface TableAction {
  // Return an action
  getActionDef(): TableActionDef;
}
