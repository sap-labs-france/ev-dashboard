import { TableFilterDef } from '../../../common.types';

export interface TableFilter {
    // Return a filter
    getFilterDef(): TableFilterDef;
}
