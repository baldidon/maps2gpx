import { Component, input, effect, OnDestroy, viewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-route-map',
  standalone: true,
  templateUrl: './route-map.html',
})
export class RouteMapComponent implements OnDestroy {
  points = input.required<{ lat: number; lng: number }[]>();

  private mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private map: L.Map | null = null;
  private routeLayer: L.Polyline | null = null;
  private markers: L.Marker[] = [];

  constructor() {
    effect(() => {
      const pts = this.points();
      if (pts.length > 0) {
        setTimeout(() => this.renderRoute(pts), 0);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private renderRoute(points: { lat: number; lng: number }[]): void {
    if (!this.map) {
      this.map = L.map(this.mapEl().nativeElement).setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);
    }

    this.markers.forEach((m) => this.map!.removeLayer(m));
    this.markers = [];

    if (this.routeLayer) {
      this.map!.removeLayer(this.routeLayer);
    }

    const latLngs: L.LatLngExpression[] = points.map(
      (p) => [p.lat, p.lng] as L.LatLngExpression,
    );

    this.routeLayer = L.polyline(latLngs, {
      color: '#2563eb',
      weight: 4,
      opacity: 0.8,
    }).addTo(this.map!);

    this.map!.fitBounds(this.routeLayer.getBounds(), { padding: [20, 20] });

    const first = points[0];
    const last = points[points.length - 1];
    this.markers.push(
      L.marker([first.lat, first.lng]).addTo(this.map!).bindPopup('Partenza'),
      L.marker([last.lat, last.lng]).addTo(this.map!).bindPopup('Arrivo'),
    );
  }
}
