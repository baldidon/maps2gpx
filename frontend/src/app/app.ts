import { Component, signal, inject } from '@angular/core';
import { UrlParserService } from './services/url-parser.service';
import { GpxApiService } from './services/gpx-api.service';
import { Waypoint, RouteProfile, RouteResponse } from './models/route.model';
import { RouteFormComponent } from './components/route-form/route-form';
import { RouteResultComponent } from './components/route-result/route-result';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouteFormComponent, RouteResultComponent],
  templateUrl: './app.html',
})
export class App {
  private urlParser = inject(UrlParserService);
  private gpxApi = inject(GpxApiService);

  url = signal('');
  routeName = signal('');
  profile = signal<RouteProfile>('car');
  waypoints = signal<Waypoint[]>([]);
  error = signal('');
  loading = signal(false);
  result = signal<RouteResponse | null>(null);
  resolving = signal(false);

  async onUrlInput(url: string): Promise<void> {
    this.url.set(url);
    const trimmed = url.trim();
    if (!trimmed) {
      this.waypoints.set([]);
      this.error.set('');
      this.result.set(null);
      return;
    }

    const isShortUrl =
      trimmed.includes('maps.app.goo.gl') ||
      trimmed.includes('goo.gl/maps') ||
      trimmed.includes('goo.gl');

    if (isShortUrl) {
      this.resolving.set(true);
      this.error.set('');
      try {
        const resolved = await this.gpxApi.resolveUrl(trimmed);
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
}
