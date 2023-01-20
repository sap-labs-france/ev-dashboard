import { Cluster, ClusterStats, Renderer } from '@googlemaps/markerclusterer';

export class ChargingStationsMapCustomClusterRenderer implements Renderer {
  public render({ count, position }: Cluster, stats: ClusterStats): google.maps.Marker {
    return new google.maps.Marker({
      position,
      icon: {
        url: `/assets/img/map/cluster-marker.svg`,
        scaledSize: new google.maps.Size(65, 65),
      },
      label: {
        text: String(count),
        color: '#05427d',
        fontWeight: 'bold',
        fontSize: '20px',
      },
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
    });
  }
}
