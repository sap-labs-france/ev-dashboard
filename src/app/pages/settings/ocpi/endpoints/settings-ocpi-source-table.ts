import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { TableDataSource } from 'app/shared/table/table-data-source';
import { SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, DropdownItem, OcpiEndpoint } from 'app/common.types';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { Utils } from 'app/utils/Utils';
import { MatDialog, MatDialogConfig } from '@angular/material';

import { EndpointDialogComponent } from './dialog/endpoint.dialog.component';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableRegisterAction } from 'app/shared/table/actions/table-register-action';
import { Constants } from 'app/utils/Constants';
import { DialogService } from 'app/services/dialog.service';
import { OcpiEndpointStatusComponent } from './formatters/ocpi-status.component';
import { OcpiPatchJobResultComponent } from './formatters/ocpi-patch-job-result.component';
import { OcpiPatchJobStatusComponent } from './formatters/ocpi-patch-job-status.component';
import { OcpiEndpointDetailComponent} from './ocpi-details/ocpi-detail-component.component';


@Injectable()
export class EndpointsDataSource extends TableDataSource<OcpiEndpoint> {
  constructor(
      private messageService: MessageService,
      private translateService: TranslateService,
      private dialogService: DialogService,
      private router: Router,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService) {
    super();
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectOcpiendpoints();
  }

  public loadData(): Observable<any> {
    return new Observable((observer) => {
      // Get the OCPI Endpoints
      this.centralServerService.getOcpiEndpoints(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((ocpiendpoints) => {
          // Update nbr records
          this.setTotalNumberOfRecords(ocpiendpoints.count);
          // Ok
          observer.next(ocpiendpoints.result);
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
        enabled: false
      },
      design: {
        flat: true
      },
      rowDetails: {
        enabled: true,
        angularComponent: OcpiEndpointDetailComponent
      }
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
        sortable: true
      },
      {
        id: 'baseUrl',
        name: 'ocpiendpoints.baseUrl',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true
      },
      {
        id: 'countryCode',
        name: 'ocpiendpoints.countryCode',
        headerClass: 'col-5p',
        class: 'col-5p',
        sortable: true
      },
      {
        id: 'partyId',
        name: 'ocpiendpoints.partyId',
        headerClass: 'col-5p',
        class: 'col-5p',
        sortable: true
      },
      {
        id: 'version',
        name: 'ocpiendpoints.version',
        headerClass: '',
        class: '',
        sortable: true
      },
      {
        id: 'status',
        name: 'ocpiendpoints.status',
        isAngularComponent: true,
        angularComponent: OcpiEndpointStatusComponent,
        headerClass: 'text-center col-10p',
        class: '',
        sortable: false
      },
      {
        id: 'patchJobStatus',
        name: 'ocpiendpoints.patchJobStatus',
        isAngularComponent: true,
        angularComponent: OcpiPatchJobStatusComponent,
        headerClass: 'text-center col-10p',
        class: '',
        sortable: false
      },
      {
        id: 'patchJobResult',
        name: 'ocpiendpoints.patchJobLastStatus',
        isAngularComponent: true,
        angularComponent: OcpiPatchJobResultComponent,
        headerClass: 'text-center col-10p',
        class: '',
        sortable: false
      }
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableCreateAction().getActionDef(),
      ...tableActionsDef
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [
      new TableEditAction().getActionDef(),
      new TableRegisterAction().getActionDef(),
      new TableDeleteAction().getActionDef()
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this.showOcpiendpointDialog();
        break;
    }
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case 'edit':
        this.showOcpiendpointDialog(rowItem);
        break;
      case 'delete':
        this.deleteOcpiendpoint(rowItem);
        break;
      case 'register':
        this.registerOcpiendpoint(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  private showOcpiendpointDialog(endpoint?: any) {
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
    const dialogRef = this.dialog.open(EndpointDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => this.refreshOrLoadData().subscribe());
  }

  private deleteOcpiendpoint(ocpiendpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.delete_title'),
      this.translateService.instant('ocpiendpoints.delete_confirm', { 'name': ocpiendpoint.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.centralServerService.deleteOcpiendpoint(ocpiendpoint.id).subscribe(response => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('ocpiendpoints.delete_success', { 'name': ocpiendpoint.name });
            this.refreshOrLoadData().subscribe();
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

  private registerOcpiendpoint(ocpiendpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.register_title'),
      this.translateService.instant('ocpiendpoints.register_confirm', { 'name': ocpiendpoint.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.centralServerService.registerOcpiendpoint(ocpiendpoint.id).subscribe(response => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('ocpiendpoints.register_success', { 'name': ocpiendpoint.name });
            this.refreshOrLoadData().subscribe();
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
}
