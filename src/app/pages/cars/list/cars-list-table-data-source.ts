import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Car, CarImage } from 'app/types/Car';
import { DataResult } from 'app/types/DataResult';
import { CarImageFormatterCellComponent } from '../cell-components/car-image-formatter-cell.component';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { ButtonAction } from 'app/types/GlobalType';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { ConfigService } from 'app/services/config.service';
import { CarComponent } from '../car/car.component';

@Injectable()
export class CarsListTableDataSource extends TableDataSource<Car> {
  private openAction = new TableViewAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService,
    private config: ConfigService,
    private dialog: MatDialog,
  ) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Car>> {
    return new Observable((observer) => {
      // get cars
      this.centralServerService.getCars(this.buildFilterValues(), this.getPaging(), this.getSorting()).subscribe((cars) => {
        // lookup for image otherwise assign default
        for (const car of cars.result) {
          if (!car.images || car.images.length < 1) {
            car.image = CarImage.NO_IMAGE;
          } else {
            car.image = car.images[0];
          }
        }
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

  public buildTableFooterStats(): string {
    return 'Source : ' + this.config.getCar().url;
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'image',
        name: 'cars.image',
        headerClass: 'text-center col-8p',
        class: 'col-8p',
        isAngularComponent: true,
        angularComponent: CarImageFormatterCellComponent,
      },
      {
        id: 'vehicleMake',
        name: 'cars.vehicleMake',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'vehicleModel',
        name: 'cars.vehicleModel',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'batteryCapacityFull',
        name: 'cars.batteryCapacityFull',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (capacity) => capacity + ' kWh',
      },
      {
        id: 'chargeStandardChargeSpeed',
        name: 'cars.chargeStandardChargeSpeed',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (chargeSpeed) => chargeSpeed + ' km/h',
      },
      {
        id: 'performanceTopspeed',
        name: 'cars.performanceTopspeed',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (topSpeed) => topSpeed + ' km/h',
      },
      {
        id: 'performanceAcceleration',
        name: 'cars.performanceAcceleration',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (acceleration) => acceleration + ' sec',
      },
      {
        id: 'rangeReal',
        name: 'cars.rangeReal',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (range) => range + ' km',
      }
    ];
    return tableColumnDef;
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: Car) {
    switch (actionDef.id) {
      case ButtonAction.VIEW:
        this.showCarDialog(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  buildTableRowActions(): TableActionDef[] {
    const rowActions = [this.openAction];
    return rowActions;
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private showCarDialog(car?: Car) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (car) {
      dialogConfig.data = car.id;
    }
    // disable outside click close
    dialogConfig.disableClose = false;
    // Open
    this.dialog.open(CarComponent, dialogConfig);
  }
}
