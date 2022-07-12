import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';

import { CentralServerService } from '../../../../../services/central-server.service';
import { ConfigService } from '../../../../../services/config.service';
import { MessageService } from '../../../../../services/message.service';
import { Address } from '../../../../../types/Address';
import { Company } from '../../../../../types/Company';
import { Constants } from '../../../../../utils/Constants';
import { Utils } from '../../../../../utils/Utils';

@Component({
  selector: 'app-company-billing',
  templateUrl: 'company-billing.component.html',
})
export class CompanyBillingComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public company!: Company;
  @Input() public readOnly: boolean;

  public initialized = false;
  public accountID!: AbstractControl;
  public flatFee!: AbstractControl;
  public percentage!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService) {
  }

  public ngOnInit() {
    this.formGroup.addControl('accountID', new FormControl(''));
    this.formGroup.addControl('flatFee', new FormControl(''));
    // this.formGroup.addControl('name', new FormControl('',
    //   Validators.compose([
    //     Validators.required,
    //   ])
    // ));
    // // Form
    // this.issuer = this.formGroup.controls['issuer'];
    // this.id = this.formGroup.controls['id'];
    // this.name = this.formGroup.controls['name'];
    this.loadCompany();
  }

  public ngOnChanges() {
    this.loadCompany();
  }

  public loadCompany() {
    if (this.initialized && this.company) {
      // if (Utils.objectHasProperty(this.company, 'issuer')) {
      //   this.issuer.setValue(this.company.issuer);
      // }
      // if (this.company.id) {
      //   this.id.setValue(this.company.id);
      // }
      // if (this.company.name) {
      //   this.name.setValue(this.company.name);
      // }
      // if (this.company.address) {
      //   this.address = this.company.address;
      // }
    }
  }

}
