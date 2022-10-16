import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { TableOpenURLAction, TableOpenURLActionDef } from './table-open-url-action';

export class TableOpenInMapsAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: ButtonAction.OPEN_IN_MAPS,
      icon: 'location_on',
      color: ButtonActionColor.PRIMARY,
      name: 'general.open_in_maps',
      tooltip: 'general.tooltips.open_in_maps',
    };
  }
}
