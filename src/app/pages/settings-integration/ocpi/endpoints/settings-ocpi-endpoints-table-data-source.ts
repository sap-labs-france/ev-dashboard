import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerNotificationService } from '../../../../services/central-server-notification.service';
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
import ChangeNotification from '../../../../types/ChangeNotification';
import { DataResult } from '../../../../types/DataResult';
import { ButtonAction, RestResponse } from '../../../../types/GlobalType';
import { ButtonType, DropdownItem, TableActionDef, TableColumnDef, TableDef } from '../../../../types/Table';
import { OcpiEndpoint } from '../../../../types/ocpi/OCPIEndpoint';
import { Utils } from '../../../../utils/Utils';
import { SettingsOcpiEnpointDialogComponent } from './endpoint/settings-ocpi-endpoint.dialog.component';
import { OcpiPatchJobResultFormatterComponent } from './formatters/ocpi-patch-job-result-formatter.component';
import { OcpiPatchJobStatusFormatterComponent } from './formatters/ocpi-patch-job-status-formatter.component';
import { OcpiEndpointStatusFormatterComponent } from './formatters/ocpi-status-formatter.component';
import { SettingsOcpiEnpointsDetailsComponent } from './ocpi-details/settings-ocpi-endpoints-details.component';

@Injectable()
export class SettingsOcpiEndpointsTableDataSource extends TableDataSource<OcpiEndpoint> {
  private editAction = new TableEditAction().getActionDef();
  private registerAction = new TableRegisterAction().getActionDef();
  private unregisterAction = new TableUnregisterAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectOcpiEndpoints();
  }

  public loadDataImpl(): Observable<DataResult<OcpiEndpoint>> {
    return new Observable((observer) => {
      // Get the OCPI Endpoints
      this.centralServerService.getOcpiEndpoints(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((ocpiEndpoints) => {
          // Ok
          observer.next(ocpiEndpoints);
          observer.complete();
        }, (error) => {
          // Show error
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
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
        angularComponent: SettingsOcpiEnpointsDetailsComponent,
      },
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
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
        sortable: true,
      },
      {
        id: 'baseUrl',
        name: 'ocpiendpoints.base_url',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true,
      },
      {
        id: 'countryCode',
        name: 'ocpiendpoints.country_code',
        headerClass: 'col-5p',
        class: 'col-5p',
        sortable: true,
      },
      {
        id: 'partyId',
        name: 'ocpiendpoints.party_id',
        headerClass: 'col-5p',
        class: 'col-5p',
        sortable: true,
      },
      {
        id: 'version',
        name: 'ocpiendpoints.version',
        headerClass: '',
        class: '',
        sortable: true,
      },
      {
        id: 'status',
        name: 'ocpiendpoints.status',
        isAngularComponent: true,
        angularComponent: OcpiEndpointStatusFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        sortable: false,
      },
      {
        id: 'patchJobStatus',
        name: 'ocpiendpoints.patch_job_status',
        isAngularComponent: true,
        angularComponent: OcpiPatchJobStatusFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        sortable: false,
      },
      {
        id: 'patchJobResult',
        name: 'ocpiendpoints.patch_job_last_status',
        isAngularComponent: true,
        angularComponent: OcpiPatchJobResultFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        sortable: false,
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableCreateAction().getActionDef(),
      ...tableActionsDef,
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [
      this.editAction,
      this.registerAction,
      this.unregisterAction,
      this.deleteAction,
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.CREATE:
        this.showOcpiEndpointDialog();
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, ocpiEndpoint: OcpiEndpoint, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        this.showOcpiEndpointDialog(ocpiEndpoint);
        break;
      case ButtonAction.DELETE:
        this.deleteOcpiEndpoint(ocpiEndpoint);
        break;
      case ButtonAction.REGISTER:
        this.registerOcpiEndpoint(ocpiEndpoint);
        break;
      case ButtonAction.UNREGISTER:
        this.unregisterOcpiEndpoint(ocpiEndpoint);
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  private showOcpiEndpointDialog(endpoint?: OcpiEndpoint) {
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
    const dialogRef = this.dialog.open(SettingsOcpiEnpointDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private deleteOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.delete_title'),
      this.translateService.instant('ocpiendpoints.delete_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.deleteOcpiEndpoint(ocpiendpoint.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage('ocpiendpoints.delete_success', { name: ocpiendpoint.name });
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.delete_error');
        });
      }
    });
  }

  private registerOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.register_title'),
      this.translateService.instant('ocpiendpoints.register_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.registerOcpiEndpoint(ocpiendpoint.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage('ocpiendpoints.register_success', { name: ocpiendpoint.name });
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.register_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.register_error');
        });
      }
    });
  }

  private unregisterOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.unregister_title'),
      this.translateService.instant('ocpiendpoints.unregister_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.unregisterOcpiEndpoint(ocpiendpoint.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage('ocpiendpoints.unregister_success', { name: ocpiendpoint.name });
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.unregister_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.unregister_error');
        });
      }
    });
  }
}
