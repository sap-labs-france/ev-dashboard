import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { TableUpdateOCPICredentialsAction } from 'shared/table/actions/ocpi/table-update-ocpi-credentials-action';
import { TableMoreAction } from 'shared/table/actions/table-more-action';
import { TableViewAction } from 'shared/table/actions/table-view-action';
import { DialogMode, OcpiEndpointsAuthorizationActions } from 'types/Authorization';

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
import { OcpiEndpointDataResult } from '../../../../types/DataResult';
import { ButtonAction, RestResponse } from '../../../../types/GlobalType';
import {
  OCPIButtonAction,
  OCPIEndpoint,
  OCPIRegistrationStatus,
} from '../../../../types/ocpi/OCPIEndpoint';
import { DropdownItem, TableActionDef, TableColumnDef, TableDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { SettingsOcpiEndpointDialogComponent } from './endpoint/settings-ocpi-endpoint.dialog.component';
import { OcpiPatchJobStatusFormatterComponent } from './formatters/ocpi-patch-job-status-formatter.component';
import { OcpiEndpointStatusFormatterComponent } from './formatters/ocpi-status-formatter.component';
import { SettingsOcpiEndpointsDetailsComponent } from './ocpi-details/settings-ocpi-endpoints-details.component';

@Injectable()
export class SettingsOcpiEndpointsTableDataSource extends TableDataSource<OCPIEndpoint> {
  private authorizations: OcpiEndpointsAuthorizationActions;

  private editAction = new TableEditAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();
  private createAction = new TableCreateAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();

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

  public loadDataImpl(): Observable<OcpiEndpointDataResult> {
    return new Observable((observer) => {
      // Get the OCPI Endpoints
      this.centralServerService
        .getOcpiEndpoints(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (ocpiEndpoints) => {
            // Init auth
            this.authorizations = {
              canCreate: Utils.convertToBoolean(ocpiEndpoints.canCreate),
              canGenerateLocalToken: Utils.convertToBoolean(ocpiEndpoints.canGenerateLocalToken),
              canPing: Utils.convertToBoolean(ocpiEndpoints.canPing),
            };
            // Set visibility
            this.createAction.visible = this.authorizations.canCreate;
            observer.next(ocpiEndpoints);
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
      hasDynamicRowAction: true,
      rowDetails: {
        enabled: true,
        angularComponent: SettingsOcpiEndpointsDetailsComponent,
      },
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'status',
        name: 'ocpiendpoints.status',
        isAngularComponent: true,
        angularComponent: OcpiEndpointStatusFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
      },
      {
        id: 'patchJobStatus',
        name: 'ocpiendpoints.patch_job_status',
        isAngularComponent: true,
        angularComponent: OcpiPatchJobStatusFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
      },
      {
        id: 'name',
        name: 'ocpiendpoints.name',
        headerClass: 'col-20p',
        class: 'text-left col-20p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'role',
        name: 'ocpiendpoints.role',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
      },
      {
        id: 'baseUrl',
        name: 'ocpiendpoints.base_url',
        headerClass: 'col-25p',
        class: 'col-25p',
      },
      {
        id: 'countryCode',
        name: 'ocpiendpoints.country_code',
        headerClass: 'col-5p',
        class: 'col-5p',
      },
      {
        id: 'partyId',
        name: 'ocpiendpoints.party_id',
        headerClass: 'col-5p',
        class: 'col-5p',
      },
      {
        id: 'version',
        name: 'ocpiendpoints.version',
        headerClass: '',
        class: '',
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [this.createAction, ...tableActionsDef];
  }

  public buildTableDynamicRowActions(ocpiEndpoint: OCPIEndpoint): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    const moreActions = new TableMoreAction([]);
    const registerAction = new TableRegisterAction().getActionDef();
    const unregisterAction = new TableUnregisterAction().getActionDef();
    const updateCredentialsAction = new TableUpdateOCPICredentialsAction().getActionDef();
    // Edit
    if (ocpiEndpoint.canUpdate) {
      rowActions.push(this.editAction);
    } else {
      rowActions.push(this.viewAction);
    }
    // More action
    if (ocpiEndpoint.canRegister) {
      moreActions.addActionInMoreActions(registerAction);
      moreActions.addActionInMoreActions(unregisterAction);
      moreActions.addActionInMoreActions(updateCredentialsAction);
    }
    if (ocpiEndpoint.canDelete) {
      moreActions.addActionInMoreActions(this.deleteAction);
    }
    if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
      rowActions.push(moreActions.getActionDef());
    }
    if (ocpiEndpoint.status === OCPIRegistrationStatus.REGISTERED) {
      registerAction.disabled = true;
      unregisterAction.disabled = false;
      updateCredentialsAction.disabled = false;
    } else {
      registerAction.disabled = false;
      unregisterAction.disabled = true;
      updateCredentialsAction.disabled = true;
    }
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.CREATE:
        this.showOcpiEndpointDialog(DialogMode.CREATE);
        break;
    }
  }

  public rowActionTriggered(
    actionDef: TableActionDef,
    ocpiEndpoint: OCPIEndpoint,
    dropdownItem?: DropdownItem
  ) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        this.showOcpiEndpointDialog(DialogMode.EDIT, ocpiEndpoint);
        break;
      case ButtonAction.VIEW:
        this.showOcpiEndpointDialog(DialogMode.VIEW, ocpiEndpoint);
        break;
      case ButtonAction.REGISTER:
        this.registerOcpiEndpoint(ocpiEndpoint);
        break;
      case ButtonAction.UNREGISTER:
        this.unregisterOcpiEndpoint(ocpiEndpoint);
        break;
      case OCPIButtonAction.UPDATE_CREDENTIALS:
        this.updateCredentialsOcpiEndpoint(ocpiEndpoint);
        break;
      case ButtonAction.DELETE:
        this.deleteOcpiEndpoint(ocpiEndpoint);
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [new TableAutoRefreshAction().getActionDef(), new TableRefreshAction().getActionDef()];
  }

  private showOcpiEndpointDialog(
    dialogMode: DialogMode,
    endpoint: OCPIEndpoint = {} as OCPIEndpoint
  ) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      dialogData: endpoint,
      dialogMode,
      authorizations: this.authorizations,
    };
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(SettingsOcpiEndpointDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private deleteOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.delete_title'),
        this.translateService.instant('ocpiendpoints.delete_confirm', { name: ocpiendpoint.name })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.deleteOcpiEndpoint(ocpiendpoint.id).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                this.messageService.showSuccessMessage('ocpiendpoints.delete_success', {
                  name: ocpiendpoint.name,
                });
                this.refreshData().subscribe();
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.delete_error'
                );
              }
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'ocpiendpoints.delete_error'
              );
            },
          });
        }
      });
  }

  private registerOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.register_title'),
        this.translateService.instant('ocpiendpoints.register_confirm', { name: ocpiendpoint.name })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.registerOcpiEndpoint(ocpiendpoint.id).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                this.messageService.showSuccessMessage('ocpiendpoints.register_success', {
                  name: ocpiendpoint.name,
                });
                this.refreshData().subscribe();
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.register_error'
                );
              }
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'ocpiendpoints.register_error'
              );
            },
          });
        }
      });
  }

  private unregisterOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.unregister_title'),
        this.translateService.instant('ocpiendpoints.unregister_confirm', {
          name: ocpiendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.unregisterOcpiEndpoint(ocpiendpoint.id).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                this.messageService.showSuccessMessage('ocpiendpoints.unregister_success', {
                  name: ocpiendpoint.name,
                });
                this.refreshData().subscribe();
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.unregister_error'
                );
              }
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'ocpiendpoints.unregister_error'
              );
            },
          });
        }
      });
  }

  private updateCredentialsOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.update_credentials_title'),
        this.translateService.instant('ocpiendpoints.update_credentials_confirm', {
          name: ocpiendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.updateCredentialsOcpiEndpoint(ocpiendpoint.id).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                this.messageService.showSuccessMessage('ocpiendpoints.update_credentials_success', {
                  name: ocpiendpoint.name,
                });
                this.refreshData().subscribe();
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.update_credentials_error'
                );
              }
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'ocpiendpoints.update_credentials_error'
              );
            },
          });
        }
      });
  }
}
