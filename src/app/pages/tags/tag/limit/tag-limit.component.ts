import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AuthorizationDefinitionFieldMetadata } from 'types/Authorization';
import { Constants } from 'utils/Constants';

import { SpinnerService } from '../../../../services/spinner.service';
import { Tag } from '../../../../types/Tag';

@Component({
  selector: 'app-tag-limit',
  templateUrl: 'tag-limit.component.html'
})
export class TagLimitComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public tag!: Tag;
  @Input() public readOnly: boolean;
  @Input() public metadata!: Record<string, AuthorizationDefinitionFieldMetadata>;

  public limitKwhEnabled!: AbstractControl;
  public limitKwh!: AbstractControl;
  public limitConsumedKwh!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public spinnerService: SpinnerService) {
  }

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl('limitKwhEnabled', new FormControl(false));
    this.formGroup.addControl('limitKwh', new FormControl({value: null, disabled: true},
      Validators.compose([
        Validators.required,
        Validators.pattern(Constants.REGEX_VALIDATION_FLOAT),
      ])));
    this.formGroup.addControl('limitConsumedKwh', new FormControl({value: 0, disabled: true}));
    // Form
    this.limitKwhEnabled = this.formGroup.controls['limitKwhEnabled'];
    this.limitKwh = this.formGroup.controls['limitKwh'];
    this.limitConsumedKwh = this.formGroup.controls['limitConsumedKwh'];
    if (this.readOnly) {
      this.formGroup.disable();
    }
  }

  public toggleLimitKwh(event: MatSlideToggleChange) {
    if (event.checked) {
      this.limitKwh.enable();
    } else {
      this.limitKwh.disable();
    }
    this.formGroup.markAsDirty();
    this.formGroup.updateValueAndValidity();
  }

  public ngOnChanges() {
    this.loadTag();
  }

  public loadTag() {
    if (this.tag) {
      this.limitKwhEnabled.setValue(this.tag.limitKwhEnabled);
      this.limitKwh.setValue(this.tag.limitKwh);
    }
  }

  public resetLimitKwh() {
    this.limitConsumedKwh.setValue(0);
  }
}
