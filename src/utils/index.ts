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
  q95: number // 95th percentile
  q99: number // 99th percentile
  uniqueValues: number[] // Optional, only if you need to track unique values
}

export class ValueCalculator {
  private value: ValueData
  private totalWeight: number = 0
  private totalWeightedSum: number = 0
  private allValues: number[] = []
  private uniqueValuesSet: Set<number> = new Set()

  constructor() {
    this.value = {
      max: -Infinity,
      min: Infinity,
      average: 0,
      q95: NaN,
      q99: NaN,
      uniqueValues: [],
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

    this.allValues.push(value)
    this.uniqueValuesSet.add(value)
  }

  calculatePercentiles(): { q95: number; q99: number } {
    if (this.allValues.length === 0) {
      return { q95: 0, q99: 0 }
    }

    const sortedValues = [...this.allValues].sort((a, b) => a - b)
    const n = sortedValues.length
    if (n === 0) {
      return {
        ...this.value,
        q95: 0,
        q99: 0,
      }
    }

    const q95Index = Math.floor(n * 0.95)
    const q99Index = Math.floor(n * 0.99)
    const q95 = sortedValues[q95Index]
    const q99 = sortedValues[q99Index]

    return {
      q95,
      q99,
    }
  }

  getValue(): ValueData {
    return {
      ...this.value,
      ...this.calculatePercentiles(),
      uniqueValues: Array.from(this.uniqueValuesSet).sort((a, b) => a - b),
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

export interface DerivativeData {
  derivative: number // Current derivative value
  averageDerivative: number // Average derivative over all samples
  maxDerivative: number // Maximum derivative encountered
  minDerivative: number // Minimum derivative encountered
  derivatives: number[] // All calculated derivatives
}

export class DerivativeCalculator {
  private prevValue: number | null = null
  private derivatives: number[] = []
  private totalDerivative: number = 0

  addValue(value: number, timeDelta: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Value must be a valid number')
    }
    if (typeof timeDelta !== 'number' || isNaN(timeDelta)) {
      throw new Error('Time must be a valid number')
    }
    if (timeDelta === 0) {
      throw new Error(
        'Time delta cannot be zero - would result in infinite derivative',
      )
    }

    if (this.prevValue !== null) {
      const deltaValue = value - this.prevValue

      const derivative = deltaValue / timeDelta
      this.derivatives.push(derivative)
      this.totalDerivative += derivative
    }

    this.prevValue = value
  }

  getCurrentDerivative(): number {
    if (this.derivatives.length === 0) {
      return 0
    }
    return this.derivatives[this.derivatives.length - 1]
  }

  getAverageDerivative(): number {
    if (this.derivatives.length === 0) {
      return 0
    }
    return this.totalDerivative / this.derivatives.length
  }

  getMaxDerivative(): number {
    if (this.derivatives.length === 0) {
      return 0
    }
    return Math.max(...this.derivatives)
  }

  getMinDerivative(): number {
    if (this.derivatives.length === 0) {
      return 0
    }
    return Math.min(...this.derivatives)
  }

  getDerivativeData(): DerivativeData {
    return {
      derivatives: this.derivatives,
      derivative: this.getCurrentDerivative(),
      averageDerivative: this.getAverageDerivative(),
      maxDerivative: this.getMaxDerivative(),
      minDerivative: this.getMinDerivative(),
    }
  }

  reset(): void {
    this.prevValue = null
    this.derivatives = []
    this.totalDerivative = 0
  }
}
