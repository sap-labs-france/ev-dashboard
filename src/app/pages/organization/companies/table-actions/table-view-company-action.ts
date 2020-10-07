import { MatDialog } from '@angular/material/dialog';
import { CompanyDialogComponent } from 'app/pages/organization/companies/company/company.dialog.component';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { Company, CompanyButtonAction } from 'app/types/Company';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

export interface TableViewCompanyActionDef extends TableActionDef {
  action: (company: Company, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableViewCompanyAction extends TableViewAction {
  public getActionDef(): TableViewCompanyActionDef {
    return {
      ...super.getActionDef(),
      id: CompanyButtonAction.VIEW_COMPANY,
      action: this.viewCompany,
    };
  }

  private viewCompany(company: Company, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(CompanyDialogComponent, company.id, dialog, refresh);
  }
}
