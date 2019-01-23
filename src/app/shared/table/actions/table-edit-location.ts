import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableEditLocationAction implements TableAction {
  private action: TableActionDef = {
    id: 'edit_location',
    type: 'button',
    icon: 'store_mall_directory',
    class: 'btn-info',
    name: 'general.edit'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
