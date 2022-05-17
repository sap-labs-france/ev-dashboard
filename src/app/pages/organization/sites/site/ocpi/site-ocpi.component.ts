import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Site } from 'types/Site';
import { Utils } from 'utils/Utils';

@Component({
  selector: 'app-site-ocpi',
  templateUrl: 'site-ocpi.component.html',
})
export class SiteOcpiComponent implements OnInit, OnChanges {
  @Input() public site!: Site;
  @Input() public formGroup!: FormGroup;
  @Input() public readOnly: boolean;

  public public = false;
  public initialized = false;

  public tariffID: AbstractControl;

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl('tariffID', new FormControl(null,
      Validators.compose([
        Validators.maxLength(36),
      ])));

    // Form
    this.tariffID = this.formGroup.controls['tariffID'];
    this.enableDisableTariffID();
    this.initialized = true;
    this.loadSite();
  }

  public ngOnChanges() {
    this.loadSite();
  }

  public loadSite() {
    if (this.initialized && this.site) {
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

  public tariffIDChanged(control: AbstractControl) {
    Utils.convertEmptyStringToNull(control);
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
