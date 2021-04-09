import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogAuthorization } from 'types/Authorization';

import { TableCreateAction } from '../../../../shared/table/actions/table-create-action';
import { Company, CompanyButtonAction } from '../../../../types/Company';
import { TableActionDef } from '../../../../types/Table';

export interface TableCreateCompanyActionDef extends TableActionDef {
  action: (companyDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    data?: DialogAuthorization | string, refresh?: () => Observable<void>
  ) => void;
}

export class TableCreateCompanyAction extends TableCreateAction {
  public getActionDef(): TableCreateCompanyActionDef {
    return {
      ...super.getActionDef(),
      id: CompanyButtonAction.CREATE_COMPANY,
      action: this.createCompany,
      visible: false
    };
  }

  private createCompany(companyDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    data?: DialogAuthorization | string, refresh?: () => Observable<void>) {
    super.create(companyDialogComponent, dialog, data, refresh);
  }
}
