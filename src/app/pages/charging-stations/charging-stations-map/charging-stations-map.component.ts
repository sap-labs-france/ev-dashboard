import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { Router } from '@angular/router';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';
import { CentralServerService } from 'services/central-server.service';
import { ConfigService } from 'services/config.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { ChargePointStatus, ChargingStation, Connector } from 'types/ChargingStation';
import { ButtonAction, FilterParams } from 'types/GlobalType';
import { Constants } from 'utils/Constants';
import { Utils } from 'utils/Utils';

import { WindowService } from '../../../services/window.service';
import { ChargingStationsMapCustomClusterRenderer } from './charging-stations-map-custom-cluster-renderer';

@Component({
  selector: 'app-charging-stations-map',
  templateUrl: './charging-stations-map.component.html',
})
export class ChargingStationsMapComponent implements OnInit, AfterViewInit {
  @ViewChild(GoogleMap, { static: false }) public googleMapService!: GoogleMap;
  @ViewChild('searchInput') public searchInput!: ElementRef;

  public mapOptions: google.maps.MapOptions;
  public center: google.maps.LatLngLiteral;
  public zoom = 4;
  public chargingStations: ChargingStation[] = [];
  public loading = false;

  private markerCluster: MarkerClusterer;
  private markersMap: Map<string, google.maps.Marker> = new Map();
  private markerLabelsVisible = false;
  private bounds = new google.maps.LatLngBounds();
  private searchValue = '';

