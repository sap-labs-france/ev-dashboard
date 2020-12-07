import { TableActionDef } from '../../../types/Table';

export interface TableAction {
  // Return an action
  getActionDef(): TableActionDef;
}
