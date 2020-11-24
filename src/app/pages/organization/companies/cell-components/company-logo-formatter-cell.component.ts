import { Component, Input } from '@angular/core';

import { CellContentTemplateDirective } from '../../../../shared/table/cell-content-template/cell-content-template.directive';
import { Company } from '../../../../types/Company';

@Component({
  template: `
    <div class="logo-container">
      <img *ngIf="row['logo']" class="app-company-logo" alt="" [src]="row['logo']">
    </div>
  `,
})

export class CompanyLogoFormatterCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Company;

}
