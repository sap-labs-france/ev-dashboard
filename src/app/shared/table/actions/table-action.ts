import { TableActionDef } from 'app/types/Table';

export interface TableAction {
  // Return an action
  getActionDef(): TableActionDef;
}
