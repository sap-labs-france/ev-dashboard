import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'types/User';

@Component({
  selector: 'app-user-miscs',
  templateUrl: './user-miscs.component.html',
})
// @Injectable()
export class UserMiscsComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public user!: User;

  public iNumber!: AbstractControl;
  public costCenter!: AbstractControl;

  public ngOnInit(): void {
    // Init the form
    this.formGroup.addControl('iNumber', new FormControl(''));
    this.formGroup.addControl('costCenter', new FormControl('',
      Validators.compose([
        Validators.pattern('^[0-9]*$'),
      ])
    ));
    // Form
    this.iNumber = this.formGroup.controls['iNumber'];
    this.costCenter = this.formGroup.controls['costCenter'];
    this.formGroup.updateValueAndValidity();
  }

  public ngOnChanges() {
    this.loadUser();
  }

  // eslint-disable-next-line complexity
  public loadUser() {
    if (this.user) {
      if (this.user.iNumber) {
        this.formGroup.controls.iNumber.setValue(this.user.iNumber);
      }
      if (this.user.costCenter) {
        this.formGroup.controls.costCenter.setValue(this.user.costCenter);
      }
    }
  }
}
