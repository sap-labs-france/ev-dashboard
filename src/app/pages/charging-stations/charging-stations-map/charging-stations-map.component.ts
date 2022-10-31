import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';
import { CentralServerService } from 'services/central-server.service';
import { ConfigService } from 'services/config.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { WindowService } from 'services/window.service';
import { ChargePointStatus, ChargingStation, Connector } from 'types/ChargingStation';
import { ChargingStationsMapActionsDialogData, ChargingStationsMapActionsDialogResult } from 'types/Dialog';
import { FilterParams } from 'types/GlobalType';
import { Constants } from 'utils/Constants';
import { Utils } from 'utils/Utils';

import { ChargingStationsMapActionsDialogComponent } from './charging-station-map-actions/charging-station-map-actions-dialog-component';
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
  public filterbarVisible = true;
  public toolbarVisible = true;
  public enableAction = true;

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
    public windowService: WindowService,
    private messageService: MessageService,
    private configService: ConfigService,
    private dialog: MatDialog,
  ) {
    // Show/Hide Filters
    this.windowService.getFilterbarVisibleSubject().subscribe((filterAreaVisible) => {
      this.filterbarVisible = filterAreaVisible;
    });
    const showFilterbar = this.windowService.getUrlParameterValue('ShowFilterbar');
    if (showFilterbar) {
      this.filterbarVisible = Utils.convertToBoolean(showFilterbar);
    }
    // Show/Hide Toolbar
    const showToolbar = this.windowService.getUrlParameterValue('ShowToolbar');
    if (showToolbar) {
      this.toolbarVisible = Utils.convertToBoolean(showToolbar);
    }
    // Enable Actions
    const enableAction = this.windowService.getUrlParameterValue('EnableAction');
    if (enableAction) {
      this.enableAction = Utils.convertToBoolean(enableAction);
    }
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
      ProjectFields: 'id|coordinates|issuer|connectors.status',
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
    if (this.enableAction) {
      // Get the Marker
      const marker = this.getMarkerByCoordinates(positionClicked);
      // Get the Charging Station
      const chargingStation = this.getChargingStationByID(marker.getTitle());
      // Open the dialog
      const dialogConfig = new MatDialogConfig<ChargingStationsMapActionsDialogData>();
      dialogConfig.minWidth = '30vw';
      dialogConfig.panelClass = '';
      // Build dialog data
      dialogConfig.data = {
        dialogData: {
          marker,
          chargingStation,
        },
      };
      // Show
      this.dialog.open<ChargingStationsMapActionsDialogComponent, ChargingStationsMapActionsDialogData, ChargingStationsMapActionsDialogResult>(
        ChargingStationsMapActionsDialogComponent, dialogConfig);
    }
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

  private getMarkerByCoordinates(coordinates: { latLng: google.maps.LatLng }): google.maps.Marker {
    for (const marker of this.markersMap.values()) {
      if (marker.getPosition().equals(coordinates.latLng)) {
        return marker;
      }
    }
  }

  private getChargingStationByID(chargingStationID: string): ChargingStation {
    for (const chargingStation of this.chargingStations) {
      if (chargingStation.id === chargingStationID) {
        return chargingStation;
      }
    }
  }
}
