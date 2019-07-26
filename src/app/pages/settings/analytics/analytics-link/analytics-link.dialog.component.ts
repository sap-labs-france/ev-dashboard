import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Constants } from 'app/utils/Constants';
import { TranslateService } from '@ngx-translate/core';
import { KeyValue } from '../../../../common.types';
import { AppUserMultipleRolesPipe } from '../../../../shared/formatters/app-user-multiple-roles.pipe';

@Component({
  templateUrl: './analytics-link.dialog.component.html'
})
export class AnalyticsLinkDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public id: AbstractControl;
  public name: AbstractControl;
  public description: AbstractControl;
  public role: AbstractControl;
  public roleList: KeyValue[];
  public url: AbstractControl;

  public currentLink: any;

  constructor(
    protected dialogRef: MatDialogRef<AnalyticsLinkDialogComponent>,
    private translateService: TranslateService,
    private appUserMultipleRolesPipe: AppUserMultipleRolesPipe,
    @Inject(MAT_DIALOG_DATA) data) {
    // Check if data is passed to the dialog
    if (data) {
      this.currentLink = data;
    } else {
      this.currentLink = {
        'id': '',
        'name': '',
        'description': '',
        'role': '',
        'url': ''
      };
    }
  }

  ngOnInit(): void {
    this.roleList = [ { key: 'A', value: '' }, {key: 'AD', value: ''}, {key: '', value: ''}];
    this.roleList.forEach((role) => role.value = this.translateService.instant(this.appUserMultipleRolesPipe.transform(role.key)));
    this.formGroup = new FormGroup({
      'id': new FormControl(this.currentLink.id),
      'name': new FormControl(this.currentLink.name,
        Validators.compose([
          Validators.required,
          Validators.maxLength(100)
        ])),
      'description': new FormControl(this.currentLink.description, Validators.required),
      'role': new FormControl(this.currentLink.role),
      'url': new FormControl(this.currentLink.url,
        Validators.compose([
          Validators.required,
          Validators.pattern(Constants.URL_PATTERN)
        ]))
    });

    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.role = this.formGroup.controls['role'];
    this.url = this.formGroup.controls['url'];

    // listen to escape key
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.cancel();
      }
      if (keydownEvents && keydownEvents.code === 'Enter') {
        this.setLinkAndClose(this.formGroup.value);
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  setLinkAndClose(analyticsLink) {
    this.dialogRef.close(analyticsLink);
  }

  openUrl() {
    window.open(this.url.value);
  }
}
