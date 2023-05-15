import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { User } from 'types/User';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import {
  TableOpenURLAction,
  TableOpenURLActionDef,
} from '../../../shared/table/actions/table-open-url-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import {
  TableCreateTenantAction,
  TableCreateTenantActionDef,
} from '../../../shared/table/actions/tenants/table-create-tenant-action';
import {
  TableDeleteTenantAction,
  TableDeleteTenantActionDef,
} from '../../../shared/table/actions/tenants/table-delete-tenant-action';
import {
  TableEditTenantAction,
  TableEditTenantActionDef,
} from '../../../shared/table/actions/tenants/table-edit-tenant-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { DataResult } from '../../../types/DataResult';
import { ButtonAction } from '../../../types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { Tenant, TenantButtonAction } from '../../../types/Tenant';
import { Utils } from '../../../utils/Utils';
import { TenantLogoFormatterCellComponent } from '../cell-components/tenant-logo-formatter-cell.component';
import { TenantDialogComponent } from '../tenant/tenant-dialog.component';

@Injectable()
export class TenantsListTableDataSource extends TableDataSource<Tenant> {
  private editAction = new TableEditTenantAction().getActionDef();
  private openUrlAction = new TableOpenURLAction().getActionDef();
  private deleteAction = new TableDeleteTenantAction().getActionDef();
  private createAction = new TableCreateTenantAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private windowService: WindowService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe
  ) {
    super(spinnerService, translateService);
    // Init
    this.setStaticFilters([{ WithLogo: true }]);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Tenant>> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService
        .getTenants(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (tenants) => {
            this.createAction.visible = true;
            observer.next(tenants);
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
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'logo',
        name: 'tenants.logo',
        headerClass: 'text-center col-8p',
        class: 'col-8p p-0',
        isAngularComponent: true,
        angularComponent: TenantLogoFormatterCellComponent,
      },
      {
        id: 'id',
        name: 'general.id',
        headerClass: 'col-25p',
        class: 'text-left col-25p',
        sortable: true,
      },
      {
        id: 'subdomain',
        name: 'tenants.subdomain',
        headerClass: 'col-25p',
        class: 'col-25p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'name',
        name: 'tenants.name',
        headerClass: 'col-25p',
        class: 'text-left col-25p',
        sortable: true,
      },
      {
        id: 'email',
        name: 'tenants.email',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: true,
      },
      {
        id: 'createdOn',
        name: 'users.created_on',
        formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
        headerClass: 'col-15em',
        class: 'col-15em',
        sortable: true,
      },
      {
        id: 'createdBy',
        name: 'users.created_by',
        formatter: (user: User) => Utils.buildUserFullName(user),
        headerClass: 'col-15em',
        class: 'col-15em',
      },
      {
        id: 'lastChangedOn',
        name: 'users.changed_on',
        formatter: (lastChangedOn: Date) => this.datePipe.transform(lastChangedOn),
        headerClass: 'col-15em',
        class: 'col-15em',
        sortable: true,
      },
      {
        id: 'lastChangedBy',
        name: 'users.changed_by',
        formatter: (user: User) => Utils.buildUserFullName(user),
        headerClass: 'col-15em',
        class: 'col-15em',
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [this.createAction, ...tableActionsDef];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [this.editAction, this.openUrlAction, this.deleteAction];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case TenantButtonAction.CREATE_TENANT:
        if (actionDef.action) {
          (actionDef as TableCreateTenantActionDef).action(
            TenantDialogComponent,
            this.dialog,
            this.refreshData.bind(this)
          );
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, tenant: Tenant) {
    switch (actionDef.id) {
      case TenantButtonAction.EDIT_TENANT:
        if (actionDef.action) {
          (actionDef as TableEditTenantActionDef).action(
            TenantDialogComponent,
            this.dialog,
            { dialogData: tenant },
            this.refreshData.bind(this)
          );
        }
        break;
      case TenantButtonAction.DELETE_TENANT:
        if (actionDef.action) {
          (actionDef as TableDeleteTenantActionDef).action(
            tenant,
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
      case ButtonAction.OPEN_URL:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action(
            `${this.windowService.getProtocol()}//${
              tenant.subdomain
            }.${this.windowService.getHost()}`,
            this.windowService
          );
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [new TableAutoRefreshAction().getActionDef(), new TableRefreshAction().getActionDef()];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }
}
