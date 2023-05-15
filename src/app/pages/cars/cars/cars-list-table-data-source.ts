import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { TableMoreAction } from 'shared/table/actions/table-more-action';
import { CarsAuthorizations } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import {
  TableCreateCarAction,
  TableCreateCarActionDef,
} from '../../../shared/table/actions/cars/table-create-car-action';
import {
  TableDeleteCarAction,
  TableDeleteCarActionDef,
} from '../../../shared/table/actions/cars/table-delete-car-action';
import {
  TableEditCarAction,
  TableEditCarActionDef,
} from '../../../shared/table/actions/cars/table-edit-car-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { CarMakerTableFilter } from '../../../shared/table/filters/car-maker-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { Car, CarButtonAction, CarConverter, CarType } from '../../../types/Car';
import { DataResult } from '../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { CarDialogComponent } from '../car/car-dialog.component';
import { CarImageFormatterCellComponent } from '../cell-components/car-image-formatter-cell.component';

@Injectable()
export class CarsListTableDataSource extends TableDataSource<Car> {
  private createAction = new TableCreateCarAction().getActionDef();
  private editAction = new TableEditCarAction().getActionDef();
  private deleteAction = new TableDeleteCarAction().getActionDef();
  private usersFilter: TableFilterDef;
  private carMakerFilter: TableFilterDef;
  private carsAuthorizations: CarsAuthorizations;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService,
    private dialog: MatDialog,
    private datePipe: AppDatePipe,
    private dialogService: DialogService,
    private appUnitPipe: AppUnitPipe
  ) {
    super(spinnerService, translateService);
    // With users (shouldn't be that many users per car)
    this.setStaticFilters([
      {
        WithUser: true,
      },
    ]);
    // Init
    this.initDataSource();
  }

  public getPageSize(): number {
    return 50;
  }

  public loadDataImpl(): Observable<DataResult<Car>> {
    return new Observable((observer) => {
      // Get cars
      this.centralServerService
        .getCars(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (cars) => {
            // Initialize cars authorization
            this.carsAuthorizations = {
              // Authorization actions
              canCreate: Utils.convertToBoolean(cars.canCreate),
              canListUsers: Utils.convertToBoolean(cars.canListUsers),
              canListCarCatalog: Utils.convertToBoolean(cars.canListCarCatalog),
              // metadata
              metadata: cars.metadata,
            };
            // Update filters visibility
            this.createAction.visible = this.carsAuthorizations.canCreate;
            this.usersFilter.visible = this.carsAuthorizations.canListUsers;
            this.carMakerFilter.visible = this.carsAuthorizations.canListCarCatalog;
            observer.next(cars);
            observer.complete();
          },
          error: (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.cars_error'
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

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [this.createAction, ...tableActionsDef];
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'carCatalog.image',
        name: 'cars.image',
        headerClass: 'text-center col-8p',
        class: 'col-8p p-0',
        isAngularComponent: true,
        angularComponent: CarImageFormatterCellComponent,
      },
      {
        id: 'carCatalog.id',
        name: 'general.id',
        headerClass: 'col-20p',
        class: 'col-20p',
      },
      {
        id: 'carCatalog.vehicleMake',
        name: 'cars.vehicle_make',
        headerClass: 'col-10p',
        class: 'text-left col-15p',
        sortable: true,
      },
      {
        id: 'carCatalog.vehicleModel',
        name: 'cars.vehicle_model',
        headerClass: 'col-10p',
        class: 'text-left col-15p',
        sortable: true,
        formatter: (modelVersion: string) => (modelVersion ? modelVersion : '-'),
      },
      {
        id: 'carCatalog.vehicleModelVersion',
        name: 'cars.vehicle_model_version',
        headerClass: 'col-10p',
        class: 'text-left col-15p',
        sortable: true,
        formatter: (vehicleModelVersion: string) =>
          vehicleModelVersion ? vehicleModelVersion : '-',
      },
      {
        id: 'user.name',
        name: 'cars.users',
        headerClass: 'col-20p',
        class: 'col-20p',
        formatter: (name: string, car: Car) => Utils.buildUserFullName(car.user),
      },
      {
        id: 'licensePlate',
        name: 'cars.license_plate',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        sortable: true,
      },
      {
        id: 'vin',
        name: 'cars.vin',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        sortable: true,
      },
      {
        id: 'default',
        name: 'cars.default_car',
        headerClass: 'text-center col-10p',
        class: 'text-center col-10p',
        formatter: (defaultCar: boolean) => Utils.displayYesNo(this.translateService, defaultCar),
      },
      {
        id: 'converter',
        name: 'cars.charge_standard_tables',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        sortable: true,
        formatter: (converter: CarConverter) =>
          Utils.buildCarCatalogConverterName(converter, this.translateService),
      },
      {
        id: 'carCatalog.fastChargePowerMax',
        name: 'cars.fast_charge_power_max',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (fastChargePowerMax: number) =>
          fastChargePowerMax
            ? this.appUnitPipe.transform(fastChargePowerMax, 'kW', 'kW', true, 1, 0, 0)
            : '-',
      },
      {
        id: 'type',
        name: 'cars.type',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        formatter: (carType: CarType) => Utils.getCarType(carType, this.translateService),
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

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case CarButtonAction.CREATE_CAR:
        if (actionDef.action) {
          (actionDef as TableCreateCarActionDef).action(
            CarDialogComponent,
            this.dialog,
            { authorizations: this.carsAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    this.usersFilter = new UserTableFilter().getFilterDef();
    this.carMakerFilter = new CarMakerTableFilter().getFilterDef();
    // Create and return filter
    const filters: TableFilterDef[] = [this.usersFilter, this.carMakerFilter];
    return filters;
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableDynamicRowActions(car: Car): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    const moreActions = new TableMoreAction([]);
    if (car.canUpdate) {
      rowActions.push(this.editAction);
    }
    if (car.canDelete) {
      moreActions.addActionInMoreActions(this.deleteAction);
    }
    if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
      rowActions.push(moreActions.getActionDef());
    }
    return rowActions;
  }

  public rowActionTriggered(actionDef: TableActionDef, car: Car) {
    switch (actionDef.id) {
      case CarButtonAction.EDIT_CAR:
        if (actionDef.action) {
          (actionDef as TableEditCarActionDef).action(
            CarDialogComponent,
            this.dialog,
            { dialogData: car, authorizations: this.carsAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
      case CarButtonAction.DELETE_CAR:
        if (actionDef.action) {
          (actionDef as TableDeleteCarActionDef).action(
            car,
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
    }
  }
}
