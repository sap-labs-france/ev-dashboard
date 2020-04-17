import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Car } from 'app/types/Car';
import { Utils } from 'app/utils/Utils';
import { CarConverterTableDataSource } from './car-converter-table-data-source';

@Component({
  selector: 'app-car',
  templateUrl: 'car.component.html',
  providers: [
    CarConverterTableDataSource,
  ],
})
export class CarComponent implements OnInit {
  @Input() currentCarID!: number;
  @Input() inDialog!: boolean;
  @Input() dialogRef!: MatDialogRef<any>;
  public car: Car;
  public isSuperAdmin: boolean;

  constructor(
      public carConverterTableDataSource: CarConverterTableDataSource,
      private centralServerService: CentralServerService,
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private router: Router,
      private authorizationService: AuthorizationService) {
    this.isSuperAdmin = this.authorizationService.isSuperAdmin();
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
    if (!this.currentCarID) {
      return;
    }
    this.spinnerService.show();
    this.centralServerService.getCar(this.currentCarID).subscribe((car: Car) => {
      this.spinnerService.hide();
      this.car = car;
      this.carConverterTableDataSource.setCar(this.car);
    }, (error) => {
      // Show error
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.car_error');
    });
  }
}
