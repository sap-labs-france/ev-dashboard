import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { User } from 'types/User';

@Component({
  selector: 'app-user-miscs',
  templateUrl: 'user-miscs.component.html',
})
// @Injectable()
export class UserMiscsComponent implements OnInit, OnChanges {
  @Input() public formGroup: UntypedFormGroup;
  @Input() public user!: User;

  public initialized = false;

  public iNumber!: AbstractControl;
  public costCenter!: AbstractControl;

  public ngOnInit(): void {
    // Init the form
    this.formGroup.addControl('iNumber', new UntypedFormControl(''));
    this.formGroup.addControl(
      'costCenter',
      new UntypedFormControl('', Validators.compose([Validators.pattern('^[0-9]*$')]))
    );
    // Form
    this.iNumber = this.formGroup.controls['iNumber'];
    this.costCenter = this.formGroup.controls['costCenter'];
    this.initialized = true;
    this.loadUser();
  }

  public ngOnChanges() {
    this.loadUser();
  }

  // eslint-disable-next-line complexity
  public loadUser() {
    if (this.initialized && this.user) {
      if (this.user.iNumber) {
        this.iNumber.setValue(this.user.iNumber);
      }
      if (this.user.costCenter) {
        this.costCenter.setValue(this.user.costCenter);
      }
    }
  }
}
