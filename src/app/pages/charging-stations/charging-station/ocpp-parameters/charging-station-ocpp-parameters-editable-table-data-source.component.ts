import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthorizationService } from '../../../../services/authorization.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableExportOCPPParamsLocalAction, TableExportOCPPParamsLocalActionDef } from '../../../../shared/table/actions/charging-stations/table-export-ocpp-params-local-action';
import { TableRequestOCPPParamsAction, TableRequestOCPPParamsActionDef } from '../../../../shared/table/actions/charging-stations/table-request-ocpp-params-action';
import { TableSaveOCPPParameterAction, TableSaveOCPPParameterActionDef } from '../../../../shared/table/actions/charging-stations/table-save-ocpp-parameter-action';
import { TableUpdateOCPPParamsAction, TableUpdateOCPPParamsActionDef } from '../../../../shared/table/actions/charging-stations/table-update-ocpp-params-action';
import { EditableTableDataSource } from '../../../../shared/table/editable-table-data-source';
import { ChargingStation, ChargingStationButtonAction, OcppParameter } from '../../../../types/ChargingStation';
import { DropdownItem, TableActionDef, TableColumnDef, TableDef, TableEditType } from '../../../../types/Table';
import { ChargingStationOcppParametersInputFieldCellComponent } from './cell-components/charging-station-ocpp-parameters-input-field-cell.component';

@Injectable()
export class ChargingStationOcppParametersEditableTableDataSource extends EditableTableDataSource<OcppParameter> {
  private charger!: ChargingStation;

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
    return [
      new TableUpdateOCPPParamsAction().getActionDef(),
      new TableRequestOCPPParamsAction().getActionDef(),
      new TableExportOCPPParamsLocalAction().getActionDef()
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    // Avoid editable datasource default button (delete)
    return [];
  }

  public buildTableDynamicRowActions(ocppParameter: OcppParameter): TableActionDef[] {
    const actions = [];
    if (!ocppParameter.readonly) {
      actions.push(new TableSaveOCPPParameterAction().getActionDef());
    }
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.EXPORT_LOCAL_OCPP_PARAMS:
        if (actionDef.action) {
          (actionDef as TableExportOCPPParamsLocalActionDef).action(
            this.charger, this.getContent(), this.dialogService, this.translateService);
        }
        break;
      case ChargingStationButtonAction.UPDATE_OCPP_PARAMS:
        if (actionDef.action) {
          (actionDef as TableUpdateOCPPParamsActionDef).action(this.charger, this.dialogService, this.translateService, this.messageService, this.centralServerService,
            this.router, this.spinnerService, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.REQUEST_OCPP_PARAMS:
        if (actionDef.action) {
          (actionDef as TableRequestOCPPParamsActionDef).action(
            this.charger, this.dialogService, this.translateService, this.messageService, this.centralServerService,
            this.router, this.spinnerService, this.refreshData.bind(this));
        }
        break;
      default:
        super.actionTriggered(actionDef);
        break;
    }
  }

  public setCharger(charger: ChargingStation) {
    this.charger = charger;
  }

  public rowActionTriggered(actionDef: TableActionDef, ocppParameter: OcppParameter, dropdownItem?: DropdownItem, postDataProcessing?: () => void) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.SAVE_OCPP_PARAMETER:
        if (actionDef.action) {
          (actionDef as TableSaveOCPPParameterActionDef).action(
            this.charger, ocppParameter, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
    }
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'key',
        name: 'chargers.charger_param_key',
        isAngularComponent: true,
        angularComponent: ChargingStationOcppParametersInputFieldCellComponent,
        headerClass: 'text-right col-20p',
        validators: [
          Validators.required,
          Validators.maxLength(50),
        ],
        errors: [
          { id: 'required', message: 'general.mandatory_field' },
          { id: 'maxlength', message: 'general.error_max_length', messageParams: { length: 50 } },
        ],
        class: 'text-right col-20p table-cell-angular-big-component',
      },
      {
        id: 'value',
        name: 'chargers.charger_param_value',
        editType: TableEditType.INPUT,
        validators: [
          Validators.required,
          Validators.maxLength(500),
        ],
        canBeDisabled: true,
        errors: [
          { id: 'required', message: 'general.mandatory_field' },
          { id: 'maxlength', message: 'general.error_max_length', messageParams: { length: 500 } },
        ],
        headerClass: 'text-left',
        class: 'text-left ocpp-param-field',
      },
    ];
  }

  protected isCellDisabled(columnDef: TableColumnDef, editableRow: OcppParameter): boolean {
    return editableRow.readonly;
  }

  public createRow(): OcppParameter {
    return {
      id: '',
      key: '',
      value: '',
      readonly: false,
    };
  }

  public setContent(content: OcppParameter[]) {
    // Create custom row
    const customOcppParameterRow = this.createRow();
    customOcppParameterRow.id = ChargingStationOcppParametersInputFieldCellComponent.CUSTOM_OCPP_PARAMETER_ID;
    customOcppParameterRow.readonly = false;
    customOcppParameterRow.custom = true;
    // Set
    super.setContent([
      customOcppParameterRow,
      ...content,
    ]);
  }
}
