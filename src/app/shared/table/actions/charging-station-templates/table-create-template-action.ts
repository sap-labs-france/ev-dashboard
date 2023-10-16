import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { ChargingStationTemplateButtonAction } from '../../../../types/ChargingStationTemplate';
import { TableActionDef } from '../../../../types/Table';
import { TableCreateAction } from '../table-create-action';

export interface TableCreateTemplateActionDef extends TableActionDef {
  action: (
    templateDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableCreateTemplateAction extends TableCreateAction {
  public getActionDef(): TableCreateTemplateActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationTemplateButtonAction.CREATE_TEMPLATE,
      action: this.createTemplate,
      visible: false,
    };
  }

  private createTemplate(
    templateDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    refresh?: () => Observable<void>
  ) {
    super.create(templateDialogComponent, dialog, null, refresh);
  }
}
