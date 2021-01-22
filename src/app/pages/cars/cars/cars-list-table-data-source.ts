import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { TableCreateCarAction, TableCreateCarActionDef } from '../../../shared/table/actions/cars/table-create-car-action';
import { TableDeleteCarAction, TableDeleteCarActionDef } from '../../../shared/table/actions/cars/table-delete-car-action';
import { TableEditCarAction, TableEditCarActionDef } from '../../../shared/table/actions/cars/table-edit-car-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { CarMakerTableFilter } from '../../../shared/table/filters/car-maker-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { Car, CarButtonAction, CarConverter, CarType } from '../../../types/Car';
import ChangeNotification from '../../../types/ChangeNotification';
import { DataResult } from '../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { User, UserCar } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { CarDialogComponent } from '../car/car.dialog.component';
import { CarCatalogImageFormatterCellComponent } from '../cell-components/car-catalog-image-formatter-cell.component';

@Injectable()
export class CarsListTableDataSource extends TableDataSource<Car> {
  public isSuperAdmin: boolean;
  public isBasic: boolean;
  private createAction = new TableCreateCarAction().getActionDef();
  private editAction = new TableEditCarAction().getActionDef();
  private deleteAction = new TableDeleteCarAction().getActionDef();
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private dialog: MatDialog,
    private datePipe: AppDatePipe,
    private authorizationService: AuthorizationService,
    private dialogService: DialogService,
    private appUnitPipe: AppUnitPipe,
  ) {
    super(spinnerService, translateService);
    this.isSuperAdmin = this.authorizationService.isSuperAdmin();
    this.isBasic = this.authorizationService.isBasic();
    // With users (shouldn't be that many users per car)
    this.setStaticFilters([{ WithUsers: true }]);
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectCars();
  }

  public getPageSize(): number {
    return 50;
  }

  public loadDataImpl(): Observable<DataResult<Car>> {
    return new Observable((observer) => {
      // Get cars
      this.centralServerService.getCars(this.buildFilterValues(), this.getPaging(), this.getSorting()).subscribe((cars) => {
        observer.next(cars);
        observer.complete();
      }, (error) => {
        // Show error
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.cars_error');
        // Error
        observer.error(error);
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
    return [
      this.createAction,
      ...tableActionsDef
    ];
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'carCatalog.image',
        name: 'cars.image',
        headerClass: 'text-center col-8p',
        class: 'col-8p p-0',
        isAngularComponent: true,
        angularComponent: CarCatalogImageFormatterCellComponent,
      },
    ];
    if (this.authorizationService.canUpdateCar()) {
      tableColumnDef.push(
        {
          id: 'carCatalog.id',
          name: 'general.id',
          headerClass: 'col-20p',
          class: 'col-20p',
        },
      );
    }
    tableColumnDef.push(
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
        formatter: (modelVersion: string) => modelVersion ? modelVersion : '-',
      },
      {
        id: 'carCatalog.vehicleModelVersion',
        name: 'cars.vehicle_model_version',
        headerClass: 'col-10p',
        class: 'text-left col-15p',
        sortable: true,
        formatter: (vehicleModelVersion: string) => vehicleModelVersion ? vehicleModelVersion : '-',
      },
    );
    if (this.authorizationService.isAdmin()) {
      tableColumnDef.push(
        {
          id: 'carUsers',
          name: 'cars.users',
          headerClass: 'col-20p',
          class: 'col-20p',
          formatter: (carUsers: UserCar[]) => Utils.buildCarUsersFullName(carUsers),
        },
      );
    }
    if (this.authorizationService.canUpdateCar()) {
      tableColumnDef.push(
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
          formatter: (defaultCar: boolean, car: Car) => {
            return car.carUsers.find((userCar) => userCar.default) ?
              this.translateService.instant('general.yes') : this.translateService.instant('general.no');
          },
        },
        {
          id: 'owner',
          name: 'cars.car_owner',
          headerClass: 'text-center col-10p',
          class: 'text-center col-10p',
          formatter: (carOwner: boolean, car: Car) => {
            return car.carUsers.find((userCar) => userCar.owner) ?
              this.translateService.instant('general.yes') : this.translateService.instant('general.no');
          }
        }
      );
    }
    tableColumnDef.push(
      {
        id: 'converter',
        name: 'cars.converter',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        sortable: true,
        formatter: (converter: CarConverter) => Utils.buildCarCatalogConverterName(converter, this.translateService),
      },
      {
        id: 'type',
        name: 'cars.type',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        formatter: (carType: CarType) => Utils.getCarType(carType, this.translateService),
      },
    );
    if (this.authorizationService.isAdmin()) {
      tableColumnDef.push(
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
        }
      );
    }
    return tableColumnDef;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case CarButtonAction.CREATE_CAR:
        if (actionDef.action) {
          (actionDef as TableCreateCarActionDef).action(CarDialogComponent, this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    if (this.authorizationService.isAdmin()) {
      return [
        new UserTableFilter().getFilterDef(),
        new CarMakerTableFilter().getFilterDef(),

      ];
    }
    return [];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [
      this.editAction,
      this.deleteAction,
    ];
  }

  public rowActionTriggered(actionDef: TableActionDef, car: Car) {
    switch (actionDef.id) {
      case CarButtonAction.EDIT_CAR:
        if (actionDef.action) {
          (actionDef as TableEditCarActionDef).action(CarDialogComponent, car, this.dialog, this.refreshData.bind(this));
        }
        break;
      case CarButtonAction.DELETE_CAR:
        if (actionDef.action) {
          (actionDef as TableDeleteCarActionDef).action(car, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
    }
  }
}
