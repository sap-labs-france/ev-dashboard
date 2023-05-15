/* eslint-disable no-useless-constructor */

import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'services/central-server.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { UsersDialogComponent } from 'shared/dialogs/users/users-dialog.component';
import { BillingAccount } from 'types/Billing';
import { ActionResponse } from 'types/DataResult';
import { RestResponse } from 'types/GlobalType';
import { Utils } from 'utils/Utils';

@Component({
  templateUrl: './account-dialog.component.html',
  styleUrls: ['./account-dialog.component.scss'],
})
export class AccountDialogComponent implements OnInit {
  public currentAccount: BillingAccount;
  public formGroup!: UntypedFormGroup;

  public id!: AbstractControl;
  public user!: AbstractControl;
  public userID!: AbstractControl;
  public companyName!: AbstractControl;

  public constructor(
    public dialogRef: MatDialogRef<AccountDialogComponent>,
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data: BillingAccount
  ) {
    this.currentAccount = data;
  }

  public ngOnInit(): void {
    this.formGroup = new UntypedFormGroup({
      id: new UntypedFormControl(this.currentAccount ? this.currentAccount.id : null),
      user: new UntypedFormControl(''),
      userID: new UntypedFormControl(''),
      companyName: new UntypedFormControl(''),
    });
    this.id = this.formGroup.controls['id'];
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.companyName = this.formGroup.controls['companyName'];
    // Register key event
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.formGroup,
      this.save.bind(this),
      this.close.bind(this)
    );
  }

  public closeDialog(saved: boolean = false) {
    this.dialogRef.close(saved);
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.save.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public save(currentAccount: { id: string; userID: string; user: string; companyName: string }) {
    this.spinnerService.show();
    this.centralServerService
      .createBillingAccount({
        id: currentAccount.id,
        companyName: currentAccount.companyName,
        businessOwnerID: currentAccount.userID,
      })
      .subscribe({
        next: (response) => {
          this.spinnerService.hide();
          if (response) {
            // handle success message
            this.messageService.showSuccessMessage('accounts.message.create_success');
            this.dialogRef.close(true);
          } else {
            Utils.handleError(
              JSON.stringify(response),
              this.messageService,
              'accounts.message.create_error'
            );
            this.dialogRef.close(false);
          }
        },
        error: (error) => {
          //handle error here
          this.spinnerService.hide();
          this.dialogRef.close(false);
          Utils.handleError(
            JSON.stringify(error),
            this.messageService,
            'accounts.message.create_error'
          );
        },
      });
  }

  public assignUser() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {},
    };
    // Open
    this.dialog
      .open(UsersDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        this.user.setValue(Utils.buildUserFullName(result[0].objectRef));
        this.userID.setValue(result[0].key);
        this.formGroup.markAsDirty();
      });
  }

  public resetUser() {
    this.userID.reset();
    this.user.reset();
    this.formGroup.markAsDirty();
  }
}
