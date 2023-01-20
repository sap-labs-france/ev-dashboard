import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DialogMode } from 'types/Authorization';
import { Site } from 'types/Site';

import { SiteArea } from '../../../../../types/SiteArea';
import { Utils } from '../../../../../utils/Utils';

@Component({
  selector: 'app-site-area-ocpi',
  templateUrl: 'site-area-ocpi.component.html',
})
export class SiteAreaOcpiComponent implements OnInit, OnChanges {
  @Input() public siteArea!: SiteArea;
  @Input() public formGroup!: UntypedFormGroup;
  @Input() public dialogMode: DialogMode;

  public readonly DialogMode = DialogMode;
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
    this.loadSiteArea();
  }

  public ngOnChanges() {
    this.loadSiteArea();
  }

  public loadSiteArea() {
    if (this.initialized && this.siteArea) {
      this.public = this.siteArea.site?.public;
      this.enableDisableTariffID();
      if (this.siteArea.tariffID) {
        this.tariffID.setValue(this.siteArea.tariffID);
      }
    }
  }

  public siteChanged(site: Site) {
    this.public = site?.public;
    this.enableDisableTariffID();
  }

  public tariffIDChanged(control: AbstractControl) {
    Utils.convertEmptyStringToNull(control);
  }

  private enableDisableTariffID() {
    if (this.dialogMode !== this.DialogMode.VIEW) {
      if (this.public) {
        this.tariffID.enable();
      } else {
        this.tariffID.disable();
      }
    }
  }
}
