import type { LocationData } from '@/types/data'
import { LatLng } from 'leaflet'

export interface DistanceData {
  totalDistanceM: number // in meters
}

export class DistanceCalculator {
  private totalDistanceM: number = 0
  private prevPoint: LatLng | null = null
  private prevPointAltitude: number | null = null

  addPoint(point: LocationData, altitude: number): void {
    if (this.prevPoint) {
      const distance = this.prevPoint.distanceTo([point.lat, point.lng])

      if (this.prevPointAltitude !== null) {
        const altitudeDiff = altitude - this.prevPointAltitude
        // Pythagorean theorem to calculate 3D distance
        this.totalDistanceM += Math.sqrt(distance ** 2 + altitudeDiff ** 2)
      } else {
        this.totalDistanceM += distance
      }
    }

    this.prevPoint = new LatLng(point.lat, point.lng)
    this.prevPointAltitude = altitude
  }

  getDistance(): DistanceData {
    return {
      totalDistanceM: this.totalDistanceM,
    }
  }
}
