import { FilterType, TableFilterDef } from '../../../types/Table';
import { UsersDialogComponent } from '../../dialogs/users/users-dialog.component';
import { TableFilter } from './table-filter';

export class UserTableFilter extends TableFilter {
  public constructor(dependentFilters?: TableFilterDef[]) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'user',
      httpID: 'UserID',
      type: FilterType.DIALOG_TABLE,
      defaultValue: '',
      label: '',
      name: 'logs.users',
      dialogComponent: UsersDialogComponent,
      multiple: true,
      cleared: true,
      dependentFilters
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
