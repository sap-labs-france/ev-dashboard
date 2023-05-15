import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { ButtonAction } from 'types/GlobalType';

import { DialogService } from '../../../../services/dialog.service';
import {
  ChargingStation,
  ChargingStationButtonAction,
  OcppParameter,
} from '../../../../types/ChargingStation';
import { TableActionDef } from '../../../../types/Table';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';
import { TableExportAction } from '../table-export-action';

export interface TableExportOCPPParamsLocalActionDef extends TableActionDef {
  action: (
    charger: ChargingStation,
    params: OcppParameter[],
    dialogService: DialogService,
    translateService: TranslateService
  ) => void;
}

export class TableExportOCPPParamsLocalAction extends TableExportAction {
  public getActionDef(): TableExportOCPPParamsLocalActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.EXPORT_LOCAL_OCPP_PARAMS,
      name: 'general.export',
      action: this.exportOCPPAsCSV,
    };
  }

  public exportOCPPAsCSV(
    charger: ChargingStation,
    params: OcppParameter[],
    dialogService: DialogService,
    translateService: TranslateService
  ) {
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('chargers.dialog.exportConfig.title'),
        translateService.instant('chargers.dialog.exportConfig.confirm')
      )
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          // Header
          const headers = ['chargingStation', 'name', 'value', 'siteArea', 'site'].join(
            Constants.CSV_SEPARATOR
          );
          // Content
          const rows = params
            .map((parameter) => {
              const row = [
                charger.id,
                parameter.key,
                Utils.replaceSpecialCharsInCSVValueParam(parameter.value),
                charger.siteArea.name,
                charger.site.name,
              ].map((value) => Utils.escapeCsvValue(value));
              return row;
            })
            .join(Constants.CR_LF);
          const csv = [headers, rows].join(Constants.CR_LF);
          const blob = new Blob([csv]);
          saveAs(blob, `exported-${charger.id.toLowerCase()}-ocpp-parameters.csv`);
        }
      });
  }
}
