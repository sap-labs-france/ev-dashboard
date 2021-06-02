import { FilterType, TableFilterDef } from '../../../types/Table';
import { UsersDialogComponent } from '../../dialogs/users/users-dialog.component';
import { TableFilter } from './table-filter';

export class UserTableFilter extends TableFilter {
  public constructor(siteIDs?: readonly string[], dependentFilters?: TableFilterDef[]) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'user',
      httpId: 'UserID',
      type: FilterType.DIALOG_TABLE,
      defaultValue: '',
      label: '',
      name: 'logs.users',
      class: 'col-md-6 col-lg-4 col-xl-2',
      dialogComponent: UsersDialogComponent,
      multiple: true,
      cleared: true,
      dependentFilters
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
