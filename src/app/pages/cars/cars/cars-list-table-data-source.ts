import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Car } from 'app/types/Car';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { CarDialogComponent } from '../car/car.dialog.component';


@Injectable()
export class CarsListTableDataSource extends TableDataSource<Car> {
  public isSuperAdmin: boolean;
  private editAction = new TableEditAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();
  private createAction = new TableCreateAction().getActionDef();
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService,
    private dialog: MatDialog,
    private authorizationService: AuthorizationService,
  ) {
    super(spinnerService, translateService);
    this.isSuperAdmin = this.authorizationService.isSuperAdmin();
    // Init
    this.initDataSource();
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
        id: 'vin',
        name: 'cars.vin',
        headerClass: 'text-center col-8p',
        class: 'col-8p',
      },
      {
        id: 'licensePlate',
        name: 'cars.license_plate',
        headerClass: 'col-20p',
        class: 'col-20p',
        sorted: true,
        direction: 'asc',
      },
      {
        id: 'carCatalog.vehicleMake',
        name: 'cars.vehicle_make',
        class: 'text-left',
        sortable: true,
      },
      {
        id: 'carCatalog.vehicleModel',
        name: 'cars.vehicle_model',
        class: 'text-left',
        sortable: true,
        formatter: (modelVersion: string) => modelVersion ? modelVersion : '-',
      }
    ];
    return tableColumnDef;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case ButtonAction.CREATE:
        this.createCar();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  private createCar() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    // disable outside click close
    dialogConfig.disableClose = false;
    // Open
    const dialogRef = this.dialog.open(CarDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableRowActions(): TableActionDef[] {

    return [this.editAction, this.deleteAction];
  }
}
