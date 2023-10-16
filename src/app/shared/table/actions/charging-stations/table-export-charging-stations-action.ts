import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ChargingStationButtonAction } from '../../../../types/ChargingStation';
import { FilterParams } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { TableExportAction } from '../table-export-action';

export interface TableExportChargingStationsActionDef extends TableActionDef {
  action: (
    filters: FilterParams,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService
  ) => void;
}

export class TableExportChargingStationsAction extends TableExportAction {
  public getActionDef(): TableExportChargingStationsActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.EXPORT_CHARGING_STATIONS,
      action: this.exportChargingStations,
    };
  }

  private exportChargingStations(
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
      'exported-charging-stations.csv',
      'chargers.dialog.export.title',
      'chargers.dialog.export.confirm',
      'chargers.dialog.export.error',
      centralServerService.exportChargingStations.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router
    );
  }
}
