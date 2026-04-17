import { Component, signal, inject, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UrlParserService } from './services/url-parser.service';
import { GpxApiService } from './services/gpx-api.service';
import { Waypoint, RouteProfile, RouteResponse } from './models/route.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
})
export class App {
  private urlParser = inject(UrlParserService);
  private gpxApi = inject(GpxApiService);
  private map: L.Map | null = null;
  private routeLayer: L.Polyline | null = null;

  url = signal('');
  routeName = signal('');
  profile = signal<RouteProfile>('car');
  waypoints = signal<Waypoint[]>([]);
  error = signal('');
  loading = signal(false);
  result = signal<RouteResponse | null>(null);

  profiles: { value: RouteProfile; label: string }[] = [
    { value: 'car', label: 'Auto' },
    { value: 'bike', label: 'Bici' },
    { value: 'foot', label: 'A piedi' },
  ];

  constructor() {
    effect(() => {
      const res = this.result();
      if (res) {
        setTimeout(() => this.showRouteOnMap(res), 0);
      }
    });
  }

  parseUrl(): void {
    this.error.set('');
    this.result.set(null);

    try {
      const parsed = this.urlParser.extractWaypoints(this.url());
      this.waypoints.set(parsed);
    } catch (e: any) {
      this.error.set(e.message);
      this.waypoints.set([]);
    }
  }

  private showRouteOnMap(response: RouteResponse): void {
    if (!response.points || response.points.length === 0) return;

    if (!this.map) {
      this.map = L.map('map').setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);
    }

    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
    }

    const latLngs: L.LatLngExpression[] = response.points.map(
      (p) => [p.lat, p.lng] as L.LatLngExpression,
    );

    this.routeLayer = L.polyline(latLngs, {
      color: '#2563eb',
      weight: 4,
      opacity: 0.8,
    }).addTo(this.map);

    this.map.fitBounds(this.routeLayer.getBounds(), { padding: [20, 20] });

    const first = response.points[0];
    const last = response.points[response.points.length - 1];
    L.marker([first.lat, first.lng]).addTo(this.map).bindPopup('Partenza');
    L.marker([last.lat, last.lng]).addTo(this.map).bindPopup('Arrivo');
  }

  async generateGpx(): Promise<void> {
    if (this.waypoints().length < 2) {
      this.error.set('Servono almeno 2 waypoints');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    try {
      const response = await this.gpxApi.convertRouteToGpx({
        waypoints: this.waypoints(),
        profile: this.profile(),
        routeName: this.routeName() || undefined,
      });
      this.result.set(response);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }

  downloadGpx(): void {
    const res = this.result();
    if (res) {
      this.gpxApi.downloadGpx(res);
    }
  }

  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return (meters / 1000).toFixed(1) + ' km';
    }
    return meters.toFixed(0) + ' m';
  }

  resolving = signal(false);

  async onUrlInput(): Promise<void> {
    const url = this.url().trim();
    if (!url) {
      this.waypoints.set([]);
      this.error.set('');
      this.result.set(null);
      return;
    }

    const isShortUrl =
      url.includes('maps.app.goo.gl') ||
      url.includes('goo.gl/maps') ||
      url.includes('goo.gl');

    if (isShortUrl) {
      this.resolving.set(true);
      this.error.set('');
      try {
        const resolved = await this.gpxApi.resolveUrl(url);
        this.url.set(resolved);
        this.parseUrl();
      } catch {
        this.error.set('Impossibile risolvere il link corto. Prova a copiare il link completo da Google Maps.');
      } finally {
        this.resolving.set(false);
      }
    } else {
      this.parseUrl();
    }
  }
}
