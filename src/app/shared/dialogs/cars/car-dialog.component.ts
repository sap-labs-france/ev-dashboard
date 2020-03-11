import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Car } from 'app/types/Car';
import { CentralServerService } from 'app/services/central-server.service';
import { Utils } from 'app/utils/Utils';
import { SpinnerService } from 'app/services/spinner.service';
import { MessageService } from 'app/services/message.service';
import { Router } from '@angular/router';
import { AuthorizationService } from 'app/services/authorization.service';

@Component({
  templateUrl: './car-dialog.component.html',
})
export class CarDialogComponent {
  carID!: number;
  imageObject: Array<object> = new Array<object>();
  car!: Car;
  imageSize!: any;
  isSuperAdmin: boolean;
  constructor(
    private centralServerService: CentralServerService,
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    public dialogRef: MatDialogRef<CarDialogComponent>,
    private router: Router,
    private authorizationService: AuthorizationService,
    @Inject(MAT_DIALOG_DATA) data: number) {
    this.isSuperAdmin = this.authorizationService.isSuperAdmin();
    if (data) {
      this.carID = data;
      this.imageSize = { width: "100px", height: "200px", space: 3 }
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
    this.spinnerService.show();
    if (this.carID) {
      this.centralServerService.getCar(this.carID).subscribe((car) => {
        if (car) {
          this.car = car;
          car.images.forEach(element => {
            this.imageObject.push({
              image: element,
              thumbImage: element,
              alt: car.VehicleModel + ' - ' + car.vehicleMake,
            });
          });
        }
        this.spinnerService.hide();
      }, (error) => {
        // Show error
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
    }
  }
}
