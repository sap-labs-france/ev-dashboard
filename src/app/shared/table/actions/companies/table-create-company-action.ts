import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableCreateAction } from '../../../../shared/table/actions/table-create-action';
import { CompanyButtonAction } from '../../../../types/Company';
import { TableActionDef } from '../../../../types/Table';

export interface TableCreateCompanyActionDef extends TableActionDef {
  action: (companyDialogComponent: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableCreateCompanyAction extends TableCreateAction {
  public getActionDef(): TableCreateCompanyActionDef {
    return {
      ...super.getActionDef(),
      id: CompanyButtonAction.CREATE_COMPANY,
      action: this.createCompany,
    };
  }

  private createCompany(companyDialogComponent: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(companyDialogComponent, dialog, refresh);
  }
}
