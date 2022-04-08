import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AuthorizationDefinitionFieldMetadata } from 'types/Authorization';
import { Constants } from 'utils/Constants';

import { SpinnerService } from '../../../../services/spinner.service';
import { Tag } from '../../../../types/Tag';

@Component({
  selector: 'app-tag-limits',
  templateUrl: 'tag-limits.component.html'
})
export class TagLimitsComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public tag!: Tag;
  @Input() public readOnly: boolean;
  @Input() public metadata!: Record<string, AuthorizationDefinitionFieldMetadata>;

  public limitFormGroup!: FormGroup;
  public limitKwhEnabled!: AbstractControl;
  public limitKwh!: AbstractControl;
  public limitKwhConsumed!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public spinnerService: SpinnerService) {
  }

  public ngOnInit() {
    // Init the form
    this.limitFormGroup = new FormGroup({});
    this.formGroup.addControl('limit', this.limitFormGroup);
    this.limitFormGroup.addControl('limitKwhEnabled', new FormControl(false));
    this.limitFormGroup.addControl('limitKwh', new FormControl({value: null, disabled: true},
      Validators.compose([
        Validators.required,
        Validators.min(1),
        Validators.pattern(Constants.REGEX_VALIDATION_FLOAT),
      ])));
    this.limitFormGroup.addControl('limitKwhConsumed', new FormControl({value: 0, disabled: true}));
    // Form
    this.limitKwhEnabled = this.limitFormGroup.controls['limitKwhEnabled'];
    this.limitKwh = this.limitFormGroup.controls['limitKwh'];
    this.limitKwhConsumed = this.limitFormGroup.controls['limitKwhConsumed'];
    if (this.readOnly) {
      this.limitFormGroup.disable();
    }
  }

  public toggleLimitKwh(event: MatSlideToggleChange) {
    if (event.checked) {
      this.limitKwh.enable();
    } else {
      this.limitKwh.disable();
    }
    this.limitFormGroup.markAsDirty();
    this.limitFormGroup.updateValueAndValidity();
  }

  public ngOnChanges() {
    this.loadTag();
  }

  public loadTag() {
    if (this.tag) {
      this.limitKwhEnabled.setValue(this.tag.limit?.limitKwhEnabled);
      this.limitKwh.setValue(this.tag.limit?.limitKwh);
      this.limitKwhConsumed.setValue(this.tag.limit?.limitKwhConsumed);
      if (this.tag.limit?.limitKwhEnabled) {
        this.limitKwh.enable();
      } else {
        this.limitKwh.disable();
      }
    }
  }

  public resetLimitKwh() {
    this.limitKwhConsumed.setValue(0);
    this.limitFormGroup.markAsDirty();
  }
}
