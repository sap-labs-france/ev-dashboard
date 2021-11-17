import { Component, EventEmitter, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Site } from 'types/Site';

@Component({
  selector: 'app-site-ocpi',
  templateUrl: 'site-ocpi.component.html',
})
export class SiteOcpiComponent implements OnInit {
  @Input() public site!: Site;
  @Input() public public: boolean;

  public formOcpiGroup: FormGroup;
  public tariffID: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor() {
  }

  public ngOnInit() {
    // Init connectors
    this.formOcpiGroup = new FormGroup({
      tariffID: new FormControl('',
        Validators.compose([
          Validators.maxLength(50),
        ])),
    });

    // Form
    this.tariffID = this.formOcpiGroup.controls['tariffID'];
    if (this.public) {
      this.tariffID.enable();
    } else {
      this.tariffID.disable();
    }
    if (this.site.tariffID) {
      this.tariffID.setValue(this.site.tariffID);
    }
  }
}
