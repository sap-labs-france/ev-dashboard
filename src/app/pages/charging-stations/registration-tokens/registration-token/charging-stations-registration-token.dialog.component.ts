import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AuthorizationDefinitionFieldMetadata,
  DataResultAuthorizations,
  DialogParamsWithAuth,
} from 'types/Authorization';
import { RegistrationToken } from 'types/RegistrationToken';

import { Utils } from '../../../../utils/Utils';
import { ChargingStationsRegistrationTokenComponent } from './charging-stations-registration-token.component';

@Component({
  template:
    '<app-charging-stations-registration-token #appRef [currentTokenID]="tokenID" [metadata]="metadata" [inDialog]="true" [dialogRef]="dialogRef"></app-charging-stations-registration-token>',
})
export class ChargingStationsRegistrationTokenDialogComponent implements AfterViewInit {
  @ViewChild('appRef') public appRef!: ChargingStationsRegistrationTokenComponent;
  public tokenID!: string;
  public metadata?: Record<string, AuthorizationDefinitionFieldMetadata>;

  public constructor(
    public dialogRef: MatDialogRef<ChargingStationsRegistrationTokenDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    dialogParams: DialogParamsWithAuth<RegistrationToken, DataResultAuthorizations>
  ) {
    this.tokenID = dialogParams.dialogData?.id;
    this.metadata = dialogParams.authorizations?.metadata;
  }

  public ngAfterViewInit() {
    Utils.registerSaveCloseKeyEvents(
      this.dialogRef,
      this.appRef.formGroup,
      this.appRef.saveToken.bind(this.appRef),
      this.appRef.close.bind(this.appRef)
    );
  }
}
