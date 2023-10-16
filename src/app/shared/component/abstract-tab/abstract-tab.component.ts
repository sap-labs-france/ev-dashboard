import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { WindowService } from '../../../services/window.service';

@Injectable()
export class AbstractTabComponent implements OnDestroy {
  public activeTabIndex = 0;

  protected constructor(
    protected activatedRoute: ActivatedRoute,
    protected windowService: WindowService,
    protected hashArray: string[],
    protected synchronizeRouting: boolean = true,
    protected defaultIndex: number = 0
  ) {
    const currentHash = this.windowService.getHash();
    if (currentHash) {
      const indexOf = this.hashArray.indexOf(currentHash);
      if (indexOf >= 0 && this.activeTabIndex !== indexOf) {
        this.activeTabIndex = indexOf;
      }
    } else {
      if (
        this.defaultIndex &&
        this.defaultIndex < this.hashArray.length &&
        this.defaultIndex >= 0
      ) {
        this.activeTabIndex = this.defaultIndex;
      }
      if (this.synchronizeRouting) {
        this.windowService.setHash(this.hashArray[this.activeTabIndex]);
      }
    }
  }

  public setHashArray(hashArray: string[]) {
    this.hashArray = hashArray;
  }

  public updateRoute(index: number) {
    if (this.synchronizeRouting) {
      if (this.hashArray && index < this.hashArray.length) {
        this.windowService.clearUrlParameter();
        this.windowService.setHash(this.hashArray[index]);
      }
    }
  }

  public ngOnDestroy(): void {
    this.synchronizeRouting = false;
  }

  public enableRoutingSynchronization() {
    this.synchronizeRouting = true;
    this.windowService.setHash(this.hashArray[this.activeTabIndex]);
  }
}
