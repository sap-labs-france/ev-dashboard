import {TableFilter} from './table-filter';
import {Constants} from '../../../utils/Constants';
import {TranslateService} from '@ngx-translate/core';
import {TableFilterDef} from '../../../common.types';
import {UsersDialogComponent} from '../../dialogs/users/users-dialog-component';

export class UserTableFilter extends TableFilter {
  constructor(
    private translateService: TranslateService) {
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
    // Translate
    filterDef.defaultValue = translateService.instant(filterDef.defaultValue);
    filterDef.name = this.translateService.instant(filterDef.name);
    // Set
    this.setFilterDef(filterDef);
  }
}
