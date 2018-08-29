import { BehaviorSubject, Observable } from 'rxjs';
import { ElementRef } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { CollectionViewer } from '@angular/cdk/collections';
import { TableColumnDef } from '../../model/table-column-def';
import { Paging } from '../../model/paging';
import { Ordering } from '../../model/ordering';

interface TableSearch {
    search: string;
}

export abstract class TableDataSource<T> {
  private subject = new BehaviorSubject<T[]>([]);
  private searchInput: ElementRef;
  private paginator: MatPaginator;
  private sort: MatSort;

  getSubjet(): BehaviorSubject<T[]> {
      return this.subject;
  }

  setPaginator(paginator: MatPaginator) {
      this.paginator = paginator;
  }

  getPaginator(): MatPaginator {
      return this.paginator;
  }

  setSort(sort: MatSort) {
      this.sort = sort;
  }

  getSort(): MatSort {
      return this.sort;
  }

  setSearchInput(searchInput: ElementRef) {
      this.searchInput = searchInput;
  }

  connect(collectionViewer: CollectionViewer): Observable<T[]> {
      return this.subject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
      this.subject.complete();
  }

  updatePaginator() {
      this.paginator.length = Math.trunc(this.getNumberOfRecords() / this.paginator.pageSize);
  }

  getPaginatorPageSizes() {
      return [15, 25, 50, 100];
  }

  getSearch(): TableSearch {
      return { search: this.searchInput.nativeElement.value };
  }

  getPaging(): Paging {
      return {
          skip: this.getPaginator().pageIndex * this.getPaginator().pageSize,
          limit: this.getPaginator().pageSize
      };
  }

  getOrdering(): Ordering[] {
      return [
          { field: this.getSort().active, direction: this.getSort().direction }
      ]
  }

  abstract getNumberOfRecords(): number;

  abstract getColumnDefs(): TableColumnDef[];
}
