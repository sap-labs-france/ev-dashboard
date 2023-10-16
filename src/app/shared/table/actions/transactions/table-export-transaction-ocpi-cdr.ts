import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { ButtonAction } from 'types/GlobalType';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableActionDef } from '../../../../types/Table';
import { TransactionButtonAction } from '../../../../types/Transaction';
import { Utils } from '../../../../utils/Utils';
import { TableExportAction } from '../table-export-action';

export interface TableExportTransactionOcpiCdrActionDef extends TableActionDef {
  action: (
    transactionID: number,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService
  ) => void;
}

export class TableExportTransactionOcpiCdrAction extends TableExportAction {
  public getActionDef(): TableExportTransactionOcpiCdrActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.EXPORT_TRANSACTION_OCPI_CDR,
      name: 'transactions.export_ocpi_cdr_button_title',
      action: this.exportTransactionOcpiCdr,
    };
  }

  private exportTransactionOcpiCdr(
    transactionID: number,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService
  ) {
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('transactions.export_ocpi_cdr_title'),
        translateService.instant('transactions.export_ocpi_cdr_confirm', { transactionID })
      )
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          spinnerService.show();
          centralServerService.exportTransactionOcpiCdr(transactionID).subscribe({
            next: (result) => {
              spinnerService.hide();
              const ocpiData = new Blob([JSON.stringify(result, null, '\t')]);
              FileSaver.saveAs(ocpiData, `exported-cdr-session-${transactionID}.json`);
            },
            error: (error) => {
              spinnerService.hide();
              Utils.handleHttpError(
                error,
                router,
                messageService,
                centralServerService,
                translateService.instant('transactions.export_ocpi_cdr_error', { transactionID })
              );
            },
          });
        }
      });
  }
}
