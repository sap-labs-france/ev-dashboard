import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { ConfigService } from 'app/services/config.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { AppDecimalPipe } from 'app/shared/formatters/app-decimal-pipe';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Car, CarImage } from 'app/types/Car';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { CarComponent } from '../car/car.component';
import { CarImageFormatterCellComponent } from '../cell-components/car-image-formatter-cell.component';

@Injectable()
export class CarsListTableDataSource extends TableDataSource<Car> {
  private openAction = new TableViewAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private appUnitPipe: AppUnitPipe,
    private router: Router,
    private centralServerService: CentralServerService,
    private config: ConfigService,
    private dialog: MatDialog,
    private decimalPipe: AppDecimalPipe,
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Car>> {
    return new Observable((observer) => {
      // Get cars
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
    return `<a href="${this.config.getCar().url}" target="_blank">${this.config.getCar().url}</a>`;
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
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'vehicleModel',
        name: 'cars.vehicleModel',
        class: 'text-left',
        sortable: true,
      },
      {
        id: 'vehicleModelVersion',
        name: 'cars.vehicleModelVersion',
        class: 'text-left',
        sortable: true,
        formatter: (modelVersion: string) => modelVersion ? modelVersion : '-',
      },
      {
        id: 'drivetrainPowerHP',
        name: 'cars.drivetrainPowerHP',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (drivetrainPowerHP: number) => drivetrainPowerHP ?
          `${this.decimalPipe.transform(drivetrainPowerHP)} ${this.translateService.instant('cars.unit.drivetrainPowerHPUnit')}` : '-',
      },
      {
        id: 'batteryCapacityFull',
        name: 'cars.batteryCapacityFull',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: true,
        formatter: (capacity: number) => capacity ? this.appUnitPipe.transform(capacity, 'kWh', 'kWh', true, 1, 0) : '-',
      },
      {
        id: 'chargeStandardPower',
        name: 'cars.chargeStandardPower',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (chargeStandardPower: number) =>
          chargeStandardPower ? this.appUnitPipe.transform(chargeStandardPower, 'kWh', 'kWh', true, 1, 0) : '-',
      },
      {
        id: 'chargeStandardPhase',
        name: 'cars.evsePhaseAC',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: true,
        formatter: (chargeStandardPhase: number) => chargeStandardPhase ? this.decimalPipe.transform(chargeStandardPhase) : '-',
      },
      {
        id: 'chargePlug',
        name: 'cars.chargePlug',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: true,
        formatter: (chargePlug: string) => chargePlug ? chargePlug : '-',
      },
      {
        id: 'fastChargePowerMax',
        name: 'cars.fastChargePowerMax',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (fastChargePowerMax: number) => fastChargePowerMax ?
          this.appUnitPipe.transform(fastChargePowerMax, 'kWh', 'kWh', true, 1, 0) : '-',
      },
      {
        id: 'fastChargePlug',
        name: 'cars.fastChargePlug',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: true,
        formatter: (fastChargePlug: string) => fastChargePlug ? fastChargePlug : '-',
      },
      {
        id: 'performanceTopspeed',
        name: 'cars.performanceTopspeed',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (topSpeed: number) => topSpeed ?
          this.decimalPipe.transform(topSpeed) + ' ' + this.translateService.instant('cars.unit.kilometer') : '-',
      },
      {
        id: 'performanceAcceleration',
        name: 'cars.performanceAcceleration',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (acceleration: number) => acceleration ?
          this.decimalPipe.transform(acceleration) + ' ' + this.translateService.instant('cars.unit.secondes') : '-',
      },
      {
        id: 'rangeWLTP',
        name: 'cars.rangeWLTP',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (rangeWLTP: number) => rangeWLTP ? this.decimalPipe.transform(rangeWLTP) + ' ' + 
          this.translateService.instant('cars.unit.kilometer') : '-',
      },
      {
        id: 'rangeReal',
        name: 'cars.rangeReal',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (rangeReal: number) => rangeReal ? this.decimalPipe.transform(rangeReal) + ' ' +
          this.translateService.instant('cars.unit.kilometer') : '-',
      },
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

  public buildTableRowActions(): TableActionDef[] {
    return [this.openAction];
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
