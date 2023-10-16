import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { WindowService } from 'services/window.service';
import { TableAutoRefreshAction } from 'shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'shared/table/actions/table-refresh-action';
import { TableDataSource } from 'shared/table/table-data-source';
import { ReservationDataResult } from 'types/DataResult';
import { Reservation, ReservationButtonAction, ReservationStatus } from 'types/Reservation';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'types/Table';
import { TenantComponents } from 'types/Tenant';
import { IssuerFilter } from 'shared/table/filters/issuer-filter';
import { SiteTableFilter } from 'shared/table/filters/site-table-filter';
import { SiteAreaTableFilter } from 'shared/table/filters/site-area-table-filter';
import { ReservationsAuthorizations } from 'types/Authorization';
import {
  TableEditReservationAction,
  TableEditReservationActionDef,
} from 'shared/table/actions/reservations/table-edit-reservation-action';
import {
  TableViewReservationAction,
  TableViewReservationActionDef,
} from 'shared/table/actions/reservations/table-view-reservation-action';
import {
  TableCancelReservationAction,
  TableCancelReservationActionDef,
} from 'shared/table/actions/reservations/table-cancel-reservation-action';
import {
  TableDeleteReservationAction,
  TableDeleteReservationActionDef,
} from 'shared/table/actions/reservations/table-delete-reservation-action';
import {
  TableExportReservationsAction,
  TableExportReservationsActionDef,
} from 'shared/table/actions/reservations/table-export-reservations-action';
import {
  TableCreateReservationAction,
  TableCreateReservationActionDef,
} from 'shared/table/actions/reservations/table-create-reservation-action';
import { AppDatePipe } from 'shared/formatters/app-date.pipe';
import { DateRangeTableFilter } from 'shared/table/filters/date-range-table-filter';
import { Constants } from 'utils/Constants';
import { User } from 'types/User';
import { UserTableFilter } from 'shared/table/filters/user-table-filter';
import {
  TableDeleteReservationsAction,
  TableDeleteReservationsActionDef,
} from 'shared/table/actions/reservations/table-delete-reservations-action';
import { Utils } from '../../../utils/Utils';
import { ReservationDialogComponent } from '../reservation/reservation-dialog.component';
import { ReservationsConnectorsCellComponent } from '../cell-components/reservations-connectors-cell.component';
import { ReservationsTypeFormatterCellComponent } from '../cell-components/reservations-type-cell.component';
import { ReservationStatusFormatterCellComponent } from '../cell-components/reservations-status-cell.component';

@Injectable()
export class ReservationsListTableDataSource extends TableDataSource<Reservation> {
  private readonly isOrganizationComponentActive: boolean;

  private editAction = new TableEditReservationAction().getActionDef();
  private viewAction = new TableViewReservationAction().getActionDef();
  private cancelAction = new TableCancelReservationAction().getActionDef();
  private deleteAction = new TableDeleteReservationAction().getActionDef();
  private deleteManyAction = new TableDeleteReservationsAction().getActionDef();

  private canExport = new TableExportReservationsAction().getActionDef();
  private canCreate = new TableCreateReservationAction().getActionDef();

  private issuerFilter: TableFilterDef;
  private siteFilter: TableFilterDef;
  private siteAreaFilter: TableFilterDef;
  // private companyFilter: TableFilterDef;
  private userFilter: TableFilterDef;
  private dateRangeFilter: TableFilterDef;

