import { MatDialog } from '@angular/material/dialog';
import { CompanyDialogComponent } from 'app/pages/organization/companies/company/company.dialog.component';
import { Company, CompanyButtonAction } from 'app/types/Company';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { TableEditAction } from './table-edit-action';

export class TableEditCompanyAction extends TableEditAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: CompanyButtonAction.EDIT_COMPANY,
      action: this.editCompany,
    };
  }

  private editCompany(company: Company, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(CompanyDialogComponent, company, dialog, refresh);
  }
}
