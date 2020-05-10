import { ButtonType, TableActionDef } from 'app/types/Table';
import { Company, CompanyButtonAction } from 'app/types/Company';

import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { RestResponse } from 'app/types/GlobalType';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDeleteAction } from './table-delete-action';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

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
    dialogService.createAndShowYesNoDialog(
      translateService.instant('companies.delete_title'),
      translateService.instant('companies.delete_confirm', {companyName: company.name}),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        spinnerService.show();
        centralServerService.deleteCompany(company.id).subscribe((response) => {
          spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            messageService.showSuccessMessage('companies.delete_success', {companyName: company.name});
            if (refresh) {
              refresh().subscribe();
            }
          } else {
            Utils.handleError(JSON.stringify(response),
              messageService, 'companies.delete_error');
          }
        }, (error) => {
          spinnerService.hide();
          Utils.handleHttpError(error, router, messageService, centralServerService,
            'companies.delete_error');
        });
      }
    });
  }
}
