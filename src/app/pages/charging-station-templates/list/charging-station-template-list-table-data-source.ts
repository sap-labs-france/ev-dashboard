import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { AppDatePipe } from 'shared/formatters/app-date.pipe';
import { User } from 'types/User';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import {
  TableCreateTemplateAction,
  TableCreateTemplateActionDef,
} from '../../../shared/table/actions/charging-station-templates/table-create-template-action';
import {
  TableDeleteTemplateAction,
  TableDeleteTemplateActionDef,
} from '../../../shared/table/actions/charging-station-templates/table-delete-template-action';
import {
  TableEditTemplateAction,
  TableEditTemplateActionDef,
} from '../../../shared/table/actions/charging-station-templates/table-edit-template-action';
import { TableExportTemplatesActionDef } from '../../../shared/table/actions/charging-station-templates/table-export-templates-action';
import {
  TableViewTemplateAction,
  TableViewTemplateActionDef,
} from '../../../shared/table/actions/charging-station-templates/table-view-template-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import {
  ChargingStationTemplate,
  ChargingStationTemplateButtonAction,
} from '../../../types/ChargingStationTemplate';
import { DataResult } from '../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { ChargingStationTemplateDialogComponent } from '../charging-station-template/charging-station-template-dialog.component';

@Injectable()
export class ChargingStationTemplatesListTableDataSource extends TableDataSource<ChargingStationTemplate> {
  private createAction = new TableCreateTemplateAction().getActionDef();
  private viewAction = new TableViewTemplateAction().getActionDef();
  private editAction = new TableEditTemplateAction().getActionDef();
  private deleteAction = new TableDeleteTemplateAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe
  ) {
    super(spinnerService, translateService);
    // With user
    this.setStaticFilters([{ WithUser: true }]);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<ChargingStationTemplate>> {
    return new Observable((observer) => {
      // Get Sites
      this.centralServerService
        .getChargingStationTemplates(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (chargingStationTemplate) => {
            this.createAction.visible = Utils.convertToBoolean(chargingStationTemplate.canCreate);
            observer.next(chargingStationTemplate);
            observer.complete();
          },
          error: (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          },
        });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'template.chargePointVendor',
        name: 'templates.chargePointVendor',
        formatter: (chargePointVendor: string) => chargePointVendor ?? '-',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
      },
      {
        id: 'template.extraFilters.chargePointModel',
        name: 'templates.chargePointModel',
        formatter: (chargePointModel: string) => chargePointModel ?? '-',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
      },
      {
        id: 'template.extraFilters.chargeBoxSerialNumber',
        name: 'templates.chargeBoxSerialNumber',
        formatter: (chargeBoxSerialNumber: string) => chargeBoxSerialNumber ?? '-',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
      },
      {
        id: 'createdOn',
        name: 'general.created_on',
        formatter: (createdOn: Date) => this.datePipe.transform(createdOn) ?? '-',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
      },
      {
        id: 'createdBy',
        name: 'general.created_by',
        formatter: (user: User) => Utils.buildUserFullName(user) ?? '-',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
      },
      {
        id: 'lastChangedOn',
        name: 'general.changed_on',
        formatter: (lastChangedOn: Date) => this.datePipe.transform(lastChangedOn) ?? '-',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
      },
      {
        id: 'lastChangedBy',
        name: 'general.changed_by',
        formatter: (user: User) => Utils.buildUserFullName(user) ?? '-',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
      },
      {
        id: 'id',
        name: 'general.id',
        formatter: (id: string) => id ?? '-',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [this.createAction, ...tableActionsDef];
  }

  public buildTableDynamicRowActions(
    chargingStationTemplate: ChargingStationTemplate
  ): TableActionDef[] {
    const rowActions = [];
    if (chargingStationTemplate.canUpdate) {
      rowActions.push(this.editAction);
    } else {
      rowActions.push(this.viewAction);
    }
    if (chargingStationTemplate.canDelete) {
      rowActions.push(new TableMoreAction([this.deleteAction]).getActionDef());
    }
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ChargingStationTemplateButtonAction.CREATE_TEMPLATE:
        if (actionDef.action) {
          (actionDef as TableCreateTemplateActionDef).action(
            ChargingStationTemplateDialogComponent,
            this.dialog,
            this.refreshData.bind(this)
          );
        }
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, template: ChargingStationTemplate) {
    switch (actionDef.id) {
      case ChargingStationTemplateButtonAction.EDIT_TEMPLATE:
        if (actionDef.action) {
          (actionDef as TableEditTemplateActionDef).action(
            ChargingStationTemplateDialogComponent,
            this.dialog,
            { dialogData: template },
            this.refreshData.bind(this)
          );
        }
        break;
      case ChargingStationTemplateButtonAction.VIEW_TEMPLATE:
        if (actionDef.action) {
          (actionDef as TableViewTemplateActionDef).action(
            ChargingStationTemplateDialogComponent,
            this.dialog,
            { dialogData: template },
            this.refreshData.bind(this)
          );
        }
        break;
      case ChargingStationTemplateButtonAction.DELETE_TEMPLATE:
        if (actionDef.action) {
          (actionDef as TableDeleteTemplateActionDef).action(
            template,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case ChargingStationTemplateButtonAction.EXPORT_TEMPLATE:
        if (actionDef.action) {
          (actionDef as TableExportTemplatesActionDef).action(
            this.buildFilterValues(),
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.router,
            this.spinnerService
          );
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }
}
