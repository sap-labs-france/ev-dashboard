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

  public tariffID: AbstractControl;
  public public = false;

  // eslint-disable-next-line no-useless-constructor
  public constructor() {
  }

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl('tariffID', new FormControl('',
      Validators.compose([
        Validators.maxLength(50),
      ])));

    // Form
    this.tariffID = this.formGroup.controls['tariffID'];
    this.tariffID.disable();
  }

  public ngOnChanges() {
    this.loadSite();
  }

  public loadSite() {
    if (this.site) {
      this.public = this.site.public;
      this.adaptTariffState();
      if (this.site?.tariffID) {
        this.tariffID.setValue(this.site.tariffID);
      }
    }
  }

  public publicChanged(publicValue: boolean) {
    this.public = publicValue;
    this.adaptTariffState();
  }

  private adaptTariffState() {
    if (this.public) {
      this.tariffID.enable();
    } else {
      this.tariffID.disable();
    }
  }
}
