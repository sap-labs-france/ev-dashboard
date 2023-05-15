import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { ComponentService } from 'services/component.service';
import { WindowService } from 'services/window.service';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';
import { CarsAuthorizations, DialogMode } from 'types/Authorization';
import { TenantComponents } from 'types/Tenant';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Car } from '../../../types/Car';
import { ActionResponse } from '../../../types/DataResult';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { Utils } from '../../../utils/Utils';
import { CarConnectorComponent } from './connector/car-connector.component';
import { CarMainComponent } from './main/car-main.component';

@Component({
  selector: 'app-car',
  templateUrl: 'car.component.html',
  styleUrls: ['car.component.scss'],
})
export class CarComponent extends AbstractTabComponent implements OnInit {
  @Input() public currentCarID!: string;
  @Input() public dialogMode!: DialogMode;
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public carsAuthorizations!: CarsAuthorizations;

  @ViewChild('carMainComponent') public carMainComponent!: CarMainComponent;
  @ViewChild('carConnectorComponent') public carConnectorComponent!: CarConnectorComponent;

  public formGroup!: UntypedFormGroup;
  public isCarConnectorComponentActive: boolean;
  public canListUsers: boolean;
  public readOnly = true;
  public car: Car;

  public constructor(
    public spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private componentService: ComponentService,
    protected activatedRoute: ActivatedRoute,
    protected windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['main', 'connector'], false);
    this.isCarConnectorComponentActive = this.componentService.isActive(
      TenantComponents.CAR_CONNECTOR
    );
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new UntypedFormGroup({});
    // Handle Dialog mode
    this.readOnly = this.dialogMode === DialogMode.VIEW;
    this.canListUsers = Utils.convertToBoolean(this.carsAuthorizations.canListUsers);
    Utils.handleDialogMode(this.dialogMode, this.formGroup);
    // Load Car
    this.loadCar();
  }

  public onClose() {
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.saveCar.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public loadCar() {
    if (this.currentCarID) {
      this.spinnerService.show();
      this.centralServerService.getCar(this.currentCarID).subscribe({
        next: (car: Car) => {
          this.spinnerService.hide();
          this.car = car;
          if (this.readOnly) {
            // Async call for letting the sub form groups to init
            setTimeout(() => this.formGroup.disable(), 0);
          }
          // Update form group
          this.formGroup.updateValueAndValidity();
          this.formGroup.markAsPristine();
          this.formGroup.markAllAsTouched();
        },
        error: (error) => {
          this.spinnerService.hide();
          switch (error.status) {
            case StatusCodes.NOT_FOUND:
              this.messageService.showErrorMessage('cars.car_not_found');
              break;
            default:
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'cars.car_error'
              );
          }
        },
      });
    }
  }

  public closeDialog(saved: boolean = false) {
    if (this.dialogRef) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.saveCar.bind(this),
      this.closeDialog.bind(this)
    );
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
    this.centralServerService.updateCar(car).subscribe({
      next: (response: ActionResponse) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('cars.update_success', {
            carName: this.formGroup.controls['carCatalog'].value,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'cars.update_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        // Check status
        switch (error.status) {
          case HTTPError.USER_NOT_OWNER_OF_THE_CAR:
            this.messageService.showErrorMessage('cars.user_not_owner');
            break;
          case HTTPError.NO_CAR_FOR_USER:
            this.messageService.showErrorMessage('cars.car_not_found');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'cars.update_error'
            );
        }
      },
    });
  }

  private createCar(car: Car, forced = false) {
    // Set logged user
    if (!this.canListUsers) {
      car.userID = this.centralServerService.getLoggedUser().id;
    }
    this.spinnerService.show();
    this.centralServerService.createCar(car, forced).subscribe({
      next: (response: ActionResponse) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('cars.create_success', {
            carName: this.formGroup.controls['carCatalog'].value,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'cars.create_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        // Check status
        switch (error.status) {
          // Car already created by this user
          case HTTPError.CAR_ALREADY_EXIST_ERROR:
            this.messageService.showErrorMessage('cars.car_exist');
            break;
          // User already assigned
          case HTTPError.USER_ALREADY_ASSIGNED_TO_CAR:
            this.messageService.showErrorMessage('cars.user_already_assigned');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'cars.create_error'
            );
        }
      },
    });
  }
}
