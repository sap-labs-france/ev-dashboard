import { TranslateService } from '@ngx-translate/core';

import { DialogService } from '../../../../services/dialog.service';
import { ChargingStation, ChargingStationButtonAction, OcppParameter } from '../../../../types/ChargingStation';
import { ButtonType, TableActionDef } from '../../../../types/Table';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';
import { TableExportAction } from '../table-export-action';

export interface TableExportOCPPParamsLocalActionDef extends TableActionDef {
  action: (charger: ChargingStation, params: OcppParameter[], dialogService: DialogService, translateService: TranslateService) => void;
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

  public exportOCPPAsCSV(charger: ChargingStation, params: OcppParameter[], dialogService: DialogService, translateService: TranslateService) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('chargers.dialog.exportConfig.title'),
      translateService.instant('chargers.dialog.exportConfig.confirm'),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        let csv = `Charging Station${Constants.CSV_SEPARATOR}Parameter Name${Constants.CSV_SEPARATOR}Parameter Value${Constants.CSV_SEPARATOR}Site Area${Constants.CSV_SEPARATOR}Site\r\n`;
        for (const parameter of params) {
          csv += `${charger.id}${Constants.CSV_SEPARATOR}${parameter.key}${Constants.CSV_SEPARATOR}"${Utils.replaceSpecialCharsInCSVValueParam(parameter.value)}"${Constants.CSV_SEPARATOR}${charger.siteArea.name}${Constants.CSV_SEPARATOR}${charger.siteArea.site.name}\r\n`;
        }
        const blob = new Blob([csv]);
        saveAs(blob, `exported-${charger.id.toLowerCase()}-ocpp-parameters.csv`);
      }
    });
  }
}
