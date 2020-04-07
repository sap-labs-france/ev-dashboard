import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Car } from 'app/types/Car';
import { Utils } from 'app/utils/Utils';
import { CarConverterTableDataSource } from './car-converter-table-data-source';

@Component({
  templateUrl: './car.component.html',
  providers: [
    CarConverterTableDataSource,
  ],
})
export class CarComponent implements OnInit {
  public car!: Car;
  public isSuperAdmin: boolean;

  constructor(
    public carConverterTableDataSource: CarConverterTableDataSource,
    private centralServerService: CentralServerService,
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    public dialogRef: MatDialogRef<CarComponent>,
    private router: Router,
    private authorizationService: AuthorizationService,
    @Inject(MAT_DIALOG_DATA) data: Car) {
    this.isSuperAdmin = this.authorizationService.isSuperAdmin();
    if (data) {
      this.car = data;
    }
  }

  ngOnInit(): void {
    // Load
    this.loadCar();
  }

  public closeDialog() {
    this.dialogRef.close();
  }

  public onClose() {
    this.closeDialog();
  }

  loadCar() {
    if (this.car.id) {
      this.spinnerService.show();
      this.centralServerService.getCar(this.car.id).subscribe((car: Car) => {
        this.spinnerService.hide();
        this.car = Object.assign(this.car, car);
        this.carConverterTableDataSource.setCar(this.car);
      }, (error) => {
        // Show error
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.car_error');
      });
    }
  }
}
