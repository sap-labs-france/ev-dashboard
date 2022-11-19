import { ComponentType } from '@angular/cdk/portal';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../../types/Authorization';
import { ChargingStationTemplate, ChargingStationTemplateButtonAction } from '../../../../types/ChargingStationTemplate';
import { TableActionDef } from '../../../../types/Table';
import { TableEditAction } from '../table-edit-action';

export interface TableEditTemplateActionDef extends TableActionDef {
  action: (templateDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<ChargingStationTemplate>, refresh?: () => Observable<void>) => void;
}

export class TableEditTemplateAction extends TableEditAction {
  public getActionDef(): TableEditTemplateActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationTemplateButtonAction.EDIT_TEMPLATE,
      action: this.editTemplate,
    };
  }

  private editTemplate(templateDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<ChargingStationTemplate>, refresh?: () => Observable<void>) {
    super.edit(templateDialogComponent, dialog, dialogParams, refresh);
  }
}
