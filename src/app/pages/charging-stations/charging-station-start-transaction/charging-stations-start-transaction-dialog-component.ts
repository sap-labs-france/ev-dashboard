import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { CarsDialogComponent } from '../../../shared/dialogs/cars/cars-dialog.component';
import { TagsDialogComponent } from '../../../shared/dialogs/tags/tags-dialog.component';
import { UsersDialogComponent } from '../../../shared/dialogs/users/users-dialog.component';
import { StartTransaction } from '../../../types/Transaction';
import { UserDefaultTagCar, UserToken } from '../../../types/User';
import { Utils } from '../../../utils/Utils';

@Component({
  templateUrl: './charging-stations-start-transaction-dialog-component.html',
})
export class ChargingStationsStartTransactionDialogComponent implements OnInit {
  public title = '';
  public chargeBoxID = '';
  public formGroup!: FormGroup;
  public user!: AbstractControl;
  public userID!: AbstractControl;
  public car!: AbstractControl;
  public carID!: AbstractControl;
  public tag!: AbstractControl;
  public tagID!: AbstractControl;

  public loggedUser: UserToken;
  public isAdmin = false;
  constructor(
    private dialog: MatDialog,
    private router: Router,
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private dialogRef: MatDialogRef<ChargingStationsStartTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Set
    this.title = data.title;
    this.chargeBoxID = data.chargeBoxID;
    this.loggedUser = centralServerService.getLoggedUser();
    this.isAdmin = this.authorizationService.isAdmin();
    Utils.registerCloseKeyEvents(this.dialogRef);
  }


  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      user: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      userID: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      car: new FormControl('',
        Validators.compose([

        ])),
      carID: new FormControl('',
        Validators.compose([
        ])),
      tag: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      tagID: new FormControl('',
        Validators.compose([
          Validators.required,
        ]))
    });
    // Form
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.car = this.formGroup.controls['car'];
    this.carID = this.formGroup.controls['carID'];
    this.tag = this.formGroup.controls['tag'];
    this.tagID = this.formGroup.controls['tagID'];
    this.user.setValue(Utils.buildUserFullName(this.loggedUser));
    this.userID.setValue(this.loggedUser.id);
    this.loadUserDefaultTagCar();
  }

  public resetCar() {
    this.car.reset();
    this.carID.reset();
  }

  public loadUserDefaultTagCar() {
    if (this.userID.value) {
      this.spinnerService.show();
      this.centralServerService.getUserDefaultTagCar(this.userID.value).subscribe((userDefaultTagCar: UserDefaultTagCar) => {
        this.spinnerService.hide();
        if (userDefaultTagCar) {
          if (userDefaultTagCar.tag) {
            this.tag.setValue(Utils.buildTagName(userDefaultTagCar.tag));
            this.tagID.setValue(userDefaultTagCar.tag.id);
          } else {
            this.tag.disable();
            this.messageService.showErrorMessage(
              this.translateService.instant('chargers.start_transaction_missing_active_tag', {
                chargeBoxID: this.chargeBoxID,
                userName: this.user.value,
              }));
          }
          if (userDefaultTagCar.car) {
            this.car.setValue(Utils.buildCarName(userDefaultTagCar.car, false));
            this.carID.setValue(userDefaultTagCar.car.id);
          } else {
            this.car.disable();
          }
        } else {
          this.car.disable();
          this.tag.disable();
          this.messageService.showErrorMessage(
            this.translateService.instant('chargers.start_transaction_missing_active_tag', {
              chargeBoxID: this.chargeBoxID,
              userName: this.user.value,
            }));
        }
        this.formGroup.updateValueAndValidity();
        this.formGroup.markAsPristine();
        this.formGroup.markAllAsTouched();
      }, (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService,
          this.centralServerService, 'general.error_backend');
      });
    }
  }

  public assignUser() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true
      },
    };
    // Show
    const dialogRef = this.dialog.open(UsersDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((result) => {
      this.user.setValue(Utils.buildUserFullName(result[0].objectRef));
      this.userID.setValue(result[0].key);
      this.tag.setValue('');
      this.tagID.setValue('');
      this.car.setValue('');
      this.carID.setValue('');
      this.loadUserDefaultTagCar();
    });
  }

  public assignTag() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {
        UserID: this.userID.value,
        Active: true,
        Issuer: true
      },
    };
    // Show
    const dialogRef = this.dialog.open(TagsDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((result) => {
      this.tag.setValue(result[0].key);
      this.tagID.setValue(result[0].key);
    });
  }

  public assignCar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {
        UserID: this.userID.value
      },
    };
    // Show
    const dialogRef = this.dialog.open(CarsDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((result) => {
      this.car.setValue(Utils.buildCarName(result[0].objectRef, false));
      this.carID.setValue(result[0].key);
    });
  }

  public startTransaction() {
    const startTransaction: StartTransaction = {
      userFullName: this.user.value,
      carID: this.carID.value,
      tagID: this.tagID.value
    };
    this.dialogRef.close(startTransaction);
  }

  public cancel() {
    this.dialogRef.close();
  }
}
