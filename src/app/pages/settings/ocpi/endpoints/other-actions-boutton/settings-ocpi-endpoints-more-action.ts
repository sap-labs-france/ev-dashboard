import { TableAction } from 'app/shared/table/actions/table-action';
import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { SettingsOCPIStartJobAction } from './settings-ocpi-start-job-action';

export class SettingsOcpiEnpointsMoreAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.MORE,
    type: 'button',
    icon: 'more_horiz',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.more',
    isDropdownMenu: true,
    dropdownActions: [
      new SettingsOCPIStartJobAction().getActionDef(),
    ],
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
