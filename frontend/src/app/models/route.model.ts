export interface Waypoint {
  lat: number;
  lng: number;
  name?: string;
}

export type RouteProfile = 'car' | 'bike' | 'foot';

export interface RouteRequest {
  waypoints: Waypoint[];
  profile: RouteProfile;
  routeName?: string;
}

export interface RouteResponse {
  gpx: string;
  fileName: string;
  totalDistance: number;
  totalPoints: number;
  points: { lat: number; lng: number }[];
}
