import { Component } from '@angular/core';

import { RegistrationTokensTableDataSource } from './registration-tokens-table-data-source';

@Component({
  selector: 'app-charging-stations-connection',
  templateUrl: 'registration-tokens.component.html',
  providers: [RegistrationTokensTableDataSource],
})
export class RegistrationTokensComponent {
  constructor(
    public registrationTokenDataSource: RegistrationTokensTableDataSource,
    ) {
    }
}
  