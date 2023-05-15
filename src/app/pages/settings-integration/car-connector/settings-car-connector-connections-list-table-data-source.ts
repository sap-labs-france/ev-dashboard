import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { TableViewAction } from 'shared/table/actions/table-view-action';
import { DialogMode, SettingAuthorizationActions } from 'types/Authorization';

import { DialogService } from '../../../services/dialog.service';
import { SpinnerService } from '../../../services/spinner.service';
import { TableEditAction } from '../../../shared/table/actions/table-edit-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { EditableTableDataSource } from '../../../shared/table/editable-table-data-source';
import { DataResult } from '../../../types/DataResult';
import { ButtonAction } from '../../../types/GlobalType';
import { CarConnectorConnectionSetting, CarConnectorConnectionType } from '../../../types/Setting';
import {
  TableActionDef,
  TableColumnDef,
  TableDef,
  TableEditType,
  TableFilterDef,
} from '../../../types/Table';
import { CarConnectorConnectionDialogComponent } from './connection/car-connector-connection.dialog.component';

@Injectable()
export class SettingsCarConnectorConnectionEditableTableDataSource extends EditableTableDataSource<CarConnectorConnectionSetting> {
  public authorizations: SettingAuthorizationActions;
  private editAction = new TableEditAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {
    super(spinnerService, translateService);
  }

  public loadDataImpl(): Observable<DataResult<CarConnectorConnectionSetting>> {
    // Not really editable datasource
    return new Observable((observer) => {
      if (this.editableRows) {
        this.addAction.visible = this.authorizations?.canUpdate;
        // Car connector sort by name
        this.editableRows.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
        observer.next({
          count: this.editableRows.length,
          result: this.editableRows,
        });
      } else {
        observer.next({
          count: 0,
          result: [],
        });
      }
      observer.complete();
    });
  }

  public buildTableDef(): TableDef {
    return {
      id: 'SettingsCarConnectorConnectorsEditableTableDataSource',
      isEditable: false,
      rowFieldNameIdentifier: 'id',
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'Name',
        headerClass: 'col-30p',
        class: 'text-left col-30p',
        editType: TableEditType.DISPLAY_ONLY,
        sorted: true,
        direction: 'asc',
        sortable: false,
      },
      {
        id: 'description',
        name: 'Description',
        headerClass: 'col-40p',
        class: 'col-40p',
        editType: TableEditType.DISPLAY_ONLY,
        sortable: false,
      },
      {
        id: 'type',
        name: 'Type',
        formatter: (type: string) =>
          this.translateService.instant(
            `settings.car_connector.types.${type.replace(
              /[A-Z]/g,
              (letter) => '_' + letter.toLowerCase()
            )}`
          ),
        headerClass: 'col-30p',
        class: 'col-30p',
        editType: TableEditType.DISPLAY_ONLY,
        sortable: false,
      },
    ];
  }

  public buildTableDynamicRowActions(row: CarConnectorConnectionSetting): TableActionDef[] {
    // Using global setting authorizations
    const rowActions: TableActionDef[] = [];
    // Update or View
    if (this.authorizations.canUpdate) {
      rowActions.push(this.editAction);
    } else {
      rowActions.push(this.viewAction);
    }
    // Delete action
    if (this.authorizations.canUpdate) {
      rowActions.push(...super.buildTableRowActions());
    }
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case ButtonAction.ADD:
        this.showCarConnectorConnectionDialog(DialogMode.CREATE);
        break;
    }
  }

  public rowActionTriggered(
    actionDef: TableActionDef,
    carConnectorConnection: CarConnectorConnectionSetting
  ) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        this.showCarConnectorConnectionDialog(DialogMode.EDIT, carConnectorConnection);
        break;
      case ButtonAction.VIEW:
        this.showCarConnectorConnectionDialog(DialogMode.VIEW, carConnectorConnection);
        break;
      case ButtonAction.DELETE:
        this.dialogService
          .createAndShowYesNoDialog(
            this.translateService.instant('settings.car_connector.connection.delete_title'),
            this.translateService.instant('settings.car_connector.connection.delete_confirm', {
              carConnectorConnectionName: carConnectorConnection.name,
            })
          )
          .subscribe((result) => {
            if (result === ButtonAction.YES) {
              super.rowActionTriggered(actionDef, carConnectorConnection);
            }
          });
        break;
      default:
        super.rowActionTriggered(actionDef, carConnectorConnection);
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [new TableRefreshAction().getActionDef()];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  public createRow(): CarConnectorConnectionSetting {
    return {
      id: null,
      key: null,
      name: '',
      description: '',
      type: CarConnectorConnectionType.NONE,
    };
  }

  public setAuthorizations(authorizations: SettingAuthorizationActions) {
    this.authorizations = authorizations;
  }

  private showCarConnectorConnectionDialog(
    dialogMode: DialogMode,
    carConnectorConnection?: CarConnectorConnectionSetting
  ) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Update
    dialogConfig.data = { dialogData: carConnectorConnection, dialogMode };
    // Disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(CarConnectorConnectionDialogComponent, dialogConfig);
    dialogRef
      .afterClosed()
      .subscribe((carConnectorConnectionSetting: CarConnectorConnectionSetting) => {
        if (carConnectorConnectionSetting) {
          // Find object
          const index = this.editableRows.findIndex(
            (editableRow) => editableRow.id === carConnectorConnectionSetting.id
          );
          if (index >= 0) {
            // Update
            this.editableRows.splice(index, 1, carConnectorConnectionSetting);
          } else {
            // Create
            this.editableRows.push(carConnectorConnectionSetting);
          }
          this.refreshData(false).subscribe();
          this.formArray.markAsDirty();
          this.tableChangedSubject.next(this.editableRows);
        }
      });
  }
}
