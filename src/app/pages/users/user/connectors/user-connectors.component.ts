import { Component, Input, OnInit } from '@angular/core';
import { CentralServerService } from 'services/central-server.service';
import { IntegrationConnection } from 'types/Connection';

@Component({
  selector: 'app-user-connectors',
  templateUrl: './user-connectors.component.html',
})
// @Injectable()
export class UserConnectorsComponent implements OnInit {
  @Input() public currentUserID!: string;

  public integrationConnections!: IntegrationConnection[];

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService) {
  }

  public ngOnInit(): void {
    this.loadConnections();
  }

  public onConnectorChanged() {
    this.loadConnections();
  }

  private loadConnections() {
    if (this.currentUserID) {
      this.centralServerService.getIntegrationConnections(this.currentUserID).subscribe((connections) => {
        this.integrationConnections = connections.result;
      });
    }
  }
}
