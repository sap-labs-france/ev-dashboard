import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../../services/window.service';
import {OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {takeWhile} from 'rxjs/operators';

export class AbstractTabComponent implements OnDestroy {
  public activeTabIndex = 0;

  private _fragmentSubscription: Subscription;
  private _isDetroyed: boolean;

  constructor(protected activatedRoute: ActivatedRoute, protected windowService: WindowService,
              protected hashArray: string[], protected synchronizeRouting: boolean = true, protected defaultIndex: number = 0) {
    if (this.synchronizeRouting) {
      this.enableRoutingSynchronization();
    }
  }

  updateRoute(index: number) {
    if (this._fragmentSubscription && this.activeTabIndex !== index) {
      if (this.hashArray && index < this.hashArray.length) {
        this.windowService.setHash(this.hashArray[index]);
      }
    }
  }

  ngOnDestroy(): void {
    this.disableRoutingSynchronization();
    this._isDetroyed = true;
  }

  enableRoutingSynchronization() {
    if (!this._fragmentSubscription) {
      this._fragmentSubscription = this.activatedRoute.fragment.pipe(takeWhile(() => !this._isDetroyed)).subscribe(fragment => {
        if (!this._isDetroyed && fragment) {
          const indexOf = this.hashArray.indexOf(fragment);
          if (indexOf >= 0 && this.activeTabIndex !== indexOf) {
            this.activeTabIndex = indexOf;
          }
        }
      });
      // Set default route
      if (this.defaultIndex && this.defaultIndex < this.hashArray.length && this.defaultIndex >= 0) {
        this.activeTabIndex = this.defaultIndex;
      }
      this.windowService.setHash(this.hashArray[this.activeTabIndex]);
      this._isDetroyed = false;
    }
  }

  disableRoutingSynchronization() {
    if (this._fragmentSubscription) {
      this._fragmentSubscription.unsubscribe();
      this._fragmentSubscription = null;
    }
  }
}
