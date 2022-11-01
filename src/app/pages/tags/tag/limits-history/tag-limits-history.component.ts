import { Component, Input, OnChanges, OnInit, Self, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DialogMode, TagsAuthorizations } from 'types/Authorization';

import { Tag } from '../../../../types/Tag';
import { TagLimitsHistoryTableDataSource } from './tag-limits-history-table-data-source';

@Component({
  selector: 'app-tag-limits-history',
  providers: [TagLimitsHistoryTableDataSource],
  templateUrl: 'tag-limits-history.component.html'
})
export class TagLimitsHistoryComponent implements OnInit, OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public tag!: Tag;
  @Input() public tagsAuthorizations!: TagsAuthorizations;
  @Input() public dialogMode!: DialogMode;

  public readonly DialogMode = DialogMode;
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    @Self() public tagLimitsHistoryTableDataSource: TagLimitsHistoryTableDataSource) {
  }

  public ngOnInit(): void {
    this.loadTag();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.loadTag();
  }

  private loadTag(): void {
    // Set the Tag
    this.tagLimitsHistoryTableDataSource.setTag(this.tag);
    // Reload data
    this.tagLimitsHistoryTableDataSource.refreshData(false).subscribe();
  }
}
