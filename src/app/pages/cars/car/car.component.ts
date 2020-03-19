import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Car } from 'app/types/Car';
import { Utils } from 'app/utils/Utils';

@Component({
  templateUrl: './car.component.html',
})
export class CarComponent implements OnInit {
  public car!: Car;
  public isSuperAdmin: boolean;
  private carID!: number;

  constructor(
      private centralServerService: CentralServerService,
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      public dialogRef: MatDialogRef<CarComponent>,
      private router: Router,
      private authorizationService: AuthorizationService,
      @Inject(MAT_DIALOG_DATA) data: number) {
    this.isSuperAdmin = this.authorizationService.isSuperAdmin();
    if (data) {
      this.carID = data;
    }
  }

  ngOnInit(): void {
    // Load
    this.loadData();
  }

  public closeDialog() {
    this.dialogRef.close();
  }

  public onClose() {
    this.closeDialog();
  }

  loadData() {
    if (this.carID) {
      this.spinnerService.show();
      this.centralServerService.getCar(this.carID).subscribe((car: Car) => {
        this.spinnerService.hide();
        this.car = car;
      }, (error) => {
        // Show error
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.car_error');
      });
    }
  }
}
