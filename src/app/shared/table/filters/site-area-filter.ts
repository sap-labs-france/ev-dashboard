import { TableFilterDef } from '../../../common.types';
import { Constants } from '../../../utils/Constants';
import { SiteAreasFilterDialogComponent } from '../../dialogs/site-areas/site-areas-filter-dialog.component';
import { TableFilter } from './table-filter';

export class SiteAreasTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'siteAreas',
      httpId: 'SiteAreaID',
      type: Constants.FILTER_TYPE_DIALOG_TABLE,
      defaultValue: 'general.all',
      name: 'site_areas.title',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: SiteAreasFilterDialogComponent
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
