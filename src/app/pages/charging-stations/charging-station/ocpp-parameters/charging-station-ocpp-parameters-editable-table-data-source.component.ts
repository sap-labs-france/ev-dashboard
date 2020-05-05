import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { TableExportAction } from 'app/shared/table/actions/table-export-action';
import { TableInlineSaveAction } from 'app/shared/table/actions/table-inline-save-action';
import { ChargingStation, OCPPConfigurationStatus, OcppParameter } from 'app/types/ChargingStation';
import { ButtonType, DropdownItem, TableActionDef, TableColumnDef, TableDef, TableEditType } from 'app/types/Table';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import saveAs from 'file-saver';

import { DialogService } from '../../../../services/dialog.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { EditableTableDataSource } from '../../../../shared/table/editable-table-data-source';
import { ButtonAction } from '../../../../types/GlobalType';
import { ChargingStationOcppParametersInputFieldCellComponent } from './cell-components/charging-station-ocpp-parameters-input-field-cell.component';
import { ChargingStationsRebootAction } from '../../actions/charging-stations-reboot-action';

@Injectable()
export class ChargingStationOcppParametersEditableTableDataSource extends EditableTableDataSource<OcppParameter> {
  private charger!: ChargingStation;
  private inlineSaveAction = new TableInlineSaveAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    public authorizationService: AuthorizationService,
    public dialogService: DialogService,
    public centralServerService: CentralServerService,
    public router: Router,
    public messageService: MessageService) {
    super(spinnerService, translateService);
  }

  public buildTableDef(): TableDef {
    return {
      id: 'ChargingStationOcppParametersTableDataSource',
      isEditable: true,
      rowFieldNameIdentifier: 'key',
      errorMessage: 'chargers.ocpp_params_list_error',
      hasDynamicRowAction: true,
      search: {
        enabled: true
      }
    };
  }

  public buildTableActionsDef(): TableActionDef[] {
    // remove default add action + add export action
    return [new TableExportAction().getActionDef()];
  }

  public buildTableRowActions(): TableActionDef[] {
    // remove default delete action
    return [];
  }

  public buildTableDynamicRowActions(param: OcppParameter): TableActionDef[] {
    const actions = [];
    if (!param.readonly) {
      actions.push(this.inlineSaveAction);
    }
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case ButtonAction.EXPORT:
        this.dialogService.createAndShowYesNoDialog(
          this.translateService.instant('chargers.dialog.export.title'),
          this.translateService.instant('chargers.dialog.export.confirm'),
        ).subscribe((response) => {
          if (response === ButtonType.YES) {
            this.exportParameters();
          }
        });
        break;
    }
    super.actionTriggered(actionDef);
  }

  public exportParameters() {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.dialog.exportConfig.title'),
      this.translateService.instant('chargers.dialog.exportConfig.confirm'),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        let csv = `Charging Station${Constants.CSV_SEPARATOR}Parameter Name${Constants.CSV_SEPARATOR}Parameter Value${Constants.CSV_SEPARATOR}Site Area${Constants.CSV_SEPARATOR}Site\r\n`;
        for (const parameter of this.getContent()) {
          csv += `${this.charger.id}${Constants.CSV_SEPARATOR}${parameter.key}${Constants.CSV_SEPARATOR}"${Utils.replaceSpecialCharsInCSVValueParam(parameter.value)}"${Constants.CSV_SEPARATOR}${this.charger.siteArea.name}${Constants.CSV_SEPARATOR}${this.charger.siteArea.site.name}\r\n`;
        }
        const blob = new Blob([csv]);
        saveAs(blob, `exported-${this.charger.id.toLowerCase()}-ocpp-parameters.csv`);
      }
    });
  }

  private saveOcppParameter(param: OcppParameter) {
    // Show yes/no dialog
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.set_configuration_title'),
      this.translateService.instant('chargers.set_configuration_confirm', { chargeBoxID: this.charger.id, key: param.key }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.spinnerService.show();
        this.centralServerService.updateChargingStationOCPPConfiguration(
          this.charger.id, { key: param.key, value: param.value, readonly: param.readonly }).subscribe((response) => {
            this.spinnerService.hide();
            // Ok?
            if (response.status === OCPPConfigurationStatus.ACCEPTED ||
                response.status === OCPPConfigurationStatus.REBOOT_REQUIRED) {
              this.messageService.showSuccessMessage(
                this.translateService.instant('chargers.change_params_success', { paramKey: param.key, chargeBoxID: this.charger.id }));
              // Reboot Required?
              if (response.status === OCPPConfigurationStatus.REBOOT_REQUIRED) {
                const chargingStationsRebootAction = new ChargingStationsRebootAction().getActionDef();
                if (chargingStationsRebootAction.action) {
                  chargingStationsRebootAction.action(this.charger, this.dialogService, this.translateService,
                    this.messageService, this.centralServerService, this.spinnerService, this.router);
                }
              }
            } else {
              Utils.handleError(JSON.stringify(response), this.messageService, 'chargers.change_params_error');
            }
            this.refreshData(true).subscribe();
          }, (error) => {
            this.spinnerService.hide();
            this.refreshData(true).subscribe();
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'chargers.change_params_error');
          });
      }
    });
  }

  public setCharger(charger: ChargingStation) {
    this.charger = charger;
  }

  public rowActionTriggered(actionDef: TableActionDef, editableRow: OcppParameter, dropdownItem?: DropdownItem, postDataProcessing?: () => void) {
    let actionDone = false;
    switch (actionDef.id) {
      case ButtonAction.INLINE_SAVE:
        this.saveOcppParameter(editableRow);
        actionDone = true;
        break;
    }
    // Call super
    super.rowActionTriggered(actionDef, editableRow, dropdownItem, postDataProcessing, true);
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'key',
        name: 'chargers.charger_param_key',
        editType: TableEditType.DISPLAY_ONLY,
        headerClass: 'text-right col-20p',
        class: 'text-right col-20p',
      },
      {
        id: 'value',
        name: 'chargers.charger_param_value',
        editType: TableEditType.INPUT,
        validators: [
          Validators.maxLength(500),
        ],
        canBeDisabled: true,
        errors: [
          { id: 'maxlength', message: 'general.error_max_length', messageParams: { length: 500 } },
        ],
        headerClass: 'text-left',
        class: 'text-left ocpp-param-field',
      },
    ];
  }

  protected isCellDisabled(columnDef: TableColumnDef, editableRow: OcppParameter): boolean {
    if (columnDef.id === 'value') {
      return editableRow.readonly;
    }
    return (editableRow.id !== 'InputRow');
  }

  public createRow() {
    return {
      id: '',
      key: '',
      value: '',
      readonly: false,
    } as OcppParameter;
  }

  public setContent(content: OcppParameter[]) {
    if (content.length === 0) {
      const param = this.createRow();
      content.push(param);
    }
    const inputRow = this.createRow();
    inputRow.id = 'InputRow';
    const contentToSet = [
      inputRow,
      ...content,
    ];
    super.setContent(contentToSet);
  }
}

