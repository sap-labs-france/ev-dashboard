import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogData } from 'types/Authorization';

import { TableEditAction } from '../../../../shared/table/actions/table-edit-action';
import { CompanyButtonAction } from '../../../../types/Company';
import { TableActionDef } from '../../../../types/Table';

export interface TableEditCompanyActionDef extends TableActionDef {
  action: (companyDialogComponent: ComponentType<unknown>, dialog: MatDialog, data: DialogData, refresh?: () => Observable<void>) => void;
}

export class TableEditCompanyAction extends TableEditAction {
  public getActionDef(): TableEditCompanyActionDef {
    return {
      ...super.getActionDef(),
      id: CompanyButtonAction.EDIT_COMPANY,
      action: this.editCompany,
    };
  }

  private editCompany(companyDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    data: DialogData, refresh?: () => Observable<void>) {
    super.edit(companyDialogComponent, dialog, data, refresh);
  }
}
