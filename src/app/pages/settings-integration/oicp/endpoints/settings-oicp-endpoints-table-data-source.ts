import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableAutoRefreshAction } from '../../../../shared/table/actions/table-auto-refresh-action';
import { TableCreateAction } from '../../../../shared/table/actions/table-create-action';
import { TableDeleteAction } from '../../../../shared/table/actions/table-delete-action';
import { TableEditAction } from '../../../../shared/table/actions/table-edit-action';
import { TableRefreshAction } from '../../../../shared/table/actions/table-refresh-action';
import { TableRegisterAction } from '../../../../shared/table/actions/table-register-action';
import { TableUnregisterAction } from '../../../../shared/table/actions/table-unregister-action';
import { TableDataSource } from '../../../../shared/table/table-data-source';
import { DataResult } from '../../../../types/DataResult';
import { ButtonAction, RestResponse } from '../../../../types/GlobalType';
import { OicpEndpoint } from '../../../../types/oicp/OICPEndpoint';
import { DropdownItem, TableActionDef, TableColumnDef, TableDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { SettingsOicpEndpointDialogComponent } from './endpoint/settings-oicp-endpoint.dialog.component';
import { OicpPatchJobResultFormatterComponent } from './formatters/oicp-patch-job-result-formatter.component';
import { OicpPatchJobStatusFormatterComponent } from './formatters/oicp-patch-job-status-formatter.component';
import { OicpEndpointStatusFormatterComponent } from './formatters/oicp-status-formatter.component';
import { SettingsOicpEndpointsDetailsComponent } from './oicp-details/settings-oicp-endpoints-details.component';

@Injectable()
export class SettingsOicpEndpointsTableDataSource extends TableDataSource<OicpEndpoint> {
  private editAction = new TableEditAction().getActionDef();
  private registerAction = new TableRegisterAction().getActionDef();
  private unregisterAction = new TableUnregisterAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerService: CentralServerService
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<OicpEndpoint>> {
    return new Observable((observer) => {
      // Get the OICP Endpoints
      this.centralServerService
        .getOicpEndpoints(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (oicpEndpoints) => {
            observer.next(oicpEndpoints);
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
        enabled: false,
      },
      design: {
        flat: true,
      },
      rowDetails: {
        enabled: true,
        angularComponent: SettingsOicpEndpointsDetailsComponent,
      },
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'oicpendpoints.name',
        headerClass: 'col-20p',
        class: 'text-left col-20p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'role',
        name: 'oicpendpoints.role',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        sortable: true,
      },
      {
        id: 'baseUrl',
        name: 'oicpendpoints.base_url',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true,
      },
      {
        id: 'countryCode',
        name: 'oicpendpoints.country_code',
        headerClass: 'col-5p',
        class: 'col-5p',
        sortable: true,
      },
      {
        id: 'partyId',
        name: 'oicpendpoints.party_id',
        headerClass: 'col-5p',
        class: 'col-5p',
        sortable: true,
      },
      {
        id: 'version',
        name: 'oicpendpoints.version',
        headerClass: '',
        class: '',
        sortable: true,
      },
      {
        id: 'status',
        name: 'oicpendpoints.status',
        isAngularComponent: true,
        angularComponent: OicpEndpointStatusFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
      },
      {
        id: 'patchJobStatus',
        name: 'oicpendpoints.patch_job_status',
        isAngularComponent: true,
        angularComponent: OicpPatchJobStatusFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
      },
      {
        id: 'patchJobResult',
        name: 'oicpendpoints.patch_job_last_status',
        isAngularComponent: true,
        angularComponent: OicpPatchJobResultFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [new TableCreateAction().getActionDef(), ...tableActionsDef];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [this.editAction, this.registerAction, this.unregisterAction, this.deleteAction];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.CREATE:
        this.showOicpEndpointDialog();
        break;
    }
  }

  public rowActionTriggered(
    actionDef: TableActionDef,
    oicpEndpoint: OicpEndpoint,
    dropdownItem?: DropdownItem
  ) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        this.showOicpEndpointDialog(oicpEndpoint);
        break;
      case ButtonAction.DELETE:
        this.deleteOicpEndpoint(oicpEndpoint);
        break;
      case ButtonAction.REGISTER:
        this.registerOicpEndpoint(oicpEndpoint);
        break;
      case ButtonAction.UNREGISTER:
        this.unregisterOicpEndpoint(oicpEndpoint);
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  private showOicpEndpointDialog(endpoint?: OicpEndpoint) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (endpoint) {
      dialogConfig.data = endpoint;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(SettingsOicpEndpointDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private deleteOicpEndpoint(oicpendpoint: OicpEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('oicpendpoints.delete_title'),
        this.translateService.instant('oicpendpoints.delete_confirm', { name: oicpendpoint.name })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.deleteOicpEndpoint(oicpendpoint.id).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                this.messageService.showSuccessMessage('oicpendpoints.delete_success', {
                  name: oicpendpoint.name,
                });
                this.refreshData().subscribe();
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'oicpendpoints.delete_error'
                );
              }
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'oicpendpoints.delete_error'
              );
            },
          });
        }
      });
  }

  private registerOicpEndpoint(oicpendpoint: OicpEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('oicpendpoints.register_title'),
        this.translateService.instant('oicpendpoints.register_confirm', { name: oicpendpoint.name })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.registerOicpEndpoint(oicpendpoint.id).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                this.messageService.showSuccessMessage('oicpendpoints.register_success', {
                  name: oicpendpoint.name,
                });
                this.refreshData().subscribe();
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'oicpendpoints.register_error'
                );
              }
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'oicpendpoints.register_error'
              );
            },
          });
        }
      });
  }

  private unregisterOicpEndpoint(oicpendpoint: OicpEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('oicpendpoints.unregister_title'),
        this.translateService.instant('oicpendpoints.unregister_confirm', {
          name: oicpendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.unregisterOicpEndpoint(oicpendpoint.id).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                this.messageService.showSuccessMessage('oicpendpoints.unregister_success', {
                  name: oicpendpoint.name,
                });
                this.refreshData().subscribe();
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'oicpendpoints.unregister_error'
                );
              }
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'oicpendpoints.unregister_error'
              );
            },
          });
        }
      });
  }
}
