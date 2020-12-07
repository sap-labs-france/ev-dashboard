import { Component, Input } from '@angular/core';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { Tenant } from '../../../types/Tenant';

@Component({
  template: `
    <div class="logo-container">
      <img *ngIf="row.logo" class="app-tenants-logo" [src]='row.logo' alt="">
    </div>
  `,
})

export class TenantLogoFormatterCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Tenant;

}
