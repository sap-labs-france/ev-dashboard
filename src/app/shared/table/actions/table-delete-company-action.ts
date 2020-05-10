import { Company, CompanyButtonAction } from 'app/types/Company';

import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableActionDef } from 'app/types/Table';
import { TableDeleteAction } from './table-delete-action';
import { TranslateService } from '@ngx-translate/core';

export class TableDeleteCompanyAction extends TableDeleteAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: CompanyButtonAction.DELETE_COMPANY,
      action: this.deleteCompany,
    };
  }

  private deleteCompany(company: Company, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    super.delete(
      company, 'companies.delete_title',
      translateService.instant('companies.delete_confirm', { companyName: company.name }),
      translateService.instant('companies.delete_success', { companyName: company.name }),
      'companies.delete_error', centralServerService.deleteCompany.bind(centralServerService),
      dialogService, translateService, messageService, centralServerService, spinnerService, router, refresh);
  }
}
