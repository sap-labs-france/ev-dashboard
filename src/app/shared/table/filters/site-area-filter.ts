import {TableFilter} from './table-filter';
import {Constants} from '../../../utils/Constants';
import {TableFilterDef} from '../../../common.types';
import {SitesFilterDialogComponent} from '../../dialogs/sites/sites-filter-dialog-component';
import {SiteAreasFilterDialogComponent} from '../../dialogs/sites/site-areas-filter-dialog.component';

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
