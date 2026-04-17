import { Injectable } from '@angular/core';
import { RouteRequest, RouteResponse } from '../models/route.model';

@Injectable({ providedIn: 'root' })
export class GpxApiService {
  private apiUrl = 'http://localhost:3000/api';

  async resolveUrl(url: string): Promise<string> {
    const isShortUrl =
      url.includes('maps.app.goo.gl') ||
      url.includes('goo.gl/maps') ||
      url.includes('goo.gl');

    if (!isShortUrl) {
      return url;
    }

    const response = await fetch(`${this.apiUrl}/resolve-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      return url;
    }

    const data = await response.json();
    return data.resolvedUrl || url;
  }

  async convertRouteToGpx(request: RouteRequest): Promise<RouteResponse> {
    const response = await fetch(`${this.apiUrl}/route-to-gpx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `Errore del server: ${response.status}`);
    }

    return response.json();
  }

  downloadGpx(response: RouteResponse): void {
    const blob = new Blob([response.gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = response.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
