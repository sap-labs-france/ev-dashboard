import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { ChargingStationTemplate } from '../../../../types/ChargingStationTemplate';
import { Templates } from '../../../../utils/Templates';

@Component({
  selector: 'app-charging-station-template-main',
  templateUrl: 'charging-station-template-main.component.html',
})
export class ChargingStationTemplateMainComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public chargingStationTemplate!: ChargingStationTemplate;

  public id!: AbstractControl;
  public template!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor() {}

  public ngOnInit() {
    this.formGroup.addControl('id', new FormControl(''));
    this.formGroup.addControl(
      'template',
      new FormControl('', Validators.compose([Validators.required, Templates.validateJSON]))
    );
    // Form
    this.id = this.formGroup.controls['id'];
    this.template = this.formGroup.controls['template'];
    this.loadTemplate();
  }

  public ngOnChanges() {
    this.loadTemplate();
  }

  public onTemplateChange() {
    this.template.updateValueAndValidity();
    this.formGroup.markAsDirty();
  }

  public loadTemplate() {
    if (this.chargingStationTemplate) {
      this.id.setValue(this.chargingStationTemplate.id);
      this.template.setValue(JSON.stringify(this.chargingStationTemplate.template, undefined, 4));
    }
  }
}
