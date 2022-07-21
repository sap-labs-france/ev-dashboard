import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AccountsDialogComponent } from 'shared/dialogs/accounts/accounts-dialog.component';
import { BillingAccount, BillingAccountData } from 'types/Billing';
import { Utils } from 'utils/Utils';

import { Company } from '../../../../../types/Company';

@Component({
  selector: 'app-company-billing',
  templateUrl: 'company-billing.component.html',
  styleUrls: ['./company-billing.component.scss']
})
export class CompanyBillingComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public company!: Company;
  @Input() public readOnly: boolean;

  public initialized = false;
  public accountID!: AbstractControl;
  public accountName!: AbstractControl;
  public flatFee!: AbstractControl;
  public percentage!: AbstractControl;
  public accountUserName!: string;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private dialog: MatDialog) {
  }

  public ngOnInit() {
    this.formGroup.addControl('accountID', new FormControl(''));
    this.formGroup.addControl('accountName', new FormControl(''));
    this.formGroup.addControl('flatFee', new FormControl(0,
      Validators.compose([
        Validators.pattern(/^[+]?([0-9]*[.])?[0-9]+$/),
      ])
    ));
    this.formGroup.addControl('percentage', new FormControl(0,
      Validators.compose([
        Validators.max(100),
        Validators.pattern(/^[+]?([0-9]*[.])?[0-9]+$/),
      ])
    ));
    this.accountID = this.formGroup.controls['accountID'];
    this.accountName = this.formGroup.controls['accountName'];
    this.flatFee = this.formGroup.controls['flatFee'];
    this.percentage = this.formGroup.controls['percentage'];
    this.initialized = true;
    this.loadCompany();
  }

  public ngOnChanges() {
    this.loadCompany();
  }

  public loadCompany() {
    if (this.initialized && this.company) {
      if (this.company.accountData) {
        const accountData = this.company.accountData;
        this.accountID.setValue(accountData.accountID);
        this.accountName.setValue(accountData.account.companyName);
        this.flatFee.setValue(accountData.platformFeeStrategy.flatFeePerSession);
        this.percentage.setValue(accountData.platformFeeStrategy.percentage);
        this.accountUserName = Utils.buildUserFullName(accountData.account.businessOwner);
      }
    }
  }

  public getAccountData() {
    const companyAccountData: BillingAccountData = {
      accountID: this.accountID.value,
      platformFeeStrategy: {
        flatFeePerSession: this.flatFee.value,
        percentage: this.percentage.value
      }
    };
    return companyAccountData;
  }

  public assignAccounts() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {
      },
    };
    // Open
    this.dialog.open(AccountsDialogComponent, dialogConfig).afterClosed().subscribe((result) => {
      const account = result[0].objectRef as BillingAccount;
      this.accountID.setValue(account.id);
      this.accountName.setValue(account.companyName);
      this.accountUserName = Utils.buildUserFullName(account.businessOwner);
      this.formGroup.markAsDirty();
    });
  }

  public resetAccount() {
    this.accountID.reset();
    this.accountName.reset();
    this.accountUserName = '';
    this.formGroup.markAsDirty();
  }

}
