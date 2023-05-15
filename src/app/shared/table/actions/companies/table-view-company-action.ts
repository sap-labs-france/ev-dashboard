import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableViewAction } from '../../../../shared/table/actions/table-view-action';
import { CompaniesAuthorizations, DialogParamsWithAuth } from '../../../../types/Authorization';
import { Company, CompanyButtonAction } from '../../../../types/Company';
import { TableActionDef } from '../../../../types/Table';

export interface TableViewCompanyActionDef extends TableActionDef {
  action: (
    companyDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Company, CompaniesAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableViewCompanyAction extends TableViewAction {
  public getActionDef(): TableViewCompanyActionDef {
    return {
      ...super.getActionDef(),
      id: CompanyButtonAction.VIEW_COMPANY,
      action: this.viewCompany,
    };
  }

  private viewCompany(
    companyDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Company, CompaniesAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.view(companyDialogComponent, dialog, dialogParams, refresh);
  }
}
