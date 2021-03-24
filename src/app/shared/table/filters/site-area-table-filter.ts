import { SiteAreasDialogComponent } from '../../../shared/dialogs/site-areas/site-areas-dialog.component';
import { FilterType, TableFilterDef } from '../../../types/Table';
import { TableFilter } from './table-filter';

export class SiteAreaTableFilter extends TableFilter {
  public constructor(dependentFilters?: TableFilterDef[]) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'siteAreas',
      httpId: 'SiteAreaID',
      type: FilterType.DIALOG_TABLE,
      defaultValue: '',
      label: '',
      multiple: true,
      name: 'site_areas.titles',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: SiteAreasDialogComponent,
      cleared: true,
      dependentFilters,
    };

    // Set
    this.setFilterDef(filterDef);
  }
}
