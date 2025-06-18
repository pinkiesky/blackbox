import type { LocationData } from '@/types/data'
import { LatLng } from 'leaflet'

export function safeParseNumber(value: string | number): number {
  if (typeof value === 'string' && value.trim() === '') {
    throw new Error('Cannot parse an empty string as a number')
  }

  const parsed = typeof value === 'number' ? value : parseFloat(value)
  if (isNaN(parsed)) {
    throw new Error(`Invalid number: ${value}`)
  }

  return parsed
}

export function compareObjectsRecursively(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
): boolean {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false
    }

    const val1 = obj1[key]
    const val2 = obj2[key]

    if (typeof val1 === 'object' && typeof val2 === 'object') {
      if (!compareObjectsRecursively(val1, val2)) {
        return false
      }
    } else if (val1 !== val2) {
      return false
    }
  }

  return true
}

export function getColorBetweenTwoColors(
  color1: string,
  color2: string,
  percentage: number,
): string {
  const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.slice(1), 16)
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    }
  }

  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * percentage)
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * percentage)
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * percentage)

  // hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export interface ValueData {
  max: number
  min: number
  average: number
}

export class ValueCalculator {
  private value: ValueData
  private totalWeight: number = 0
  private totalWeightedSum: number = 0

  constructor() {
    this.value = {
      max: -Infinity,
      min: Infinity,
      average: 0,
    }
  }

  addValueWeighted(value: number, weight = 1): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Value must be a valid number')
    }

    if (value > this.value.max) {
      this.value.max = value
    }
    if (value < this.value.min) {
      this.value.min = value
    }

    this.totalWeightedSum += value * weight
    this.totalWeight += weight
    this.value.average = this.totalWeightedSum / this.totalWeight
  }

  getValue(): ValueData {
    return {
      ...this.value,
    }
  }
}

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