  public constructor(
    private centralServerService: CentralServerService,
    private spinnerService: SpinnerService,
    private router: Router,
    private zone: NgZone,
    private messageService: MessageService,
    private configService: ConfigService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private windowService: WindowService
  ) {
    // Set default params
    this.center = {
      lat: 51.476852,
      lng: -0.000500
    };
    this.zoom = 10;
    this.mapOptions = {
      zoomControl: true,
      mapTypeId: 'terrain',
      styles: [
        {
          featureType: 'poi',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'transit',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
      ],
    };
  }

  public ngOnInit(): void {
    this.loadMapData(false, true);
  }

  public ngAfterViewInit() {
    // Init marker cluster
    this.markerCluster = new MarkerClusterer({
      map: this.googleMapService.googleMap,
      markers: [],
      renderer: new ChargingStationsMapCustomClusterRenderer()
    });
    // Init Search
    fromEvent(this.searchInput.nativeElement, 'input').pipe(
      map((e: KeyboardEvent) => e.target['value']),
      debounceTime(this.configService.getAdvanced().debounceTimeSearchMillis),
      distinctUntilChanged(),
    ).subscribe((text: string) => {
      this.searchValue = text;
      this.loadMapData();
    });
  }

  public loadMapData(autoRefresh = false, initialLoading = false) {
    this.loading = true;
    const params: FilterParams = {
      ProjectFields: 'id|coordinates|connectors.status',
      WithAuth: 'false',
      Search: this.searchValue,
    };
    if (initialLoading || !autoRefresh) {
      this.spinnerService.show();
    }
    this.centralServerService.getChargingStations(params, Constants.MAX_PAGING).subscribe({
      next: (chargingStations) => {
        // Keep the new result
        this.chargingStations = chargingStations.result;
        // Clean up Markers
        if (!initialLoading) {
          this.cleanUpMarkers();
        }
        // Add or Update Markers
        this.addOrUpdateMarkers(initialLoading);
        // Hide spinner
        if (initialLoading || !autoRefresh) {
          this.spinnerService.hide();
        }
        this.loading = false;
      },
      error: (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      }
    });
  }

  public markerClicked(positionClicked: { latLng: google.maps.LatLng }) {
    // Find Marker
    let foundMarker;
    for (const marker of this.markersMap.values()) {
      if (marker.getPosition().equals(positionClicked.latLng)) {
        foundMarker = marker;
        break;
      }
    }
    this.dialogService.createAndShowDialog(
      foundMarker.getTitle(),
      `${this.translateService.instant('chargers.map.marker_dialog_text', { chargingStationID: foundMarker.getTitle() })}`,
      [
        { id: ButtonAction.COPY, color: 'primary', name: 'chargers.map.copy_map_url' },
        { id: ButtonAction.OPEN_URL, color: 'primary', name: 'chargers.map.navigate_to_charging_station' },
      ]
    ).subscribe({
      next: (result: ButtonAction) => {
        switch (result) {
          case ButtonAction.COPY:
            Utils.copyToClipboard(
              Utils.getGoogleMapUrlFromCoordinates([foundMarker.getPosition().lng(), foundMarker.getPosition().lat()]),
              this.translateService.instant('chargers.map.copy_map_url_to_clipboard')
            );
            this.messageService.showInfoMessage('general.url_copied');
            break;
          case ButtonAction.OPEN_URL:
            this.windowService.openUrl(`charging-stations#all?Search=${foundMarker.getTitle()}`);
            break;
        }
      }
    });
  }

  public resetZoom() {
    this.googleMapService.fitBounds(this.bounds);
  }

  public zoomChanged() {
    this.updateMarkerLabels();
  }

  public resetSearchFilter() {
    this.searchInput.nativeElement.value = '';
    this.searchValue = '';
    this.loadMapData();
  }

  private updateMarkerLabels() {
    const updateMarkerLabels = this.canUpdateMarkerLabels();
    if (!updateMarkerLabels) {
      return;
    }
    this.markerLabelsVisible = !this.markerLabelsVisible;
    for (const marker of this.markersMap.values()) {
      this.updateMarkerLabel(marker);
    }
  }

  private updateMarkerLabel(marker: google.maps.Marker) {
    if (this.markerLabelsVisible) {
      marker.setLabel({
        text: marker.getTitle(),
        className: 'bg-dark p-1 border border-white rounded opacity-75',
        color: 'white'
      });
    } else {
      marker.setLabel(null);
    }
  }

  private canUpdateMarkerLabels(): boolean {
    let updateMarkerLabels = false;
    if (this.googleMapService.getZoom() >= 12) {
      // Display marker labels
      if (this.markerLabelsVisible) {
        // Already displayed
        return updateMarkerLabels;
      }
      updateMarkerLabels = true;
    } else {
      // Hide marker labels
      if (!this.markerLabelsVisible) {
        // Already hidden
        return updateMarkerLabels;
      }
      updateMarkerLabels = true;
    }
    return updateMarkerLabels;
  }

  private getIconColorAccordingToConnectorStatus(connectors: Connector[]): string {
    if (connectors.find((connector) => connector.status === ChargePointStatus.AVAILABLE)) {
      return '/assets/img/map/ev_station_success.svg';
    }
    if (connectors.find((connector) => [
      ChargePointStatus.FINISHING, ChargePointStatus.PREPARING].includes(connector.status))) {
      return '/assets/img/map/ev_station_warning.svg';
    }
    if (connectors.find((connector) => [
      ChargePointStatus.CHARGING, ChargePointStatus.OCCUPIED,
      ChargePointStatus.SUSPENDED_EVSE, ChargePointStatus.SUSPENDED_EV].includes(connector.status))) {
      return '/assets/img/map/ev_station_info.svg';
    }
    if (connectors.find((connector) => connector.status === ChargePointStatus.FAULTED)) {
      return '/assets/img/map/ev_station_danger.svg';
    }
    return '/assets/img/map/ev_station_unknown.svg';
  }

  private addOrUpdateMarkers(initialLoading: boolean) {
    let marker: google.maps.Marker;
    const labelOrigin = new google.maps.Point(15, -10);
    // Compute the bounds of the map
    for (const chargingStation of this.chargingStations) {
      // Build coordinates
      const latLng: google.maps.LatLngLiteral = {
        lng: chargingStation.coordinates[0],
        lat: chargingStation.coordinates[1]
      };
      if (Utils.isNullOrUndefined(latLng.lat) || Utils.isNullOrUndefined(latLng.lng)) {
        continue;
      }
      // Check in already loaded Markers
      const foundMarker = this.markersMap.get(chargingStation.id);
      if (!foundMarker) {
        // No: Create a new one
        marker = new google.maps.Marker({
          title: chargingStation.id,
          map: this.googleMapService.googleMap,
          position: latLng,
          icon: {
            url: this.getIconColorAccordingToConnectorStatus(chargingStation.connectors),
            labelOrigin,
          }
        });
        // Add Click event
        marker.addListener('click', (positionClicked: { latLng: google.maps.LatLng }) => {
          this.zone.run(() => {
            this.markerClicked(positionClicked);
          });
        });
        // Keep in cache
        this.markersMap.set(chargingStation.id, marker);
        // Check label
        this.updateMarkerLabel(marker);
        // Add in Cluster Marker
        this.markerCluster.addMarker(marker);
      } else {
        // Only update the existing Marker
        foundMarker.setPosition(latLng);
        foundMarker.setIcon({
          url: this.getIconColorAccordingToConnectorStatus(chargingStation.connectors),
          labelOrigin,
        });
      }
      // Extend only at first loading
      if (initialLoading) {
        this.bounds.extend(latLng);
      }
    }
    // Show all Markers
    if (!Utils.isEmptyArray(this.chargingStations) && initialLoading) {
      this.googleMapService.fitBounds(this.bounds);
    }
  }

  private cleanUpMarkers() {
    // Get current Charging Station (used to remove deleted CS)
    const chargingStationIDsToRemoveSet = new Set<string>(
      this.markersMap.keys());
    // Compute the Charging Station to remove
    for (const chargingStation of this.chargingStations) {
      chargingStationIDsToRemoveSet.delete(chargingStation.id);
    }
    for (const chargingStationID of chargingStationIDsToRemoveSet.keys()) {
      // Remove from Cluster Marker
      this.markerCluster.removeMarker(
        this.markersMap.get(chargingStationID));
      // Remove from cache
      this.markersMap.delete(chargingStationID);
    }
  }
}
