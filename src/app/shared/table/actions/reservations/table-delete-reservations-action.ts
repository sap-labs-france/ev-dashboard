import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CentralServerService } from 'services/central-server.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { Reservation, ReservationButtonAction, ReservationStatus } from 'types/Reservation';
import { TableActionDef } from 'types/Table';
import { TableDeleteManyAction } from '../table-delete-many-action';

export interface TableDeleteReservationsActionDef extends TableActionDef {
  action: (
    reservations: Reservation[],
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    clearSelectedRows: () => void,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeleteReservationsAction extends TableDeleteManyAction {
  public getActionDef(): TableDeleteReservationsActionDef {
    return {
      ...super.getActionDef(),
      id: ReservationButtonAction.DELETE_RESERVATIONS,
      action: this.deleteReservations,
    };
  }

  private deleteReservations(
    reservations: Reservation[],
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    clearSelectedRows: () => void,
    refresh?: () => Observable<void>
  ) {
    // Empty?
    if (reservations.length === 0) {
      messageService.showErrorMessage(
        translateService.instant('general.select_at_least_one_record')
      );
      return;
    }
    for (const reservation of reservations) {
      if (reservation.status === ReservationStatus.IN_PROGRESS) {
        dialogService.createAndShowOkDialog(
          translateService.instant('reservations.dialog.delete_reservations.title'),
          translateService.instant(
            'reservations.dialog.delete_reservations.reject_deletion_ongoing_reservations'
          )
        );
        return;
      }
    }
    // Delete them
    super.deleteMany(
      reservations,
      'reservations.dialog.delete_reservations.title',
      'reservations.dialog.delete_reservations.confirm',
      'reservations.dialog.delete_reservations.success',
      'reservations.dialog.delete_reservations.partial',
      'reservations.dialog.delete_reservations.error',
      'reservations.dialog.delete_reservations.nothing_deleted',
      'reservations.dialog.delete_reservations.unexpected_error',
      centralServerService.deleteReservations.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router,
      clearSelectedRows,
      refresh
    );
  }
}
