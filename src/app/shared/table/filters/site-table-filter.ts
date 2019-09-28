import { SitesDialogComponent } from 'app/shared/dialogs/sites/sites-dialog.component';
import { TableFilterDef } from '../../../common.types';
import { Constants } from '../../../utils/Constants';
import { TableFilter } from './table-filter';

export class SiteTableFilter extends TableFilter {
  constructor(siteIDs?: ReadonlyArray<string>) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'sites',
      httpId: 'SiteID',
      type: Constants.FILTER_TYPE_DIALOG_TABLE,
      defaultValue: '',
      label: '',
      multiple: true,
      name: 'sites.titles',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: SitesDialogComponent,
      cleared: true,
    };

    if (siteIDs) {
      filterDef.dialogComponentData = {
        staticFilter: {
          SiteID: siteIDs.join('|'),
        },
      };
    }
    // Set
    this.setFilterDef(filterDef);
  }
}
