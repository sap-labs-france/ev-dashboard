import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../../types/Authorization';
import {
  ChargingStationTemplate,
  ChargingStationTemplateButtonAction,
} from '../../../../types/ChargingStationTemplate';
import { TableActionDef } from '../../../../types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewTemplateActionDef extends TableActionDef {
  action: (
    templateDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<ChargingStationTemplate>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableViewTemplateAction extends TableViewAction {
  public getActionDef(): TableViewTemplateActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationTemplateButtonAction.VIEW_TEMPLATE,
      action: this.viewTemplate,
    };
  }

  private viewTemplate(
    templateDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<ChargingStationTemplate>,
    refresh?: () => Observable<void>
  ) {
    super.view(templateDialogComponent, dialog, dialogParams, refresh);
  }
}
