import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableOpenInMapsAction implements TableAction {
  private action: TableActionDef = {
    id: 'open_in_maps',
    type: 'button',
    icon: 'my_location',
    class: 'btn-info',
    name: 'general.edit'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
