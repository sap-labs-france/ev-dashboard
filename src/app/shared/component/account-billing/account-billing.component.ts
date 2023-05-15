import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AccountsDialogComponent } from 'shared/dialogs/accounts/accounts-dialog.component';
import { BillingAccount, BillingAccountData } from 'types/Billing';
import { Utils } from 'utils/Utils';

@Component({
  selector: 'app-account-billing',
  templateUrl: 'account-billing.component.html',
  styleUrls: ['./account-billing.component.scss'],
})
export class AccountBillingComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public entity: { accountData?: BillingAccountData };
  @Input() public readOnly: boolean;

  public initialized = false;
  public accountID!: AbstractControl;
  public companyName!: AbstractControl;
  public flatFee!: AbstractControl;
  public percentage!: AbstractControl;
  public businessOwnerName!: string;

  // eslint-disable-next-line no-useless-constructor
  public constructor(private dialog: MatDialog) {}

  public ngOnInit() {
    this.formGroup.addControl('accountID', new FormControl(''));
    this.formGroup.addControl('companyName', new FormControl(''));
    this.formGroup.addControl(
      'flatFee',
      new FormControl(0, Validators.compose([Validators.pattern(/^[+]?([0-9]*[.])?[0-9]+$/)]))
    );
    this.formGroup.addControl(
      'percentage',
      new FormControl(
        0,
        Validators.compose([Validators.max(100), Validators.pattern(/^[+]?([0-9]*[.])?[0-9]+$/)])
      )
    );
    this.accountID = this.formGroup.controls['accountID'];
    this.companyName = this.formGroup.controls['companyName'];
    this.flatFee = this.formGroup.controls['flatFee'];
    this.percentage = this.formGroup.controls['percentage'];
    this.initialized = true;
    this.loadEntity();
  }

  public ngOnChanges() {
    this.loadEntity();
  }

  public loadEntity() {
    if (this.initialized && this.entity) {
      if (this.entity.accountData) {
        const accountData = this.entity.accountData;
        this.accountID.setValue(accountData.accountID);
        this.companyName.setValue(accountData.account.companyName);
        this.flatFee.setValue(accountData.platformFeeStrategy.flatFeePerSession);
        this.percentage.setValue(accountData.platformFeeStrategy.percentage);
        this.businessOwnerName = Utils.buildUserFullName(accountData.account.businessOwner);
      }
    }
  }

  public assignAccount() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {},
    };
    // Open
    this.dialog
      .open(AccountsDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        const account = result[0].objectRef as BillingAccount;
        this.accountID.setValue(account.id);
        this.companyName.setValue(account.companyName);
        this.businessOwnerName = Utils.buildUserFullName(account.businessOwner);
        this.formGroup.markAsDirty();
      });
  }

  public resetAccount() {
    this.accountID.reset();
    this.companyName.reset();
    this.businessOwnerName = '';
    this.formGroup.markAsDirty();
  }

  public updateEntityConnectedAccount(entity: { accountData?: BillingAccountData }) {
    const accountID = this.accountID.value;
    entity.accountData = {
      accountID,
      platformFeeStrategy: {
        flatFeePerSession: accountID ? this.flatFee.value : 0,
        percentage: accountID ? this.percentage.value : 0,
      },
    };
  }
}
