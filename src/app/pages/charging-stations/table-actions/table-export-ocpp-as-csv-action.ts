import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { TableExportAction } from 'app/shared/table/actions/table-export-action';
import { ChargingStation, ChargingStationButtonAction, OcppParameter } from 'app/types/ChargingStation';
import { ButtonType, TableActionDef } from 'app/types/Table';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import * as FileSAver from 'file-saver';

export class TableExportOCPPAsCSVAction extends TableExportAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.EXPORT_OCPP_AS_CSV,
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
