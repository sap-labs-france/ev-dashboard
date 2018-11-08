import {TableFilterDef} from '../../../common.types';

export abstract class TableFilter {
  private filterDef: TableFilterDef;

  // Return the filter
  public getFilterDef(): TableFilterDef {
    return this.filterDef;
  }

  // Return set filter
  public setFilterDef(filterDef: TableFilterDef) {
    this.filterDef = filterDef;
  }
}
