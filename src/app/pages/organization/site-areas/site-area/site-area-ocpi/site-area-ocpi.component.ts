import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { SiteArea } from '../../../../../types/SiteArea';
import { Utils } from '../../../../../utils/Utils';

@Component({
  selector: 'app-site-area-ocpi',
  templateUrl: 'site-area-ocpi.component.html',
})
export class SiteAreaOcpiComponent implements OnInit, OnChanges {
  @Input() public siteArea!: SiteArea;
  @Input() public formGroup!: FormGroup;

  public tariffID: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor() {
  }

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl('tariffID', new FormControl(null,
      Validators.compose([
        Validators.maxLength(36),
      ])));
    // Form
    this.tariffID = this.formGroup.controls['tariffID'];
    this.loadSiteArea();
  }

  public ngOnChanges() {
    this.loadSiteArea();
  }

  public loadSiteArea() {
    if (this.siteArea) {
      if (this.siteArea.tariffID) {
        this.tariffID.setValue(this.siteArea.tariffID);
      }
    }
  }

  public emptyStringToNull(control: AbstractControl) {
    Utils.convertEmptyStringToNull(control);
  }
}
