import { Component } from '@angular/core';

import { ChargingStationsRegistrationTokensTableDataSource } from './charging-stations-registration-tokens-table-data-source';

@Component({
  selector: 'app-charging-stations-registration-tokens',
  templateUrl: 'charging-stations-registration-tokens.component.html',
  providers: [ChargingStationsRegistrationTokensTableDataSource],
})
export class ChargingStationsRegistrationTokensComponent {
  constructor(
    public registrationTokenDataSource: ChargingStationsRegistrationTokensTableDataSource,
  ) {
  }
}
  