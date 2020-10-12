import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CarsDialogComponent } from 'app/shared/dialogs/cars/cars-dialog.component';
import { TagsDialogComponent } from 'app/shared/dialogs/tags/tags-dialog.component';
import { UsersDialogComponent } from 'app/shared/dialogs/users/users-dialog.component';
import { ButtonType } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';

export const BUTTON_FOR_MYSELF = 'FOR_MYSELF';
export const BUTTON_SELECT_USER = 'SELECT_USER';

@Component({
    templateUrl: './charging-stations-start-transaction-details-dialog-component.html',
})
export class ChargingStationsStartTransactionDetailsDialogComponent implements OnInit {
    public title = '';
    public message = '';
    public formGroup!: FormGroup;
    public user!: AbstractControl;
    public userID!: AbstractControl;
    public forMySelf!: AbstractControl;
    public car!: AbstractControl;
    public carID!: AbstractControl;
    public tag!: AbstractControl;
    public tagID!: AbstractControl;

    public isAdmin = false;
    constructor(
        private dialog: MatDialog,
        private translateService: TranslateService,
        private dialogRef: MatDialogRef<ChargingStationsStartTransactionDetailsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data: any) {
        // Set
        this.title = data.title;
        this.message = data.message;
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
            forMySelf: new FormControl('',
                Validators.compose([
                    Validators.required,
                ])),
            car: new FormControl('',
                Validators.compose([

                ])),
            carID: new FormControl('',
                Validators.compose([
                    Validators.required,
                ])),
            tag: new FormControl('',
                Validators.compose([
                ])),
            tagID: new FormControl('',
                Validators.compose([
                    Validators.required,
                ]))
        });
        // Form
        this.user = this.formGroup.controls['user'];
        this.userID = this.formGroup.controls['userID'];
        this.forMySelf = this.formGroup.controls['forMySelf'];
        this.car = this.formGroup.controls['car'];
        this.carID = this.formGroup.controls['carID'];
        this.tag = this.formGroup.controls['tag'];
        this.tagID = this.formGroup.controls['tagID'];
        this.car.disable();
        this.tag.disable();
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
            this.car.setValue(result[0].value);
            this.carID.setValue(result[0].key);
            this.formGroup.markAsDirty();
        });
    }

    public forMyself() {
        this.dialogRef.close(BUTTON_FOR_MYSELF);
    }

    public selectUser() {
        this.dialogRef.close(BUTTON_SELECT_USER);
    }

    public cancel() {
        this.dialogRef.close(ButtonType.CANCEL);
    }
}
