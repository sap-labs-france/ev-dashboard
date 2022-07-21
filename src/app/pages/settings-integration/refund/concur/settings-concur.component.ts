import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { RefundSettings } from '../../../../types/Setting';

@Component({
  selector: 'app-settings-concur',
  templateUrl: 'settings-concur.component.html',
})
export class SettingsConcurComponent implements OnInit, OnChanges {
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public refundSettings!: RefundSettings;

  public concur!: UntypedFormGroup;
  public concurAuthenticationUrl!: AbstractControl;
  public concurAppUrl!: AbstractControl;
  public concurApiUrl!: AbstractControl;
  public concurClientId!: AbstractControl;
  public concurClientSecret!: AbstractControl;
  public concurPaymentTypeId!: AbstractControl;
  public concurExpenseTypeCode!: AbstractControl;
  public concurPolicyId!: AbstractControl;
  public concurReportName!: AbstractControl;

  public ngOnInit() {
    this.formGroup.addControl('concur',
      new UntypedFormGroup({
        authenticationUrl: new UntypedFormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100),
          ]),
        ),
        apiUrl: new UntypedFormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100),
          ]),
        ),
        appUrl: new UntypedFormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100),
          ]),
        ),
        clientId: new UntypedFormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100),
          ]),
        ),
        clientSecret: new UntypedFormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100),
          ]),
        ),
        paymentTypeId: new UntypedFormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100),
          ]),
        ),
        expenseTypeCode: new UntypedFormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100),
          ]),
        ),
        policyId: new UntypedFormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100),
          ]),
        ),
        reportName: new UntypedFormControl('',
          Validators.compose([
            Validators.required,
            Validators.maxLength(100),
          ]),
        ),
      }),
    );
    // Keep
    this.concur = (this.formGroup.controls['concur'] as UntypedFormGroup);
    this.concurAuthenticationUrl = this.concur.controls['authenticationUrl'];
    this.concurAppUrl = this.concur.controls['appUrl'];
    this.concurApiUrl = this.concur.controls['apiUrl'];
    this.concurClientId = this.concur.controls['clientId'];
    this.concurClientSecret = this.concur.controls['clientSecret'];
    this.concurPaymentTypeId = this.concur.controls['paymentTypeId'];
    this.concurExpenseTypeCode = this.concur.controls['expenseTypeCode'];
    this.concurPolicyId = this.concur.controls['policyId'];
    this.concurReportName = this.concur.controls['reportName'];
    // Set data
    this.updateFormData();
  }

  public ngOnChanges() {
    this.updateFormData();
  }

  public updateFormData() {
    // Set data
    if (this.refundSettings && this.refundSettings.concur && this.concur) {
      this.concurAuthenticationUrl.setValue(
        this.refundSettings.concur.authenticationUrl ? this.refundSettings.concur.authenticationUrl : '');
      this.concurApiUrl.setValue(this.refundSettings.concur.apiUrl ? this.refundSettings.concur.apiUrl : '');
      this.concurAppUrl.setValue(this.refundSettings.concur.appUrl ? this.refundSettings.concur.appUrl : '');
      this.concurClientId.setValue(this.refundSettings.concur.clientId ? this.refundSettings.concur.clientId : '');
      this.concurClientSecret.setValue(this.refundSettings.concur.clientSecret ? this.refundSettings.concur.clientSecret : '');
      this.concurPaymentTypeId.setValue(this.refundSettings.concur.paymentTypeId ? this.refundSettings.concur.paymentTypeId : '');
      this.concurExpenseTypeCode.setValue(this.refundSettings.concur.expenseTypeCode ? this.refundSettings.concur.expenseTypeCode : '');
      this.concurPolicyId.setValue(this.refundSettings.concur.policyId ? this.refundSettings.concur.policyId : '');
      this.concurReportName.setValue(this.refundSettings.concur.reportName ? this.refundSettings.concur.reportName : '');
    }
  }
}
