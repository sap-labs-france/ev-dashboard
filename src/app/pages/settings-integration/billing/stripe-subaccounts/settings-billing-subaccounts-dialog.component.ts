/* eslint-disable no-useless-constructor */
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BillingAccount } from 'types/Billing';
import { Utils } from 'utils/Utils';

import { DialogService } from '../../../../services/dialog.service';

@Component({
  templateUrl: './settings-billing-subaccounts-dialog.component.html'
})
export class SettingsBillingSubaccountDialogComponent implements OnInit{
  public currentSubaccount: BillingAccount;
  public formGroup!: FormGroup;

  public id!: AbstractControl;
  public name!: AbstractControl;

  public constructor(
    public dialogRef: MatDialogRef<SettingsBillingSubaccountDialogComponent>,
    private translateService: TranslateService,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) data: BillingAccount
  ){
    this.currentSubaccount = data;
  }

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      id: new FormControl(this.currentSubaccount ? this.currentSubaccount.accountID : ''),
      name: new FormControl(this.currentSubaccount ? this.currentSubaccount.userID : '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ])
      ),
    });
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    // Register key event
    Utils.registerSaveCloseKeyEvents(this.dialogRef, this.formGroup,
      this.save.bind(this), this.close.bind(this));
  }

  public closeDialog(saved: boolean = false) {
    this.dialogRef.close(saved);
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.formGroup, this.dialogService,
      this.translateService, this.save.bind(this), this.closeDialog.bind(this));
  }

  public save(currentSubaccount: BillingAccount) {
    this.dialogRef.close(currentSubaccount);
  }

}
