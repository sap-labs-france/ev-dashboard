import { AssetButtonAction } from 'app/types/Asset';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableDisplayAssetsAction implements TableAction {
  private action: TableActionDef = {
    id: AssetButtonAction.DISPLAY_ASSETS,
    type: 'button',
    icon: 'account_balance',
    color: ButtonColor.PRIMARY,
    name: 'site_areas.display_assets',
    tooltip: 'general.tooltips.display_assets',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
