import { Component, Input } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { Company } from 'app/types/Company';

@Component({
  template: `
    <div class="logo-container">
      <img *ngIf="row.logo" class="app-companies-logo" [src]='row.logo'>
    </div>
  `,
})

export class CompanyLogoFormatterComponent extends CellContentTemplateComponent {
  @Input() row!: Company;

}
