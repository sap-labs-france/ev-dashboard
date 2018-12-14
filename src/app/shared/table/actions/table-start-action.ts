import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableStartAction implements TableAction {
  private action: TableActionDef = {
    id: 'start',
    type: 'button',
    icon: 'play_circle_outline',
    class: 'btn-success',
    name: 'general.start'
  }


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
