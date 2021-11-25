import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'types/User';
import { ParentErrorStateMatcher } from 'utils/ParentStateMatcher';
import { Users } from 'utils/Users';

import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-user-security',
  templateUrl: './user-security.component.html',
})
// @Injectable()
export class UserSecurityComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public user!: User;
  @Input() public currentUserID!: string;

  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  public hidePassword = true;
  public hideRepeatPassword = true;

  public passwords!: FormGroup;
  public password!: AbstractControl;
  public repeatPassword!: AbstractControl;

  public ngOnInit(): void {
    // Init the form
    this.formGroup.addControl('passwords', new FormGroup({
      password: new FormControl('',
        Validators.compose([
          Users.passwordWithNoSpace,
          Users.validatePassword,
        ].concat(!Utils.isEmptyString(this.currentUserID) ? [] : [Validators.required]))),
      repeatPassword: new FormControl('',
        Validators.compose([
          Users.validatePassword,
        ].concat(!Utils.isEmptyString(this.currentUserID) ? [] : [Validators.required]))),
    }, (passwordFormGroup: FormGroup) => Utils.validateEqual(passwordFormGroup, 'password', 'repeatPassword')));
    // Form
    this.passwords = (this.formGroup.controls['passwords'] as FormGroup);
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
    this.formGroup.updateValueAndValidity();
  }

  public ngOnChanges() {
    this.loadUser();
  }

  // eslint-disable-next-line complexity
  public loadUser() {
    if (this.user) {
      // Reset password
      this.passwords.controls.password.setValue('');
      this.passwords.controls.repeatPassword.setValue('');
    }
  }

  public updateUserPassword(user: User) {
    if (user['passwords'] && user['passwords']['password']) {
      user['password'] = user['passwords']['password'];
      delete user['passwords'];
    }
  }
}
