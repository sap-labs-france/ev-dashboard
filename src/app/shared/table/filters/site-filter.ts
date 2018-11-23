import {TableFilter} from './table-filter';
import {Constants} from '../../../utils/Constants';
import {TableFilterDef} from '../../../common.types';
import {SitesFilterDialogComponent} from '../../dialogs/sites/sites-filter-dialog-component';

export class SitesTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'sites',
      httpId: 'SiteID',
      type: Constants.FILTER_TYPE_DIALOG_TABLE,
      defaultValue: 'general.all',
      name: 'sites.title',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: SitesFilterDialogComponent
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
