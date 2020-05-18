import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { ChargingStation, OcppParameter } from 'app/types/ChargingStation';
import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import * as FileSAver from 'file-saver';

import { TableAction } from './table-action';

export class TableExportAsCSVAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.EXPORT_AS_CSV,
    type: 'button',
    icon: 'cloud_download',
    name: 'general.export',
    color: ButtonColor.PRIMARY,
    tooltip: 'general.tooltips.export',
    action: this.exportParameters,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  public exportParameters(charger: ChargingStation, params: OcppParameter[], dialogService: DialogService, translateService: TranslateService) {
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
