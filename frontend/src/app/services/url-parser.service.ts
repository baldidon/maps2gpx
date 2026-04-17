import { Injectable } from '@angular/core';
import { Waypoint } from '../models/route.model';

@Injectable({ providedIn: 'root' })
export class UrlParserService {
  parseGoogleMapsUrl(url: string): Waypoint[] {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      const withProtocol = 'https://' + url;
      parsedUrl = new URL(withProtocol);
    }

    const pathname = parsedUrl.pathname;

    if (pathname.includes('/dir/')) {
      return this.parseDirectionsUrl(pathname);
    }

    if (pathname.includes('/place/')) {
      return this.parsePlaceUrl(pathname, parsedUrl);
    }

    if (parsedUrl.searchParams.has('q')) {
      return [{ lat: 0, lng: 0, name: parsedUrl.searchParams.get('q')! }];
    }

    return [];
  }

  private parseDirectionsUrl(pathname: string): Waypoint[] {
    const dirIndex = pathname.indexOf('/dir/');
    const afterDir = pathname.substring(dirIndex + 5);
    const segments = afterDir.split('/').filter((s) => s.length > 0);

    const waypoints: Waypoint[] = [];

    for (const segment of segments) {
      if (segment === 'data' || segment.startsWith('data=')) break;
      if (segment.startsWith('@')) continue;

      const decoded = decodeURIComponent(segment);
      const coordMatch = decoded.match(
        /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/,
      );

      if (coordMatch) {
        waypoints.push({
          lat: parseFloat(coordMatch[1]),
          lng: parseFloat(coordMatch[2]),
        });
      } else {
        waypoints.push({ lat: 0, lng: 0, name: decoded });
      }
    }

    const hasNamedWithoutCoords = waypoints.some(
      (wp) => wp.name && wp.lat === 0 && wp.lng === 0,
    );

    if (hasNamedWithoutCoords) {
      const dataCoords = [
        ...pathname.matchAll(/!2m2!1d(-?\d+\.?\d*)!2d(-?\d+\.?\d*)/g),
      ];
      for (let i = 0; i < waypoints.length; i++) {
        if (
          waypoints[i].name &&
          waypoints[i].lat === 0 &&
          waypoints[i].lng === 0 &&
          i < dataCoords.length
        ) {
          waypoints[i].lng = parseFloat(dataCoords[i][1]);
          waypoints[i].lat = parseFloat(dataCoords[i][2]);
        }
      }
    }

    return waypoints;
  }

  private parsePlaceUrl(pathname: string, url: URL): Waypoint[] {
    const coords = url.searchParams.get('api') || '';
    const coordMatch = pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);

    if (coordMatch) {
      return [
        { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) },
      ];
    }

    const placeIndex = pathname.indexOf('/place/');
    const afterPlace = pathname.substring(placeIndex + 7);
    const placeName = decodeURIComponent(afterPlace.split('/')[0] || coords);

    if (placeName) {
      return [{ lat: 0, lng: 0, name: placeName }];
    }

    return [];
  }

  isValidGoogleMapsUrl(url: string): boolean {
    if (!url) return false;
    const normalized = url.toLowerCase();
    return (
      normalized.includes('google.com/maps') ||
      normalized.includes('google.it/maps') ||
      normalized.includes('goo.gl/maps') ||
      normalized.includes('maps.app.goo.gl') ||
      normalized.includes('maps.google')
    );
  }

  extractWaypoints(url: string): Waypoint[] {
    if (!this.isValidGoogleMapsUrl(url)) {
      throw new Error('URL non valido. Inserisci un link Google Maps.');
    }

    const waypoints = this.parseGoogleMapsUrl(url);

    if (waypoints.length < 2) {
      throw new Error(
        'Impossibile estrarre almeno 2 punti dal link. Assicurati che sia un link di un percorso con partenza e arrivo.',
      );
    }

    const hasNamedWithoutCoords = waypoints.some(
      (wp) => wp.name && wp.lat === 0 && wp.lng === 0,
    );
    if (hasNamedWithoutCoords) {
      throw new Error(
        'Il link contiene indirizzi testuali che richiedono geocoding. Per ora, usa un link con coordinate esplicite (es. google.com/maps/dir/45.46,9.19/41.90,12.49).',
      );
    }

    return waypoints;
  }
}
