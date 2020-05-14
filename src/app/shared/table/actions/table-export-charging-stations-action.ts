import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { FilterParams } from 'app/types/GlobalType';
import { TableActionDef } from 'app/types/Table';
import { TableExportAction } from './table-export-action';


export class TableExportChargingStationsAction extends TableExportAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.EXPORT_CHARGING_STATIONS,
      action: this.exportChargingStations,
    };
  }

  private exportChargingStations(filters: FilterParams, dialogService: DialogService, translateService: TranslateService,
      messageService: MessageService, centralServerService: CentralServerService, router: Router,
      spinnerService: SpinnerService) {
    super.export(filters, 'exported-charging-stations.csv',
      'chargers.dialog.export.title', 'chargers.dialog.export.confirm', 'chargers.dialog.export.error',
      centralServerService.exportChargingStations.bind(centralServerService),
      dialogService, translateService, messageService,
      centralServerService, spinnerService, router);
  }
}
