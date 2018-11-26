import {Component} from '@angular/core';

export const TYPE_PRIMARY = 'chip-primary';
export const TYPE_DEFAULT = 'chip-default';
export const TYPE_INFO = 'chip-info';
export const TYPE_SUCCESS = 'chip-success';
export const TYPE_DANGER = 'chip-danger';
export const TYPE_WARNING = 'chip-warning';

@Component({
  selector: 'app-chip',
  styleUrls: ['./chip.component.scss'],
  template: `
      <mat-chip-list>
          <mat-chip [ngClass]="type ? type : TYPE_PRIMARY">{{text | translate}}</mat-chip>
      </mat-chip-list>`
})
export class ChipComponent {
  text: String;
  type: String;
}
