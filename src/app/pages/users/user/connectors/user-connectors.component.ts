import { Component, Input, OnChanges } from '@angular/core';
import { CentralServerService } from 'services/central-server.service';
import { IntegrationConnection } from 'types/Connection';
import { User } from 'types/User';

@Component({
  selector: 'app-user-connectors',
  templateUrl: 'user-connectors.component.html',
})
// @Injectable()
export class UserConnectorsComponent implements OnChanges {
  @Input() public user!: User;

  public integrationConnections!: IntegrationConnection[];

  // eslint-disable-next-line no-useless-constructor
  public constructor(private centralServerService: CentralServerService) {}

  public ngOnChanges(): void {
    this.loadConnections();
  }

  public onConnectorChanged() {
    this.loadConnections();
  }

  private loadConnections() {
    if (this.user) {
      this.centralServerService.getIntegrationConnections(this.user.id).subscribe((connections) => {
        this.integrationConnections = connections.result;
      });
    }
  }
}
