import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AccountsDialogComponent } from 'shared/dialogs/accounts/accounts-dialog.component';
import { BillingAccount } from 'types/Billing';
import { Utils } from 'utils/Utils';

import { CentralServerService } from '../../../../../services/central-server.service';
import { MessageService } from '../../../../../services/message.service';
import { Company } from '../../../../../types/Company';

@Component({
  selector: 'app-company-billing',
  templateUrl: 'company-billing.component.html',
})
export class CompanyBillingComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public company!: Company;
  @Input() public readOnly: boolean;

  public initialized = false;
  public account!: AbstractControl;
  public flatFee!: AbstractControl;
  public percentage!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private dialog: MatDialog) {
  }

  public ngOnInit() {
    this.formGroup.addControl('account', new FormControl(''));
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
    this.account = this.formGroup.controls['account'];
    this.flatFee = this.formGroup.controls['flatFee'];
    this.percentage = this.formGroup.controls['percentage'];
    this.loadCompany();
  }

  public ngOnChanges() {
    this.loadCompany();
  }

  public loadCompany() {
    if (this.initialized && this.company) {
      if (this.company.accountData) {
        const accountData = this.company.accountData;
        this.account.setValue(accountData.accountID);
        this.flatFee.setValue(accountData.platformFeeStrategy.flatFeePerSession);
        this.percentage.setValue(accountData.platformFeeStrategy.percentage);
      }
    }
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
      this.account.setValue(Utils.buildUserFullName((result[0].objectRef as BillingAccount).businessOwner));
      this.formGroup.markAsDirty();
    });
  }

  public resetAccount() {
    this.account.reset();
    this.formGroup.markAsDirty();
  }

}
