import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableExportAction } from 'app/shared/table/actions/table-export-action';
import { ButtonType, TableActionDef } from 'app/types/Table';
import { TransactionButtonAction } from 'app/types/Transaction';
import { Utils } from 'app/utils/Utils';
import * as FileSaver from 'file-saver';

export interface TableExportOcpiDataFromTransactionActionDef extends TableActionDef {
  action: (transactionID: number, dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router,
    spinnerService: SpinnerService) => void;
}

export class TableExportOcpiDataFromTransactionAction extends TableExportAction {
  public getActionDef(): TableExportOcpiDataFromTransactionActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.EXPORT_OCPI_DATA_FROM_TRANSACTION,
      name: 'transactions.export_ocpi_data_button_title',
      action: this.exportOcpiDataFromTransaction,
    };
  }

  private exportOcpiDataFromTransaction(transactionID: number, dialogService: DialogService, translateService: TranslateService,
      messageService: MessageService, centralServerService: CentralServerService, router: Router,
      spinnerService: SpinnerService) {
      dialogService.createAndShowYesNoDialog(
        translateService.instant('transactions.export_ocpi_data_title'),
        translateService.instant('transactions.export_ocpi_data_confirm', {transactionID}),
      ).subscribe((response) => {
        if (response === ButtonType.YES) {
          spinnerService.show();
          centralServerService.getOcpiDataFromTransaction(transactionID).subscribe((result) => {
              spinnerService.hide();
              const ocpiData = new Blob([JSON.stringify(result, null, '\t')]);
              FileSaver.saveAs(ocpiData, `transaction-${transactionID}-ocpi-data-export.json`);
          }, (error) => {
            spinnerService.hide();
            Utils.handleHttpError(error, router, messageService,
              centralServerService, translateService.instant('transactions.export_ocpi_data_title', {transactionID}));
          });
        }
      });
  }
}
