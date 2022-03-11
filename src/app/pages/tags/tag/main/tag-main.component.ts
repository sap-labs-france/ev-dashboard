import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthorizationDefinitionFieldMetadata } from 'types/Authorization';

import { SpinnerService } from '../../../../services/spinner.service';
import { UsersDialogComponent } from '../../../../shared/dialogs/users/users-dialog.component';
import { Tag } from '../../../../types/Tag';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-tag-main',
  templateUrl: 'tag-main.component.html'
})
export class TagMainComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public tag!: Tag;
  @Input() public readOnly: boolean;
  @Input() public metadata!: Record<string, AuthorizationDefinitionFieldMetadata>;

  public id!: AbstractControl;
  public description!: AbstractControl;
  public user!: AbstractControl;
  public userID!: AbstractControl;
  public active!: AbstractControl;
  public default!: AbstractControl;
  public visualID!: AbstractControl;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public spinnerService: SpinnerService,
    private dialog: MatDialog) {
  }

  public ngOnInit() {
    // Init the form
    this.formGroup.addControl('id', new FormControl('',
      Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20),
        Validators.pattern('^[a-zA-Z0-9]*$'),
      ])));
    this.formGroup.addControl('user', new FormControl(''));
    this.formGroup.addControl('userID', new FormControl('', ));
    this.formGroup.addControl('description', new FormControl('',
      Validators.compose([
        Validators.required,
      ])));
    this.formGroup.addControl('visualID', new FormControl('',
      Validators.compose([
        Validators.required,
      ])));
    this.formGroup.addControl('active', new FormControl('',
      Validators.compose([
        Validators.required,
      ])));
    this.formGroup.addControl('default', new FormControl('',
      Validators.compose([
        Validators.required,
      ])));
    // Form
    this.id = this.formGroup.controls['id'];
    this.description = this.formGroup.controls['description'];
    this.visualID = this.formGroup.controls['visualID'];
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.active = this.formGroup.controls['active'];
    this.default = this.formGroup.controls['default'];
    this.default.disable();
    if (this.readOnly) {
      this.formGroup.disable();
    }
    if (this.metadata?.userID?.mandatory) {
      this.user.setValidators(Validators.required);
      this.userID.setValidators(Validators.required);
    }
  }

  public ngOnChanges() {
    this.loadTag();
  }

  public loadTag() {
    if (this.tag) {
      this.id.setValue(this.tag.id);
      this.description.setValue(this.tag.description);
      this.visualID.setValue(this.tag.visualID);
      this.active.setValue(this.tag.active);
      if (this.tag.user) {
        this.userID.setValue(this.tag.user.id);
        this.user.setValue(Utils.buildUserFullName(this.tag.user));
        this.default.enable();
        this.default.setValue(this.tag.default);
      }
      if (this.metadata?.userID?.mandatory) {
        this.user.setValidators(Validators.required);
        this.userID.setValidators(Validators.required);
      }
      this.id.disable();
    }
  }

  public assignUser() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {
      },
    };
    // Open
    this.dialog.open(UsersDialogComponent, dialogConfig).afterClosed().subscribe((result) => {
      this.user.setValue(Utils.buildUserFullName(result[0].objectRef));
      this.userID.setValue(result[0].key);
      this.default.enable();
      this.formGroup.markAsDirty();
    });
  }

  public toUpperCase(control: AbstractControl) {
    control.setValue(control.value.toUpperCase());
  }

  public resetUser() {
    this.userID.reset();
    this.user.reset();
    this.default.setValue(false);
    this.default.disable();
    this.formGroup.markAsDirty();
  }
}
