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

  public markers: google.maps.Marker[] = [];
  public center: google.maps.LatLngLiteral;
  public mapOptions: google.maps.MapOptions;
  public zoom = 4;
  public chargingStations: ChargingStation[] = [];
  public bounds = new google.maps.LatLngBounds();
  public loading = false;
  public searchValue = '';

  private markerCluster: MarkerClusterer;
  private markerLabelsVisible = false;

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
    if (!Utils.isEmptyArray(this.chargingStations)) {
      this.chargingStations = [];
    }
    // Clear the Map
    if (!Utils.isEmptyArray(this.markers)) {
      // Clear marker from clusters
      this.markerCluster.clearMarkers();
      // Remove marker from the map
      for (const marker of this.markers) {
        marker.setMap(null);
      }
      this.markers = [];
    }
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
        let marker: google.maps.Marker;
        const labelOrigin = new google.maps.Point(15, -10);
        this.chargingStations = chargingStations.result;
        // Compute the bounds of the map
        for (const chargingStation of chargingStations.result) {
          // Build coordinates
          const latLng: google.maps.LatLngLiteral = {
            lng: chargingStation.coordinates[0],
            lat: chargingStation.coordinates[1]
          };
          if (Utils.isNullOrUndefined(latLng.lat) || Utils.isNullOrUndefined(latLng.lng)) {
            continue;
          }
          // Create and add the Marker
          marker = new google.maps.Marker({
            title: chargingStation.id,
            map: this.googleMapService.googleMap,
            position: latLng,
            icon: {
              url: this.getIconColorAccordingToConnectorStatus(chargingStation.connectors),
              labelOrigin,
            }
          });
          marker.addListener('click', (positionClicked: { latLng: google.maps.LatLng }) => {
            this.zone.run(() => {
              this.markerClicked(positionClicked);
            });
          });
          this.markers.push(marker);
          this.bounds.extend(latLng);
        }
        // Add markers to cluster
        this.markerCluster.addMarkers(this.markers);
        // Show all Markers
        if (!Utils.isEmptyArray(chargingStations.result) && initialLoading) {
          this.googleMapService.fitBounds(this.bounds);
        }
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
    const markerClicked = this.markers.find(
      (marker) => marker.getPosition().equals(positionClicked.latLng));
    this.dialogService.createAndShowDialog(
      markerClicked.getTitle(),
      `${this.translateService.instant('chargers.map.marker_dialog_text', { chargingStationID: markerClicked.getTitle() })}`,
      [
        { id: ButtonAction.COPY, color: 'primary', name: 'chargers.map.copy_map_url' },
        { id: ButtonAction.OPEN_URL, color: 'primary', name: 'chargers.map.navigate_to_charging_station' },
      ]
    ).subscribe({
      next: (result: ButtonAction) => {
        switch (result) {
          case ButtonAction.COPY:
            Utils.copyToClipboard(
              Utils.getGoogleMapUrlFromCoordinates([markerClicked.getPosition().lng(), markerClicked.getPosition().lat()])
            );
            break;
          case ButtonAction.OPEN_URL:
            this.windowService.openUrl(`charging-stations#all?Search=${markerClicked.getTitle()}`);
            break;
        }
      }
    });
  }

  public resetZoom() {
    this.googleMapService.fitBounds(this.bounds);
  }

  public zoomChanged() {
    this.updateMarkerProps();
  }

  public resetSearchFilter() {
    this.searchInput.nativeElement.value = '';
    this.searchValue = '';
    this.loadMapData();
  }

  private updateMarkerProps() {
    const updateMarkerLabels = this.canUpdateMarkerLabels();
    if (!updateMarkerLabels) {
      return;
    }
    for (const marker of this.markers) {
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
      this.markerLabelsVisible = true;
    } else {
      // Hide marker labels
      if (!this.markerLabelsVisible) {
        // Already hidden
        return updateMarkerLabels;
      }
      updateMarkerLabels = true;
      this.markerLabelsVisible = false;
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
}
