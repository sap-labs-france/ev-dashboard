import { Component, OnInit } from '@angular/core';
import { RegistrationTokensTableDataSource } from './registration-tokens/registration-tokens-table-data-source';

@Component({
  selector: 'app-settings-ocpp',
  templateUrl: 'settings-ocpp.component.html',
  providers: [RegistrationTokensTableDataSource],
})
export class SettingsOcppComponent implements OnInit {
  public isActive = true;

  constructor(
    public registrationTokenDataSource: RegistrationTokensTableDataSource,
  ) {
  }

  ngOnInit(): void {
  }
}
