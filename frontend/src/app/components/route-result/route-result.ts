import { Component, input, output } from '@angular/core';
import { RouteResponse } from '../../models/route.model';
import { RouteMapComponent } from '../route-map/route-map';

@Component({
  selector: 'app-route-result',
  standalone: true,
  imports: [RouteMapComponent],
  templateUrl: './route-result.html',
})
export class RouteResultComponent {
  result = input.required<RouteResponse>();
  downloadClick = output<void>();

  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return (meters / 1000).toFixed(1) + ' km';
    }
    return meters.toFixed(0) + ' m';
  }
}
