import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { SpinnerService } from '../../../../services/spinner.service';
import { ChargingStationTemplate } from '../../../../types/ChargingStationTemplate';
import { Templates } from '../../../../utils/Templates';

@Component({
  selector: 'app-charging-station-template-main',
  templateUrl: 'charging-station-template-main.component.html',
})
export class ChargingStationTemplateMainComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public template!: ChargingStationTemplate;

  public chargingStationTemplate!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public spinnerService: SpinnerService) {
  }

  public ngOnInit() {
    this.formGroup.addControl('chargingStationTemplate', new FormControl('',
      Validators.compose([
        Validators.required,
        Templates.validateJSON
      ])));
    // Form
    this.chargingStationTemplate = this.formGroup.controls['chargingStationTemplate'];
    this.loadTemplate();
  }

  public ngOnChanges() {
    this.loadTemplate();
  }

  public onTemplateChange(event) {
    console.log('toto');
    try {
      const toto = JSON.parse(event.target.value);
      this.chargingStationTemplate.updateValueAndValidity();
      this.formGroup.markAsDirty();
    } catch (error) {
      console.log('ERROR');
      return false;
    }
    console.log('SUCCESS');
    return true;
  }

  public loadTemplate() {
    if (this.template) {
      this.chargingStationTemplate.setValue(this.template);
    }
  }
}
