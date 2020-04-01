import { AssetButtonAction } from 'app/types/Asset';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableEditAssetsAction implements TableAction {
  private action: TableActionDef = {
    id: AssetButtonAction.EDIT_ASSETS,
    type: 'button',
    icon: 'account_balance',
    color: ButtonColor.PRIMARY,
    name: 'site_areas.edit_assets',
    tooltip: 'general.tooltips.edit_assets',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
