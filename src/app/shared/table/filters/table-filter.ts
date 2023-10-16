import { TableFilterDef } from '../../../types/Table';

export abstract class TableFilter {
  private filterDef!: TableFilterDef;

  public getFilterDef(): TableFilterDef {
    return this.filterDef;
  }

  public setFilterDef(filterDef: TableFilterDef) {
    if (!filterDef.reset) {
      if (filterDef.multiple) {
        filterDef.reset = () => {
          filterDef.currentValue = [];
          if (filterDef.defaultValue) {
            filterDef.currentValue.push(filterDef.defaultValue);
          }
        };
      } else {
        filterDef.reset = () =>
          (filterDef.currentValue = filterDef.defaultValue ? filterDef.defaultValue : null);
      }
    }
    filterDef.reset();
    this.filterDef = filterDef;
  }
}
