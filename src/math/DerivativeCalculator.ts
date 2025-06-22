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
