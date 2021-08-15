import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogParams } from 'types/Authorization';

import { TableViewAction } from '../../../../shared/table/actions/table-view-action';
import { Company, CompanyButtonAction } from '../../../../types/Company';
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
    super.view(companyDialogComponent, dialog, dialogParams, refresh);
  }
}
