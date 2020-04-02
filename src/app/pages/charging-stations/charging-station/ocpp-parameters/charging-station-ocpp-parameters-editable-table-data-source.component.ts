import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { TableExportAction } from 'app/shared/table/actions/table-export-action';
import { TableInlineSaveAction } from 'app/shared/table/actions/table-inline-save-action';
import { ChargingStation, OCPPConfigurationStatus, OCPPGeneralResponse, OcppParameter } from 'app/types/ChargingStation';
import { ActionResponse } from 'app/types/DataResult';
import { ButtonType, DropdownItem, TableActionDef, TableColumnDef, TableDef, TableEditType } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { DialogService } from '../../../../services/dialog.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { EditableTableDataSource } from '../../../../shared/table/editable-table-data-source';
import { ButtonAction } from '../../../../types/GlobalType';

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
      errorMessage: 'placeholder message',
      hasDynamicRowAction: true,
      search: {
        enabled: true
      }
    };
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableExportAction().getActionDef(),
      ...tableActionsDef,
    ];
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
    throw new Error("Method not implemented.");
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
          this.charger.id, { key: param.key, value: param.value }).subscribe((response) => {
            this.spinnerService.hide();
            // Ok?
            if (response.status === OCPPConfigurationStatus.ACCEPTED ||
                response.status === OCPPConfigurationStatus.REBOOT_REQUIRED) {
              this.messageService.showSuccessMessage(
                this.translateService.instant('chargers.change_params_success', { paramKey: param.key, chargeBoxID: this.charger.id }));
              // Reboot Required?
              if (response.status === OCPPConfigurationStatus.REBOOT_REQUIRED) {
                // Show yes/no dialog
                this.dialogService.createAndShowYesNoDialog(
                    this.translateService.instant('chargers.reboot_required_title'),
                    this.translateService.instant('chargers.reboot_required_confirm', { chargeBoxID: this.charger.id }),
                  ).subscribe((result2) => {
                    if (result2 === ButtonType.YES) {
                      // Reboot
                      this.rebootChargingStation();
                    }
                });
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

  private rebootChargingStation() {
    this.spinnerService.show();
    // Reboot
    this.centralServerService.rebootChargingStation(this.charger.id).subscribe((response: ActionResponse) => {
        this.spinnerService.hide();
        if (response.status === OCPPGeneralResponse.ACCEPTED) {
          // Ok
          this.messageService.showSuccessMessage(
            this.translateService.instant('chargers.reboot_success', { chargeBoxID: this.charger.id }));
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, 'chargers.reboot_error');
        }
      }, (error: any) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService,
          this.centralServerService, 'chargers.reboot_error');
      });
  }

  public setCharger(charger: ChargingStation) {
    this.charger = charger;
  }

  public rowActionTriggered(actionDef: TableActionDef, editableRow: OcppParameter, dropdownItem?: DropdownItem, postDataProcessing?: () => void) {
    const index = this.editableRows.indexOf(editableRow);
    let actionDone = false;
    switch (actionDef.id) {
      case ButtonAction.INLINE_DELETE:
        this.editableRows.splice(index, 1);
        actionDone = true;
        break;
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
        headerClass: 'text-center col-20p',
        class: 'text-right col-20p',
      },
      {
        id: 'value',
        name: 'chargers.charger_param_value',
        editType: TableEditType.INPUT,
        validators: [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(500),
        ],
        canBeDisabled: true,
        errors: [
          { id: 'required', message: 'general.mandatory_field' },
          { id: 'maxlength', message: 'general.error_max_length', messageParams: { length: 500 } },
          { id: 'minlength', message: 'general.error_min_length', messageParams: { length: 1 } },
        ],
        headerClass: 'text-left',
        class: 'text-left ocpp-param-field',
      },
    ];
  }

  protected isCellDisabled(columnDef: TableColumnDef, editableRow: OcppParameter): boolean {
    return editableRow.readonly;
  }

  public createRow() {
    return {
      key: '',
      value: '',
      readonly: false,
    } as OcppParameter;
  }

  setContent(content: OcppParameter[]) {
    if (content.length === 0) {
      const param = this.createRow();
      content.push(param);
    }
    super.setContent(content);
  }
}
