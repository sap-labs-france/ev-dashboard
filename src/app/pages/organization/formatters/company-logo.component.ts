import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Company} from 'app/common.types';

@Component({
  selector: 'app-company-logo',
  styleUrls: ['company-logo.component.scss'],
  template: `
    <div class="logo-container">
      <img *ngIf="logo" class="companies-logo" [src]='logo'>
    </div>
  `
})

export class CompanyLogoComponent implements OnInit {
  @Input() row: Company;
  logo: any;

  constructor() {

  }

  ngOnInit(): void {
    if (this.row && this.row.logo) {
      this.logo = this.row.logo;
    }
  }



}
