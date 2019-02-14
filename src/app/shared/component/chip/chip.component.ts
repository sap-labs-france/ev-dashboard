import {Component, OnInit} from '@angular/core';
import {CellContentTemplateComponent} from '../../table/cell-content-template/cell-content-template.component';

export const TYPE_PRIMARY = 'chip-primary';
export const TYPE_DEFAULT = 'chip-default';
export const TYPE_INFO = 'chip-info';
export const TYPE_SUCCESS = 'chip-success';
export const TYPE_DANGER = 'chip-danger';
export const TYPE_WARNING = 'chip-warning';
export const TYPE_GREY = 'chip-grey';

@Component({
  selector: 'app-chip',
  styleUrls: ['chip.component.scss'],
  templateUrl: 'chip.component.html'
})
export abstract class ChipComponent extends CellContentTemplateComponent implements OnInit {
  text: String;
  type: String;

  ngOnInit(): void {
    this.loadContent();
  }

  refresh(): void {
    this.loadContent();
  }

  abstract loadContent(): void;
}
