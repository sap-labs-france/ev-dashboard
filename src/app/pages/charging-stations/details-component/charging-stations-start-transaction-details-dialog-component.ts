import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { CarsDialogComponent } from 'app/shared/dialogs/cars/cars-dialog.component';
import { TagsDialogComponent } from 'app/shared/dialogs/tags/tags-dialog.component';
import { UsersDialogComponent } from 'app/shared/dialogs/users/users-dialog.component';
import { Car } from 'app/types/Car';
import { HTTPError } from 'app/types/HTTPError';
import { ButtonType } from 'app/types/Table';
import { Tag } from 'app/types/Tag';
import { StartTransaction } from 'app/types/Transaction';
import { UserToken } from 'app/types/User';
import { Utils } from 'app/utils/Utils';

@Component({
    templateUrl: './charging-stations-start-transaction-details-dialog-component.html',
})
export class ChargingStationsStartTransactionDetailsDialogComponent implements OnInit {
    public title = '';
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
        private dialogRef: MatDialogRef<ChargingStationsStartTransactionDetailsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data: any) {
        // Set
        this.title = data.title;
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
        this.loadDefaultCar();
        this.loadDefaultTag();
    }

    public loadDefaultTag() {
        if (this.userID.value) {
            this.spinnerService.show();
            this.centralServerService.getUserDefaultTag(this.userID.value).subscribe((tag: Tag) => {
                this.spinnerService.hide();
                this.tag.setValue(Utils.buildTagName(tag));
                this.tagID.setValue(tag.id);
                this.formGroup.updateValueAndValidity();
                this.formGroup.markAsPristine();
                this.formGroup.markAllAsTouched();
            }, (error) => {
                this.spinnerService.hide();
                switch (error.status) {
                    case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
                        this.messageService.showErrorMessage('tags.tag_not_found');
                        break;
                    default:
                        Utils.handleHttpError(error, this.router, this.messageService,
                            this.centralServerService, 'tags.tag_error');
                }
            });
        }
    }

    public loadDefaultCar() {
        if (this.userID.value) {
            this.spinnerService.show();
            this.centralServerService.getUserDefaultCar(this.userID.value).subscribe((car: Car) => {
                this.spinnerService.hide();
                this.car.setValue(Utils.buildCarName(car, false));
                this.carID.setValue(car.id);
                this.formGroup.updateValueAndValidity();
                this.formGroup.markAsPristine();
                this.formGroup.markAllAsTouched();
            }, (error) => {
                this.spinnerService.hide();
                switch (error.status) {
                    case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
                        this.car.disable();
                        break;
                    default:
                        Utils.handleHttpError(error, this.router, this.messageService,
                            this.centralServerService, 'cars.car_error');
                }
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
            this.loadDefaultCar();
            this.loadDefaultTag();
            this.formGroup.markAsDirty();
        });
    }

    public assignTag() {
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
        const dialogRef = this.dialog.open(TagsDialogComponent, dialogConfig);
        // Register to the answer
        dialogRef.afterClosed().subscribe((result) => {
            this.tag.setValue(result[0].key);
            this.tagID.setValue(result[0].key);
            this.formGroup.markAsDirty();
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
            this.formGroup.markAsDirty();
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
