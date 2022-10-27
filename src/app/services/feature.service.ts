import { Injectable } from '@angular/core';

import { TenantFeatures } from '../types/Tenant';
import { CentralServerService } from './central-server.service';

@Injectable()
export class FeatureService {
  private activeFeatures!: string[];

  public constructor(
    private centralServerService: CentralServerService) {
    this.centralServerService.getCurrentUserSubject().subscribe((user) => {
      this.activeFeatures = user?.activeFeatures;
    });
  }

  public isActive(featureName: TenantFeatures): boolean {
    if (this.activeFeatures) {
      return this.activeFeatures.includes(featureName);
    }
    return false;
  }

  public getActiveFeatures(): string[] {
    return this.activeFeatures;
  }
}
