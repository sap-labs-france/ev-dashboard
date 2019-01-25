import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from 'app/services/authorization-service';

@Component({
  templateUrl: 'charging-stations.component.html'
})
export class ChargingStationsComponent implements OnInit {
  isAdmin: boolean;
  constructor (
    private authorizationService: AuthorizationService
  ) {
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  ngOnInit() {
  }
}
