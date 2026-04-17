export class RouteRequestDto {
  waypoints: WaypointDto[];
  profile?: 'car' | 'bike' | 'foot';
  routeName?: string;
}

export class WaypointDto {
  lat: number;
  lng: number;
}
