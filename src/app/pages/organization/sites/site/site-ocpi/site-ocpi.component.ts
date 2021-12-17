import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Site } from 'types/Site';

@Component({
  selector: 'app-site-ocpi',
  templateUrl: 'site-ocpi.component.html',
})
export class SiteOcpiComponent implements OnInit, OnChanges {
  @Input() public site!: Site;
  @Input() public formGroup!: FormGroup;
  @Input() public readOnly: boolean;

  public public = false;

  public tariffID: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor() {
  }

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl('tariffID', new FormControl(null,
      Validators.compose([
        Validators.maxLength(50),
      ])));

    // Form
    this.tariffID = this.formGroup.controls['tariffID'];
    if (this.readOnly) {
      this.formGroup.disable();
    }
  }

  public ngOnChanges() {
    this.loadSite();
  }

  public loadSite() {
    if (this.site) {
      this.public = this.site.public;
      this.enableDisableTariffID();
      if (this.site.tariffID) {
        this.tariffID.setValue(this.site.tariffID);
      }
    }
  }

  public publicChanged(publicValue: boolean) {
    this.public = publicValue;
    this.enableDisableTariffID();
  }

  private enableDisableTariffID() {
    if (!this.readOnly) {
      if (this.public) {
        this.tariffID.enable();
      } else {
        this.tariffID.disable();
      }
    }
  }
}
