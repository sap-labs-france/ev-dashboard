import * as FileSaver from 'file-saver';

import { ButtonAction, FilterParams } from '../../../types/GlobalType';
import { ButtonColor, ButtonType, TableActionDef } from '../../../types/Table';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../services/spinner.service';
import { TableAction } from './table-action';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from '../../../utils/Utils';

export class TableExportAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.EXPORT,
    type: 'button',
    icon: 'cloud_download',
    name: 'general.export',
    color: ButtonColor.PRIMARY,
    tooltip: 'general.tooltips.export',
    action: this.export
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected export(filters: FilterParams, exportedFilename: string, messageTitle: string, messageConfirm: string,
      messageError: string, exportData: (filters: FilterParams) => Observable<Blob>,
      dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant(messageTitle),
      translateService.instant(messageConfirm),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        spinnerService.show();
        exportData(filters).subscribe((result) => {
            spinnerService.hide();
            FileSaver.saveAs(result, exportedFilename);
        }, (error) => {
          spinnerService.hide();
          Utils.handleHttpError(error, router, messageService,
            centralServerService, translateService.instant(messageError));
        });
      }
    });
  }
}
