export class RouteResponseDto {
  gpx: string;
  fileName: string;
  totalDistance: number;
  totalPoints: number;
  points: { lat: number; lng: number }[];
}
