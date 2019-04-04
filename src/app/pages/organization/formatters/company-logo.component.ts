import { Component, Input } from '@angular/core';
import { Company } from 'app/common.types';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';

@Component({
  selector: 'app-company-logo',
  template: `
    <div class="logo-container">
      <img *ngIf="row.logo" class="app-companies-logo" [src]='row.logo'>
    </div>
  `
})

export class CompanyLogoComponent extends CellContentTemplateComponent {
  @Input() row: Company;

}
