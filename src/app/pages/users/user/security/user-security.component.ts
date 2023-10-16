import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { User } from 'types/User';
import { ParentErrorStateMatcher } from 'utils/ParentStateMatcher';
import { Users } from 'utils/Users';

import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-user-security',
  templateUrl: 'user-security.component.html',
})
// @Injectable()
export class UserSecurityComponent implements OnInit, OnChanges {
  @Input() public formGroup: UntypedFormGroup;
  @Input() public user!: User;

  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  public hidePassword = true;
  public hideRepeatPassword = true;
  public initialized = false;

  public passwords!: UntypedFormGroup;
  public password!: AbstractControl;
  public repeatPassword!: AbstractControl;

  public ngOnInit(): void {
    // Init the form
    this.formGroup.addControl(
      'passwords',
      new UntypedFormGroup(
        {
          password: new UntypedFormControl(
            '',
            Validators.compose([Users.passwordWithNoSpace, Users.validatePassword])
          ),
          repeatPassword: new UntypedFormControl('', Validators.compose([Users.validatePassword])),
        },
        (passwordFormGroup: UntypedFormGroup) =>
          Utils.validateEqual(passwordFormGroup, 'password', 'repeatPassword')
      )
    );
    // Form
    this.passwords = this.formGroup.controls['passwords'] as UntypedFormGroup;
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
    this.initialized = true;
    this.loadUser();
  }

  public ngOnChanges() {
    this.loadUser();
  }

  // eslint-disable-next-line complexity
  public loadUser() {
    if (this.initialized && this.user) {
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
