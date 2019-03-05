import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../../services/window.service';
import {MatTabChangeEvent} from '@angular/material';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

export class AbstractTabComponent implements OnDestroy {
  public activeTabIndex = 0;

  private _updatedRoutes = [];
  private _fragmentSubscription: Subscription;
  private _isDetroyed: boolean;

  constructor(protected activatedRoute: ActivatedRoute, protected windowService: WindowService,
      protected hashArray: string[], defaultIndex?: number
      ) {
    this._fragmentSubscription = activatedRoute.fragment.subscribe(fragment => {
      let str = 'activatedRoutes for ' + fragment + ' Start _updatedRoutes: ' + this._updatedRoutes.toString();
      if (!this._isDetroyed) {
        if (this._updatedRoutes.length > 0 && this._updatedRoutes[0] === fragment) {
          // Route is coming from click event so do not consider it
          this._updatedRoutes.shift();
          str += ' IGNORED ';
        } else {
          const indexOf = this.hashArray.indexOf(fragment);
          if (indexOf >= 0) {
            str += ' INDEX ' + indexOf;
            this.activeTabIndex = indexOf;
          }
        }

        str += ' End _updatedRoutes: ' + this._updatedRoutes.toString();
      }
      console.log(str + ' ' + this.constructor.name);
    });
    // Set default route
    if (defaultIndex && defaultIndex < this.hashArray.length && defaultIndex >= 0) {
      this.activeTabIndex = defaultIndex;
    }
    this.windowService.setHash(this.hashArray[this.activeTabIndex]);
    this._isDetroyed = false;
  }

  updateRoute(index: number) {
    if (this.activeTabIndex !== index) {
      let str = 'updateRoute for ' + this.hashArray[index] + ' Start _updatedRoutes: ' + this._updatedRoutes.toString();
      if (this.hashArray && index < this.hashArray.length) {
        // Save route activated from click within a FIFO
        this._updatedRoutes.push(this.hashArray[index]);
        str += ' End _updatedRoutes: ' + this._updatedRoutes.toString();
        console.log(str + ' ' + this.constructor.name);
        this.windowService.setHash(this.hashArray[index]);
      }
    }
  }

  ngOnDestroy(): void {
    console.log('Destroy fragment subscription ' + this.constructor.name);
    this._fragmentSubscription.unsubscribe();
    this._isDetroyed = true;
  }
}
