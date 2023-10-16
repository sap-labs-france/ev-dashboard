import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableDeleteAction } from '../../../../shared/table/actions/table-delete-action';
import { Company, CompanyButtonAction } from '../../../../types/Company';
import { TableActionDef } from '../../../../types/Table';

export interface TableDeleteCompanyActionDef extends TableActionDef {
  action: (
    company: Company,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeleteCompanyAction extends TableDeleteAction {
  public getActionDef(): TableDeleteCompanyActionDef {
    return {
      ...super.getActionDef(),
      id: CompanyButtonAction.DELETE_COMPANY,
      action: this.deleteCompany,
    };
  }

  private deleteCompany(
    company: Company,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    super.delete(
      company,
      'companies.delete_title',
      translateService.instant('companies.delete_confirm', { companyName: company.name }),
      translateService.instant('companies.delete_success', { companyName: company.name }),
      'companies.delete_error',
      centralServerService.deleteCompany.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router,
      refresh
    );
  }
}
