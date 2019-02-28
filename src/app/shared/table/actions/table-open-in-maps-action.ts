import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableOpenInMapsAction implements TableAction {
  private action: TableActionDef = {
    id: 'open_in_maps',
    type: 'button',
    icon: 'location_on',
    class: 'btn-info',
    name: 'general.open_in_maps',
    tooltip: 'general.tooltips.open_in_maps'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
