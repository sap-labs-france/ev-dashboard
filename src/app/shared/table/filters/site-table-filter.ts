import { SitesDialogComponent } from '../../../shared/dialogs/sites/sites-dialog.component';
import { FilterType, TableFilterDef } from '../../../types/Table';
import { TableFilter } from './table-filter';

export class SiteTableFilter extends TableFilter {
  public constructor(dependentFilters?: TableFilterDef[]) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'sites',
      httpId: 'SiteID',
      type: FilterType.DIALOG_TABLE,
      defaultValue: '',
      label: '',
      multiple: true,
      name: 'sites.titles',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: SitesDialogComponent,
      cleared: true,
      dependentFilters,
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
