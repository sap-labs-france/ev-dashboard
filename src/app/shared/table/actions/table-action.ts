import { TableActionDef } from '../../../common.types';

export interface TableAction {
    // Return a filter
    getActionDef(): TableActionDef;
}
