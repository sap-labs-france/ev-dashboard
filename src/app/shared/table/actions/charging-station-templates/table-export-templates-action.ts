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

export interface TableExportTemplatesActionDef extends TableActionDef {
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

export class TableExportTemplatesAction extends TableExportAction {
  public getActionDef(): TableExportTemplatesActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.EXPORT_CHARGING_STATIONS,
      action: this.exportTemplates,
    };
  }

  private exportTemplates(
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
      'exported-charging-station-templates.json',
      'templates.dialog.export.title',
      'templates.dialog.export.confirm',
      'templates.dialog.export.error',
      // TODO: @Melvyn exportChargingStationTemplates
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
