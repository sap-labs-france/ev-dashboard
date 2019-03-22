import {Component, OnInit} from '@angular/core';
import {TenantsDataSource} from './tenants-data-source-table';

@Component({
  selector: 'app-tenants-cmp',
  templateUrl: 'tenants.component.html',
  providers: [
    TenantsDataSource
  ]
})
export class TenantsComponent implements OnInit {
  constructor(
    public tenantsDataSource: TenantsDataSource) {
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
