import { CompanyButtonAction } from 'app/types/Company';
import { CompanyDialogComponent } from 'app/pages/organization/companies/company/company.dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TableActionDef } from 'app/types/Table';
import { TableCreateAction } from './table-create-action';

export class TableCreateCompanyAction extends TableCreateAction {  public getActionDef(): TableActionDef {
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
