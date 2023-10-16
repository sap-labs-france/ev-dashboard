import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { DialogService } from '../../../../services/dialog.service';
import { AppUserMultipleRolesPipe } from '../../../../shared/formatters/app-user-multiple-roles.pipe';
import { KeyValue } from '../../../../types/GlobalType';
import { SettingLink } from '../../../../types/Setting';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Component({
  templateUrl: 'analytics-link-dialog.component.html',
  styleUrls: ['analytics-link-dialog.component.scss'],
})
export class AnalyticsLinkDialogComponent implements OnInit {
  public formGroup!: UntypedFormGroup;
  public id!: AbstractControl;
  public name!: AbstractControl;
  public description!: AbstractControl;
  public role!: AbstractControl;
  public roleList!: KeyValue[];
  public url!: AbstractControl;

  public currentLink: SettingLink;
  public submitButtonType!: any;

  public constructor(
    public dialogRef: MatDialogRef<AnalyticsLinkDialogComponent>,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private appUserMultipleRolesPipe: AppUserMultipleRolesPipe,
    @Inject(MAT_DIALOG_DATA) data: SettingLink
  ) {
    // Check if data is passed to the dialog
    this.currentLink = data;
  }

  public ngOnInit(): void {
    this.roleList = [
      { key: 'A', value: '' },
      { key: 'D', value: '' },
      { key: '', value: '' },
    ];
    this.roleList.forEach(
      (role) =>
        (role.value = this.translateService.instant(
          this.appUserMultipleRolesPipe.transform(role.key)
        ))
    );
    this.formGroup = new UntypedFormGroup({
      id: new UntypedFormControl(this.currentLink ? this.currentLink.id : ''),
      name: new UntypedFormControl(
        this.currentLink ? this.currentLink.name : '',
        Validators.compose([Validators.required, Validators.maxLength(100)])
      ),
      description: new UntypedFormControl(
        this.currentLink ? this.currentLink.description : '',
        Validators.required
      ),
      role: new UntypedFormControl(this.currentLink ? this.currentLink.role : ''),
      url: new UntypedFormControl(
        this.currentLink ? this.currentLink.url : '',
        Validators.compose([Validators.required, Validators.pattern(Constants.URL_PATTERN)])
      ),
    });
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.role = this.formGroup.controls['role'];
    this.url = this.formGroup.controls['url'];
    // Register key event
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.formGroup,
      this.save.bind(this),
      this.close.bind(this)
    );
    // Get Create/Update submit translation
    this.submitButtonType = this.submitButtonTranslation();
  }

  public closeDialog(saved: boolean = false) {
    this.dialogRef.close(saved);
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.save.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public save(analyticsLink: SettingLink) {
    this.dialogRef.close(analyticsLink);
  }

  public submitButtonTranslation() {
    if (!this.currentLink || !this.currentLink.id) {
      return this.translateService.instant('general.create');
    }
    return this.translateService.instant('general.update');
  }

  public openUrl() {
    window.open(this.url.value);
  }
}
