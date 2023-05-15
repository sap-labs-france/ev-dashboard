import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ButtonAction, ButtonActionColor, FilterParams } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { TableAction } from './table-action';

export class TableExportAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.EXPORT,
    type: 'button',
    icon: 'cloud_download',
    name: 'general.export',
    color: ButtonActionColor.PRIMARY,
    tooltip: 'general.tooltips.export',
    action: this.export,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected export(
    filters: FilterParams,
    exportedFilename: string,
    messageTitle: string,
    messageConfirm: string,
    messageError: string,
    exportData: (filters: FilterParams) => Observable<Blob>,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router
  ) {
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant(messageTitle),
        translateService.instant(messageConfirm)
      )
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          spinnerService.show();
          exportData(filters).subscribe({
            next: (result) => {
              spinnerService.hide();
              FileSaver.saveAs(result, exportedFilename);
            },
            error: (error) => {
              spinnerService.hide();
              Utils.handleHttpError(
                error,
                router,
                messageService,
                centralServerService,
                translateService.instant(messageError)
              );
            },
          });
        }
      });
  }
}
