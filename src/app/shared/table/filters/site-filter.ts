import { TableFilterDef } from '../../../common.types';
import { Constants } from '../../../utils/Constants';
import { SitesFilterDialogComponent } from '../../dialogs/sites/sites-filter-dialog-component';
import { TableFilter } from './table-filter';

export class SitesTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'sites',
      httpId: 'SiteID',
      type: Constants.FILTER_TYPE_DIALOG_TABLE,
      defaultValue: '',
      label:'',
      multiple: true,
      name: 'sites.titles',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: SitesFilterDialogComponent
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
