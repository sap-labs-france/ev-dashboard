import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'services/central-server.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { FilterParams } from 'types/GlobalType';
import { TableActionDef } from 'types/Table';
import { ReservationButtonAction } from 'types/Reservation';
import { TableExportAction } from '../table-export-action';

export interface TableExportReservationsActionDef extends TableActionDef {
  action: (
    filters: FilterParams,
    dialogService: DialogService,
    translationService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService
  ) => void;
}

export class TableExportReservationsAction extends TableExportAction {
  public getActionDef(): TableExportReservationsActionDef {
    return {
      ...super.getActionDef(),
      id: ReservationButtonAction.EXPORT_RESERVATIONS,
      action: this.exportReservations,
    };
  }

  private exportReservations(
    filters: FilterParams,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService
  ) {
    super.export(
      filters,
      'exported-reservations.csv',
      'reservations.dialog.export.title',
      'reservations.dialog.export.confirm',
      'reservations.dialog.export.error',
      centralServerService.exportReservations.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router
    );
  }
}
