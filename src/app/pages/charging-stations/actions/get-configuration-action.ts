import {TableAction} from '../../../shared/table/actions/table-action';
import {TableActionDef} from '../../../common.types';
 
export class TableGetConfigurationAction implements TableAction {
  private action: TableActionDef = {
    id: 'getConfiguration',
    type: 'button',
    icon: 'settings',
    class: 'btn-info',
    name: 'chargers.get_configuration_button'
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
