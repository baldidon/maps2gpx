import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Waypoint, RouteProfile } from '../../models/route.model';

@Component({
  selector: 'app-route-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './route-form.html',
})
export class RouteFormComponent {
  url = input('');
  profile = input<RouteProfile>('car');
  routeName = input('');
  waypoints = input<Waypoint[]>([]);
  error = input('');
  loading = input(false);
  resolving = input(false);

  urlInput = output<string>();
  profileChange = output<RouteProfile>();
  routeNameChange = output<string>();
  generateClick = output<void>();

  profiles: { value: RouteProfile; label: string }[] = [
    { value: 'car', label: 'Auto' },
    { value: 'bike', label: 'Bici' },
    { value: 'foot', label: 'A piedi' },
  ];
}
