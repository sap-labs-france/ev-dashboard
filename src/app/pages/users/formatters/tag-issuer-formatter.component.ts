import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateDirective } from 'app/shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from 'app/types/GlobalType';

import { Tag } from '../../../types/Tag';

@Component({
  selector: 'app-tag-issuer-formatter',
  template: `
  <mat-chip-list [selectable]="false">
    <mat-chip [ngClass]="row.issuer | appFormatTagIssuer:'class'" [disabled]="true">
      {{row.issuer | appFormatTagIssuer:'text' | translate}}
    </mat-chip>
  </mat-chip-list>
`,
})
export class TagIssuerFormatterComponent extends CellContentTemplateDirective {
  @Input() public row!: Tag;
}

@Pipe({ name: 'appFormatTagIssuer' })
export class AppFormatTagIssuerPipe implements PipeTransform {
  public transform(issuer: boolean, type: string): string {
    if (type === 'class') {
      return this.buildTagIssuerClasses(issuer);
    }
    if (type === 'text') {
      return this.buildTagIssuerText(issuer);
    }
    return '';
  }

  public buildTagIssuerClasses(issuer: boolean): string {
    return `chip-width-14em ${issuer ? ChipType.SUCCESS : ChipType.DANGER}`;
  }

  public buildTagIssuerText(issuer: boolean): string {
    return issuer ? 'issuer.local' : 'issuer.foreign';
  }
}
