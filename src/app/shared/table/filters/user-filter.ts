import { TableFilterDef } from '../../../common.types';
import { Constants } from '../../../utils/Constants';
import { UsersDialogComponent } from '../../dialogs/users/users-dialog-component';
import { TableFilter } from './table-filter';

export class UserTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'user',
      httpId: 'UserID',
      type: Constants.FILTER_TYPE_DIALOG_TABLE,
      defaultValue: 'general.all',
      name: 'logs.user',
      class: 'col-md-6 col-lg-4 col-xl-2',
      dialogComponent: UsersDialogComponent
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
