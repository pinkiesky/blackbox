import type { ValueData } from "@/utils"

export interface LocationData {
  lat: number
  lng: number
}

export interface Segment {
  points: LatLngLiteral[]
  config: {
    opacity?: number
    color?: string
  }
}

export interface RadiomasterLogRecord {
  Date: string // YYYY-MM-DD
  Time: string // HH:mm:ss.SSS
  '1RSS(dB)': number
  '2RSS(dB)': number
  'RQly(%)': number
  'RSNR(dB)': number
  ANT: number
  RFMD: number
  'TPWR(mW)': number
  'TRSS(dB)': number
  'TQly(%)': number
  'TSNR(dB)': number
  GPS: string // "lat lng"
  'GSpd(kmh)': number
  'Hdg(°)': number
  'Alt(m)': number
  Sats: number
  'RxBt(V)': number
  'Curr(A)': number
  'Capa(mAh)': number
  'Bat%(%)': number
  'Ptch(rad)': number
  'Roll(rad)': number
  'Yaw(rad)': number
  FM: string // статус, например "OK"
  'VSpd(m/s)': number
  Rud: number
  Ele: number
  Thr: number
  Ail: number
  S1: number
  S2: number
  SA: number
  SB: number
  SC: number
  SD: number
  SE: number
  SF: number
  SG: number
  SH: number
  LSW: string // например "0x0000000000000000"
  'CH1(us)': number
  'CH2(us)': number
  'CH3(us)': number
  'CH4(us)': number
  'CH5(us)': number
  'CH6(us)': number
  'CH7(us)': number
  'CH8(us)': number
  'CH9(us)': number
  'CH10(us)': number
  'CH11(us)': number
  'CH12(us)': number
  'CH13(us)': number
  'CH14(us)': number
  'CH15(us)': number
  'CH16(us)': number
  'CH17(us)': number
  'CH18(us)': number
  'CH19(us)': number
  'CH20(us)': number
  'CH21(us)': number
  'CH22(us)': number
  'CH23(us)': number
  'CH24(us)': number
  'CH25(us)': number
  'CH26(us)': number
  'CH27(us)': number
  'CH28(us)': number
  'CH29(us)': number
  'CH30(us)': number
  'CH31(us)': number
  'CH32(us)': number
  'TxBat(V)': number
}

export interface Log {
  data: LogRecord[]
  startTime: Date
  endTime: Date
  durationSec: number
  title: string

  stats: {
    altitude: ValueData;
    groundSpeedKmh: ValueData;
  }
}

export interface LogRecord {
  flightTimeSec: number
  coordinates: LocationData
  altitudeM: number
  date: Date
  groundSpeedKmh: number
  headingDeg: number

  $resample?: {
    deviationSec?: number // deviation from the original record in seconds
    interpolated?: boolean // whether this record was created by interpolation
    originalFirstRecord?: LogRecord // the first record used for interpolation
    originalSecondRecord?: LogRecord // the second record used for interpolation
    time: number
  }
}
