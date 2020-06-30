import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { ChargingStation, ChargingStationButtonAction, OcppParameter } from 'app/types/ChargingStation';
import { DropdownItem, TableActionDef, TableColumnDef, TableDef, TableEditType } from 'app/types/Table';
import { DialogService } from '../../../../services/dialog.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { EditableTableDataSource } from '../../../../shared/table/editable-table-data-source';
import { TableExportOCPPLocalAction } from '../../table-actions/table-export-ocpp-local-action';
import { TableSaveOCPPParameterAction } from '../../table-actions/table-save-ocpp-parameter-action';
import { ChargingStationOcppParametersInputFieldCellComponent } from './cell-components/charging-station-ocpp-parameters-input-field-cell.component';
import { Utils } from 'app/utils/Utils';


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
      },
      hasPristineFormAtLoad: true
    };
  }

  public buildTableActionsDef(): TableActionDef[] {
    return [new TableExportOCPPLocalAction().getActionDef()];
  }

  public buildTableRowActions(): TableActionDef[] {
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
      case ChargingStationButtonAction.EXPORT_OCPP_PARAMS:
        if (actionDef.action) {
          actionDef.action(this.charger, this.getContent(), this.dialogService, this.translateService);
        }
        break;
    }
    super.actionTriggered(actionDef);
  }

  public setCharger(charger: ChargingStation) {
    this.charger = charger;
  }

  public rowActionTriggered(actionDef: TableActionDef, ocppParameter: OcppParameter, dropdownItem?: DropdownItem, postDataProcessing?: () => void) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.SAVE_OCPP_PARAMETER:
        if (actionDef.action) {
          actionDef.action(this.charger, ocppParameter, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
    }
    // Call super
    super.rowActionTriggered(actionDef, ocppParameter, dropdownItem, postDataProcessing, true);
    if (this.formArray && !Utils.isEmptyArray(this.formArray.controls)) {
      this.formArray.controls[0].get('key').markAllAsTouched();
      this.formArray.controls[0].get('value').markAllAsTouched();
    }
  }

  public rowCellUpdated(cellValue: any, rowIndex: number, columnDef: TableColumnDef, postDataProcessing?: () => void) {
    super.rowCellUpdated(cellValue, rowIndex, columnDef, postDataProcessing);
    const row = this.getContent()[rowIndex];
    if (this.formArray) {
      if (row['dynamicRowActions'] && !Utils.isEmptyArray(row['dynamicRowActions'])) {
        if (this.formArray.controls[rowIndex].get('key').invalid || this.formArray.controls[rowIndex].get('value').invalid) {
          row['dynamicRowActions'][0].disabled = true;
        } else {
          row['dynamicRowActions'][0].disabled = false;
        }
        this.refreshData();
      }

    }
    this.formArray?.controls[rowIndex].get('key').markAllAsTouched();
    this.formArray?.controls[rowIndex].get('value').markAllAsTouched();
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'key',
        name: 'chargers.charger_param_key',
        isAngularComponent: true,
        angularComponent: ChargingStationOcppParametersInputFieldCellComponent,
        headerClass: 'text-right col-20p',
        class: 'text-right col-20p table-cell-angular-big-component',
      },
      {
        id: 'value',
        name: 'chargers.charger_param_value',
        editType: TableEditType.INPUT,
        validators: [
          Validators.maxLength(500),
          Validators.required,
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
    if (columnDef.id === 'value') {
      return editableRow.readonly;
    }
    return (editableRow.id !== 'InputRow');
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
    // Set
    super.setContent([
      customOcppParameterRow,
      ...content,
    ]);
  }
}
