import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Car, CarCatalog, CarImage, CarType } from 'app/types/Car';
import { Component, Input, OnInit } from '@angular/core';
import { KeyValue, RestResponse } from 'app/types/GlobalType';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import { ActionResponse } from 'app/types/DataResult';
import { AuthorizationService } from 'app/services/authorization.service';
import { ButtonType } from 'app/types/Table';
import { CarCatalogsDialogComponent } from 'app/shared/dialogs/car-catalogs/car-catalogs-dialog.component';
import { Cars } from 'app/utils/Cars';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { HTTPError } from 'app/types/HTTPError';
import { MessageService } from 'app/services/message.service';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

@Component({
  selector: 'app-car',
  templateUrl: 'car.component.html'
})
export class CarComponent implements OnInit {
  @Input() public currentCarID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;

  public isBasic: boolean;
  public isAdmin: boolean;
  public formGroup!: FormGroup;
  public selectedCarCatalog: CarCatalog;
  public id!: AbstractControl;
  public vin!: AbstractControl;
  public licensePlate!: AbstractControl;
  public isCompanyCar!: AbstractControl;
  public carCatalogID!: AbstractControl;
  public carCatalog!: AbstractControl;
  public isDefault!: AbstractControl;
  public type!: AbstractControl;
  public users!: AbstractControl;
  public userIDs!: AbstractControl;
  public noImage = CarImage.NO_IMAGE;
  public carTypes: KeyValue[] = [
    { key: CarType.COMPANY, value: 'cars.company_car' },
    { key: CarType.PRIVATE, value: 'cars.private_car' }
  ];

  constructor(
    private centralServerService: CentralServerService,
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private authorizationService: AuthorizationService) {
    this.isBasic = this.authorizationService.isBasic();
    this.isAdmin = this.authorizationService.isAdmin();
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      vin: new FormControl('',
        Validators.compose([
          Validators.required,
          Cars.validateVIN
        ])),
      licensePlate: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      carCatalogID: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      carCatalog: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      isDefault: new FormControl(false,
        Validators.compose([
        ])),
      type: new FormControl(CarType.COMPANY,
        Validators.compose([
          Validators.required,
        ]))
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.vin = this.formGroup.controls['vin'];
    this.licensePlate = this.formGroup.controls['licensePlate'];
    this.carCatalogID = this.formGroup.controls['carCatalogID'];
    this.carCatalog = this.formGroup.controls['carCatalog'];
    this.isDefault = this.formGroup.controls['isDefault'];
    this.type = this.formGroup.controls['type'];
  }

  public closeDialog(saved: boolean = false) {
    this.dialogRef.close(saved);
  }

  public onClose() {
    this.closeDialog();
  }

  public saveCar(car: Car) {
    this.createCar(car);
  }

  private createCar(car: Car) {
    this.spinnerService.show();
    this.centralServerService.createCar(car).subscribe((response: ActionResponse) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.dialogRef.close();
        this.messageService.showSuccessMessage('cars.create_success', { carName: Utils.buildCarName(this.selectedCarCatalog) });
        car.id = response.id!;
        // Init form
        this.formGroup.markAsPristine();
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'cars.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Email already exists
        case HTTPError.CAR_ALREADY_EXIST_ERROR_DIFFERENT_USER:
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('settings.car.assign_user_to_car_dialog_title'),
            this.translateService.instant('settings.car.assign_user_to_car_dialog_confirm'),
          ).subscribe((response) => {
            if (response === ButtonType.YES) {
              car.forced = true;
              this.createCar(car);
            }
          });
          break;
        // Car already created by this user
        case HTTPError.CAR_ALREADY_EXIST_ERROR:
          this.messageService.showErrorMessage('cars.car_exist');
          break;
        // User already assigned
        case HTTPError.USER_ALREADY_ASSIGNED_TO_CAR:
          this.messageService.showErrorMessage('cars.user_already_assigned');
          break;
        // No longer exists!
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'cars.create_error');
      }
    });
  }

  public addCar() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'cars.assign_car_catalog',
      validateButtonTitle: 'general.select',
      rowMultipleSelection: false,
    };
    // Open
    this.dialog.open(CarCatalogsDialogComponent, dialogConfig).afterClosed().subscribe((result) => {
      if (result && result.length > 0 && result[0] && result[0].objectRef) {
        const carCatalog: CarCatalog = (result[0].objectRef) as CarCatalog;
        this.carCatalogID.setValue(result[0].key);
        this.carCatalog.setValue(Utils.buildCarName(carCatalog));
        this.selectedCarCatalog = carCatalog;
        this.formGroup.markAsDirty();
      }
    });
  }
}
