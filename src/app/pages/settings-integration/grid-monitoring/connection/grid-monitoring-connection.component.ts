import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { KeyValue } from 'types/GlobalType';
import { GridMonitoringConnectionSetting, GridMonitoringConnectionType, GridMonitoringEcowattConnectionType } from 'types/Setting';

import { GridMonitoringConnectionDialogComponent } from './grid-monitoring-connection.dialog.component';

@Component({
  selector: 'app-settings-grid-monitoring-connection',
  templateUrl: './grid-monitoring-connection.component.html',
  styleUrls: ['./grid-monitoring-connection.component.scss']
})
export class GridMonitoringConnectionComponent implements OnInit {
  @Input() public currentGridMonitoringConnection!: GridMonitoringConnectionSetting;
  @Input() public dialogRef!: MatDialogRef<GridMonitoringConnectionDialogComponent>;

  public formGroup!: UntypedFormGroup;
  public id!: AbstractControl;
  public description!: AbstractControl;
  public name!: AbstractControl;
  public type!: AbstractControl;

  public readonly GridMonitoringConnectionType = GridMonitoringConnectionType;

  public ecowattConnection!: GridMonitoringEcowattConnectionType;
  public gridMonitoringConnectionTypes: KeyValue[] = [
    { key: GridMonitoringConnectionType.ECOWATT, value: 'settings.grid_monitoring.types.ecowatt' },
  ];

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private translateService: TranslateService
  ) { }

  public ngOnInit(): void {
    this.formGroup = new UntypedFormGroup({
      id: new UntypedFormControl(''),
      name: new UntypedFormControl('',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ])),
      description: new UntypedFormControl('',
        Validators.compose([
          Validators.required,
        ])),
      type: new UntypedFormControl('',
        Validators.compose([
          Validators.required,
        ])),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.name = this.formGroup.controls['name'];
    this.description = this.formGroup.controls['description'];
    this.type = this.formGroup.controls['type'];
    this.loadGridMonitoringConnection();
  }

  public loadGridMonitoringConnection(): void {
    if (this.currentGridMonitoringConnection) {
      this.id.setValue(this.currentGridMonitoringConnection.id);
      if (this.currentGridMonitoringConnection.name) {
        this.name.setValue(this.currentGridMonitoringConnection.name);
      }
      if (this.currentGridMonitoringConnection.description) {
        this.description.setValue(this.currentGridMonitoringConnection.description);
      }
      if (this.currentGridMonitoringConnection.type) {
        this.type.setValue(this.currentGridMonitoringConnection.type);
        this.loadConnectionType();
      }
    }
  }

  public loadConnectionType(): void {
    switch (this.currentGridMonitoringConnection.type) {
      case GridMonitoringConnectionType.ECOWATT:
        this.ecowattConnection = this.currentGridMonitoringConnection.ecowattConnection;
        break;
    }
  }

  public getSubmitButtonTranslation(): string {
    if (this.currentGridMonitoringConnection && this.currentGridMonitoringConnection.id) {
      return this.translateService.instant('general.update');
    }
    return this.translateService.instant('general.create');
  }

  public close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  public save(gridMonitoringConnection: GridMonitoringConnectionSetting): void {
    if (this.dialogRef) {
      // Generate the ID
      if (!gridMonitoringConnection.id) {
        gridMonitoringConnection.id = new Date().getTime().toString();
      }
      this.dialogRef.close(gridMonitoringConnection);
    }
  }

  public typeChanged(type: GridMonitoringConnectionType) {
    if (this.ecowattConnection && type !== GridMonitoringConnectionType.ECOWATT) {
      delete this.ecowattConnection;
    }
  }
}
