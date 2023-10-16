import { TableAction } from '../../../../../shared/table/actions/table-action';
import { ButtonAction } from '../../../../../types/GlobalType';
import { ButtonActionColor, TableActionDef } from '../../../../../types/Table';
import { SettingsOCPIStartJobAction } from './settings-ocpi-start-job-action';

export class SettingsOcpiEndpointsMoreAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.MORE,
    type: 'button',
    icon: 'more_horiz',
    color: ButtonActionColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.more',
    isDropdownMenu: true,
    dropdownActions: [new SettingsOCPIStartJobAction().getActionDef()],
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
