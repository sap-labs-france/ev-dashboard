import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableViewAction } from '../../../../shared/table/actions/table-view-action';
import { DialogParams } from '../../../../types/Authorization';
import { Company, CompanyButtonAction } from '../../../../types/Company';
import { ScreenSize } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';

export interface TableViewCompanyActionDef extends TableActionDef {
  action: (companyDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Company>, refresh?: () => Observable<void>) => void;
}

export class TableViewCompanyAction extends TableViewAction {
  public getActionDef(): TableViewCompanyActionDef {
    return {
      ...super.getActionDef(),
      id: CompanyButtonAction.VIEW_COMPANY,
      action: this.viewCompany,
    };
  }

  private viewCompany(companyDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Company>, refresh?: () => Observable<void>) {
    super.view(companyDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XXL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.S,
      maxHeight: ScreenSize.L,
      height: ScreenSize.M
    });
  }
}
