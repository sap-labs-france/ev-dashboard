import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { CarCatalogsDialogComponent } from 'app/shared/dialogs/car-catalogs/car-catalogs-dialog.component';
import { Car, CarCatalog, CarImage, CarType } from 'app/types/Car';
import { ActionResponse, ActionsResponse } from 'app/types/DataResult';
import { KeyValue, RestResponse } from 'app/types/GlobalType';
import { HTTPError } from 'app/types/HTTPError';
import { ButtonType } from 'app/types/Table';
import { Cars } from 'app/utils/Cars';
import { Utils } from 'app/utils/Utils';

import { UsersCarTableDataSource } from './users-car-table-data-source';

@Component({
  selector: 'app-car',
  templateUrl: 'car.component.html',
  providers: [
    UsersCarTableDataSource,
  ],
})
export class CarComponent implements OnInit {
  @Input() public currentCarID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;

  public isBasic: boolean;
  public currentCarCatalog: CarCatalog;
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
  public isPool = false;

  constructor(
    public usersCarTableDataSource: UsersCarTableDataSource,
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
    if (this.isAdmin) {
      this.carTypes.push({ key: CarType.POOL_CAR, value: 'cars.pool_car' });
    }
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
    this.type.valueChanges.subscribe(value => {
    this.isPool = value === CarType.POOL_CAR;
   })
    if (!this.isBasic) {
      // this.isPrivate.disable();
      this.isDefault.disable();
    }
    if (this.currentCarID) {
      this.usersCarTableDataSource.setCarID(this.currentCarID);
      this.loadCar();
    }
  }

  public onClose() {
    this.closeDialog();
  }

  public loadCar() {
    if (!this.currentCarID) {
      return;
    }
    this.spinnerService.show();
    this.centralServerService.getCar(this.currentCarID).subscribe((car: Car) => {
      // Init form
      if (car.id) {
        this.formGroup.controls.id.setValue(car.id);
      }
      if (car.vin) {
        this.formGroup.controls.vin.setValue(car.vin);
      }
      if (car.licensePlate) {
        this.formGroup.controls.licensePlate.setValue(car.licensePlate);
      }
      if (car.carCatalog) {
        this.selectedCarCatalog = car.carCatalog;
        this.formGroup.controls.carCatalog.setValue(car.carCatalog.vehicleMake + ' ' + car.carCatalog.vehicleModel);
      }
      if (car.carCatalogID) {
        this.formGroup.controls.carCatalogID.setValue(car.carCatalogID);
      }
      if (car.type) {
        this.formGroup.controls.type.setValue(car.type);
      }
      this.spinnerService.hide();
      this.formGroup.updateValueAndValidity();
      this.formGroup.markAsPristine();
      this.formGroup.markAllAsTouched();
      // Yes, get image
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('cars.car_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.formGroup, this.dialogService,
      this.translateService, this.saveCar.bind(this), this.closeDialog.bind(this));
  }

  public saveCar(car: Car) {
    if (this.currentCarID) {
      this.updateCar(car);
    } else {
      this.createCar(car);
    }
  }

  private updateCar(car: Car) {
    this.spinnerService.show();
    this.centralServerService.updateCar(car).subscribe((response: ActionResponse) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('cars.update_success');
        if (this.isAdmin && (this.usersCarTableDataSource.getUsers() && this.usersCarTableDataSource.getUsers().length > 0)) {
          this.centralServerService.updateUsersCar(
            this.usersCarTableDataSource.getUsers(), car.id).subscribe((response: ActionsResponse) => {
              if (response.inError) {
                this.messageService.showErrorMessage(
                  this.translateService.instant('cars.update_users_car_partial',
                    {
                      assigned: response.inSuccess,
                      inError: response.inError,
                    },
                  ));
              } else {
                this.messageService.showSuccessMessage(
                  this.translateService.instant('cars.update_users_car_success',
                    { assigned: response.inSuccess },
                  ));
              }
              this.dialogRef.close();
            }, (error) => {
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'cars.update_users_car_error');
            });
        }

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
        case HTTPError.CAR_ALREADY_EXIST_ERROR:
          this.messageService.showErrorMessage('cars.car_exist');
          break;
        // No longer exists!
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'cars.update_error');
      }
    });
  }

  private createCar(car: Car) {
    this.spinnerService.show();
    this.centralServerService.createCar(car).subscribe((response: ActionResponse) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('cars.create_success', { carName: Utils.buildCarName(this.selectedCarCatalog) });

        if (this.isAdmin && (this.usersCarTableDataSource.getUsers() && this.usersCarTableDataSource.getUsers().length > 0)
          && car.type !== CarType.POOL_CAR) {
          this.centralServerService.assignUsersCar(
            this.usersCarTableDataSource.getUsers(), response.id).subscribe((response: ActionsResponse) => {
              if (response.inError) {
                this.messageService.showErrorMessage(
                  this.translateService.instant('cars.assign_users_car_partial',
                    {
                      assigned: response.inSuccess,
                      inError: response.inError,
                    },
                  ));
              } else {
                this.messageService.showSuccessMessage(
                  this.translateService.instant('cars.assign_users_car_success',
                    { assigned: response.inSuccess },
                  ));
              }
              this.dialogRef.close();
            }, (error) => {
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'cars.assign_users_car_error');
            });
        }

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
