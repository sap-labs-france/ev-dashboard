import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TableActionDef, TableColumnDef, TableDef } from 'app/types/Table';

import { AuthorizationService } from 'app/services/authorization.service';
import { ButtonAction } from 'app/types/GlobalType';
import { CentralServerService } from 'app/services/central-server.service';
import { DataResult } from 'app/types/DataResult';
import { Injectable } from '@angular/core';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TranslateService } from '@ngx-translate/core';
import { UserCar } from 'app/types/Car';
import { UserCarDialogComponent } from '../user-car/user-car.dialog.component';
import { Utils } from 'app/utils/Utils';

@Injectable()
export class UserCarsListTableDataSource extends TableDataSource<UserCar> {
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

  public loadDataImpl(): Observable<DataResult<UserCar>> {
    return new Observable((observer) => {
      // Get cars
      this.centralServerService.getUserCars(this.buildFilterValues(), this.getPaging(), this.getSorting()).subscribe((userCars) => {
        observer.next(userCars);
        observer.complete();
      }, (error) => {
        // Show error
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.user_cars_error');
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
        id: 'car.vin',
        name: 'cars.vin',
        headerClass: 'text-center col-8p',
        class: 'col-8p',
      },
      {
        id: 'car.licensePlate',
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
        this.createUserCar();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  private createUserCar() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    // disable outside click close
    dialogConfig.disableClose = false;
    // Open
    const dialogRef = this.dialog.open(UserCarDialogComponent, dialogConfig);
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
