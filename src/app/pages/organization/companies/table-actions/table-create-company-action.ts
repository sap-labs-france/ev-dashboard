import { MatDialog } from '@angular/material/dialog';
import { CompanyDialogComponent } from 'app/pages/organization/companies/company/company.dialog.component';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { CompanyButtonAction } from 'app/types/Company';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

export class TableCreateCompanyAction extends TableCreateAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: CompanyButtonAction.CREATE_COMPANY,
      action: this.createCompany,
    };
  }

  private createCompany(dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(CompanyDialogComponent, dialog, refresh);
  }
}
