import { Company, CompanyButtonAction } from 'app/types/Company';

import { CompanyDialogComponent } from 'app/pages/organization/companies/company/company.dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TableActionDef } from 'app/types/Table';
import { TableViewAction } from './table-view-action';

export class TableViewCompanyAction extends TableViewAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: CompanyButtonAction.VIEW_COMPANY,
      action: this.viewCompany,
    };
  }

  private viewCompany(company: Company, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(CompanyDialogComponent, company, dialog, refresh);
  }
}
