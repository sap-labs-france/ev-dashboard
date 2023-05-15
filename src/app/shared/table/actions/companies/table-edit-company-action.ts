import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableEditAction } from '../../../../shared/table/actions/table-edit-action';
import { CompaniesAuthorizations, DialogParamsWithAuth } from '../../../../types/Authorization';
import { Company, CompanyButtonAction } from '../../../../types/Company';
import { TableActionDef } from '../../../../types/Table';

export interface TableEditCompanyActionDef extends TableActionDef {
  action: (
    companyDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Company, CompaniesAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableEditCompanyAction extends TableEditAction {
  public getActionDef(): TableEditCompanyActionDef {
    return {
      ...super.getActionDef(),
      id: CompanyButtonAction.EDIT_COMPANY,
      action: this.editCompany,
    };
  }

  private editCompany(
    companyDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Company, CompaniesAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.edit(companyDialogComponent, dialog, dialogParams, refresh);
  }
}
