import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { CarCatalog } from 'app/types/Car';
import { Utils } from 'app/utils/Utils';
import { CarCatalogConverterTableDataSource } from './car-catalog-converter-table-data-source';

@Component({
  selector: 'app-car-catalog',
  templateUrl: 'car-catalog.component.html',
  providers: [
    CarCatalogConverterTableDataSource,
  ],
})
export class CarCatalogComponent implements OnInit {
  @Input() public currentCarCatalogID!: number;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;
  public carCatalog: CarCatalog;
  public isSuperAdmin: boolean;

  constructor(
    public carCatalogConverterTableDataSource: CarCatalogConverterTableDataSource,
    private centralServerService: CentralServerService,
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    private authorizationService: AuthorizationService) {
    this.isSuperAdmin = this.authorizationService.isSuperAdmin();
  }

  public ngOnInit(): void {
    // Load
    this.loadCar();
  }

  public closeDialog() {
    this.dialogRef.close();
  }

  public onClose() {
    this.closeDialog();
  }

  public loadCar() {
    if (!this.currentCarCatalogID) {
      return;
    }
    this.spinnerService.show();
    this.centralServerService.getCarCatalog(this.currentCarCatalogID).subscribe((carCatalog: CarCatalog) => {
      this.spinnerService.hide();
      this.carCatalog = carCatalog;
      this.carCatalogConverterTableDataSource.setCar(this.carCatalog);
    }, (error) => {
      // Show error
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.car_error');
    });
  }
}
