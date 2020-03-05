import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { ChipType } from 'app/types/GlobalType';
import { Tag } from '../../../types/Tag';

@Component({
  selector: 'app-tag-status-formatter',
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.active | appFormatTagStatus:'class'" [disabled]="true">
        {{row.active | appFormatTagStatus:'text' | translate}}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class TagStatusFormatterComponent extends CellContentTemplateComponent {
  @Input() row!: Tag;
}

@Pipe({name: 'appFormatTagStatus'})
export class AppFormatTagStatusPipe implements PipeTransform {
  transform(active: boolean, type: string): string {
    if (type === 'class') {
      return this.buildTagStatusClasses(active);
    }
    if (type === 'text') {
      return this.buildTagStatusText(active);
    }
    return '';
  }

  buildTagStatusClasses(active: boolean): string {
    return `chip-width-5em ${active ? ChipType.SUCCESS : ChipType.DANGER}`;
  }

  buildTagStatusText(active: boolean): string {
    return active ? 'tags.activated' : 'tags.deactivated';
  }
}