  private reservationsAuthorizations: ReservationsAuthorizations;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private datePipe: AppDatePipe,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private windowService: WindowService
  ) {
    super(spinnerService, translateService);
    this.isOrganizationComponentActive = this.componentService.isActive(
      TenantComponents.ORGANIZATION
    );
    if (this.isOrganizationComponentActive) {
      this.setStaticFilters([
        {
          WithSite: true,
          WithSiteArea: true,
          WithUser: true,
          WithChargingStation: true,
          WithTag: true,
        },
      ]);
    }
    this.initDataSource();
  }

  public loadDataImpl(): Observable<ReservationDataResult> {
    return new Observable((observer) => {
      this.centralServerService
        .getReservations(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (reservations) => {
            this.reservationsAuthorizations = {
              canListSiteAreas: Utils.convertToBoolean(reservations.canListSiteAreas),
              canListSites: Utils.convertToBoolean(reservations.canListSites),
              canListCompanies: Utils.convertToBoolean(reservations.canListCompanies),
              canListUsers: Utils.convertToBoolean(reservations.canListUsers),
              canExport: Utils.convertToBoolean(reservations.canExport),
              canCreate: Utils.convertToBoolean(reservations.canCreate),
              canDelete: Utils.convertToBoolean(reservations.canDelete),
              canListTags: Utils.convertToBoolean(reservations.canListTags),
              metadata: reservations.metadata,
            };
            this.siteFilter.visible = this.reservationsAuthorizations.canListSites;
            this.siteAreaFilter.visible = this.reservationsAuthorizations.canListSiteAreas;
            // this.companyFilter.visible = this.reservationsAuthorizations.canListCompanies;
            this.userFilter.visible = this.reservationsAuthorizations.canListUsers;
            this.dateRangeFilter.visible = true;

            this.canExport.visible = this.reservationsAuthorizations.canExport;
            this.canCreate.visible = this.reservationsAuthorizations.canCreate;
            this.deleteManyAction.visible = this.reservationsAuthorizations.canDelete;

            const tableDef = this.getTableDef();
            tableDef.rowDetails.additionalParameters = {
              projectFields: reservations.projectFields,
            };
            observer.next(reservations);
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
      rowSelection: {
        enabled: true,
        multiple: true,
      },
      rowDetails: {
        enabled: false,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'chargingStationID',
        name: 'reservations.chargingstation_id',
        headerClass: 'col-10p',
        class: 'col-10p',
      },
      {
        id: 'connectorID',
        name: 'reservations.connector_id',
        headerClass: 'text-center',
        class: 'text-center table-cell-angular-big-component',
        isAngularComponent: true,
        angularComponent: ReservationsConnectorsCellComponent,
      },
      {
        id: 'fromDate',
        name: 'reservations.from_date',
        headerClass: 'col-15p',
        class: 'col-15p',
        formatter: (fromDate: Date) =>
          this.datePipe.transform(fromDate, Constants.CUSTOM_DATE_FORMAT),
      },
      {
        id: 'toDate',
        name: 'reservations.to_date',
        headerClass: 'col-15p',
        class: 'col-15p',
        formatter: (toDate: Date) => this.datePipe.transform(toDate, Constants.CUSTOM_DATE_FORMAT),
      },
      {
        id: 'arrivalTime',
        name: 'reservations.arrival_time',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (arrivalTime: Date) =>
          arrivalTime ? this.datePipe.transform(arrivalTime, 'HH:mm') : '-',
      },
      {
        id: 'departureTime',
        name: 'reservations.departure_time',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (departureTime: Date) =>
          departureTime ? this.datePipe.transform(departureTime, 'HH:mm') : '-',
      },
      {
        id: 'tag.user.name',
        name: 'reservations.user',
        formatter: (name: string, reservation: Reservation) =>
          Utils.buildUserFullName(reservation['tag'].user),
        headerClass: 'col-10p',
        class: 'col-10p',
      },
      {
        id: 'status',
        name: 'reservations.status',
        headerClass: 'col-10p text-center',
        class: 'col-10p text-center table-cell-angular-big-component',
        isAngularComponent: true,
        angularComponent: ReservationStatusFormatterCellComponent,
        sortable: true,
      },
      {
        id: 'type',
        name: 'reservations.type',
        sortable: true,
        headerClass: 'col-10p text-center',
        class: 'col-10p text-center table-cell-angular-big-component',
        isAngularComponent: true,
        angularComponent: ReservationsTypeFormatterCellComponent,
      },
      {
        id: 'createdOn',
        name: 'general.created_on',
        headerClass: 'col-15p',
        class: 'col-15p',
        sorted: true,
        direction: 'desc',
        sortable: true,
        formatter: (created_on: Date) =>
          this.datePipe.transform(created_on, Constants.CUSTOM_DATE_FORMAT),
      },
      {
        id: 'createdBy',
        name: 'general.created_by',
        formatter: (user: User) => Utils.buildUserFullName(user),
        headerClass: 'col-15em',
        class: 'col-15em',
      },
    ];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [this.canCreate, this.canExport, this.deleteManyAction, ...tableActionsDef];
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case ReservationButtonAction.CREATE_RESERVATION:
        if (actionDef.action) {
          (actionDef as TableCreateReservationActionDef).action(
            ReservationDialogComponent,
            this.dialog,
            { authorizations: this.reservationsAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
      case ReservationButtonAction.EXPORT_RESERVATIONS:
        if (actionDef.action) {
          (actionDef as TableExportReservationsActionDef).action(
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
      case ReservationButtonAction.DELETE_RESERVATIONS:
        if (actionDef.action) {
          (actionDef as TableDeleteReservationsActionDef).action(
            this.getSelectedRows(),
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.clearSelectedRows.bind(this),
            this.refreshData.bind(this)
          );
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, reservation: Reservation): void {
    switch (actionDef.id) {
      case ReservationButtonAction.VIEW_RESERVATION:
        if (actionDef.action) {
          (actionDef as TableViewReservationActionDef).action(
            ReservationDialogComponent,
            this.dialog,
            { dialogData: reservation, authorizations: this.reservationsAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
      case ReservationButtonAction.EDIT_RESERVATION:
        if (actionDef.action) {
          (actionDef as TableEditReservationActionDef).action(
            ReservationDialogComponent,
            this.dialog,
            { dialogData: reservation, authorizations: this.reservationsAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
      case ReservationButtonAction.CANCEL_RESERVATION:
        if (actionDef.action) {
          (actionDef as TableCancelReservationActionDef).action(
            reservation,
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
      case ReservationButtonAction.DELETE_RESERVATION:
        if (actionDef.action) {
          (actionDef as TableDeleteReservationActionDef).action(
            reservation,
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
      default:
        break;
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    this.issuerFilter = new IssuerFilter().getFilterDef();
    this.siteFilter = new SiteTableFilter([this.issuerFilter]).getFilterDef();
    this.siteAreaFilter = new SiteAreaTableFilter([
      this.issuerFilter,
      this.siteFilter,
    ]).getFilterDef();
    // this.companyFilter = new CompanyTableFilter([this.issuerFilter]).getFilterDef();
    this.dateRangeFilter = new DateRangeTableFilter({
      translateService: this.translateService,
    }).getFilterDef();
    this.userFilter = new UserTableFilter([this.issuerFilter]).getFilterDef();
    const filters: TableFilterDef[] = [
      this.siteFilter,
      this.siteAreaFilter,
      // this.companyFilter,
      this.dateRangeFilter,
      this.userFilter,
    ];
    return filters;
  }

  public buildTableDynamicRowActions(reservation: Reservation): TableActionDef[] {
    const tableActionDef: TableActionDef[] = [];
    if (reservation.canUpdate && this.isActiveReservation(reservation)) {
      tableActionDef.push(this.editAction);
      tableActionDef.push(this.cancelAction);
    } else {
      tableActionDef.push(this.viewAction);
    }
    if (reservation.canDelete) {
      tableActionDef.push(this.deleteAction);
    }
    return tableActionDef;
  }

  private isActiveReservation(reservation: Reservation): boolean {
    return ![
      ReservationStatus.DONE,
      ReservationStatus.UNMET,
      ReservationStatus.EXPIRED,
      ReservationStatus.CANCELLED,
    ].includes(reservation.status);
  }
}
