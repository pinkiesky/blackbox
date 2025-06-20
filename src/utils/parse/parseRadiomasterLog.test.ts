import { describe, it, expect, vi, afterEach } from 'vitest'
import { parseRadiomasterLogs } from './parseRadiomasterLog'

const validCsvText = `Date,Time,1RSS(dB),2RSS(dB),RQly(%),RSNR(dB),ANT,RFMD,TPWR(mW),TRSS(dB),TQly(%),TSNR(dB),GPS,GSpd(kmh),Hdg(°),Alt(m),Sats,RxBt(V),Curr(A),Capa(mAh),Bat%(%),Ptch(rad),Roll(rad),Yaw(rad),FM,VSpd(m/s),Rud,Ele,Thr,Ail,P1,P2,SA,SB,SC,SD,SE,SF,SG,SH,LSW,CH1(us),CH2(us),CH3(us),CH4(us),CH5(us),CH6(us),CH7(us),CH8(us),CH9(us),CH10(us),CH11(us),CH12(us),CH13(us),CH14(us),CH15(us),CH16(us),CH17(us),CH18(us),CH19(us),CH20(us),CH21(us),CH22(us),CH23(us),CH24(us),CH25(us),CH26(us),CH27(us),CH28(us),CH29(us),CH30(us),CH31(us),CH32(us),TxBat(V)
2000-01-01,00:09:16.080,-38,0,100,14,0,5,25,-26,100,15,41.863500 45.279461,0.0,0.00,0,12,12.0,1.1,167,80,-0.03,-0.10,-0.42,"AIR",0.1,-3,1,-1024,-2,513,760,-1,0,0,-1,-1,1,-1,-1,0x0000000000000000,1500,1500,988,1500,2012,988,1500,1500,988,988,1756,988,988,1880,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,7.5
2000-01-01,00:09:16.440,-37,0,100,14,0,5,25,-25,100,14,41.863500 45.279461,0.0,0.00,0,12,12.0,1.1,168,80,-0.04,-0.10,-0.42,"AIR",0.1,-1,1,-908,-2,513,760,-1,0,0,-1,-1,1,-1,-1,0x0000000000000000,1500,1500,1046,1500,2012,988,1500,1500,988,988,1756,988,988,1880,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,7.5
2000-01-01,00:09:16.940,-39,0,100,14,0,5,25,-27,100,13,41.863500 45.279461,0.0,0.00,0,12,12.0,1.1,168,80,-0.03,-0.10,-0.44,"AIR",0.1,-2,1,-1024,-2,513,760,-1,0,0,-1,-1,1,-1,-1,0x0000000000000000,1500,1500,988,1500,2012,988,1500,1500,988,988,1756,988,988,1880,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,7.5
2000-01-01,00:09:17.440,-38,0,100,14,0,5,25,-28,100,14,41 0.279461,0.0,0.00,3,12,12.0,1.1,168,80,-0.03,-0.07,-0.45,"AIR",0.1,-1,1,-1024,-2,514,760,-1,1,2,-1,-1,1,-1,-1,0x0000000000000000,1500,1500,988,1500,2012,988,1500,1500,988,988,1757,988,988,1880,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,7.5
`

describe('parseRadiomasterLogs', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should parse valid CSV text correctly', async () => {
    const result = await parseRadiomasterLogs(validCsvText)

    expect(result).toBeDefined()
    expect(result.records.length).toBe(4)
    expect(result.startTime).toEqual(new Date('2000-01-01T00:09:16.080Z'))
    expect(result.endTime).toEqual(new Date('2000-01-01T00:09:17.440Z'))
    expect(result.durationSec).toBeCloseTo(1.36, 2)

    const firstRecord = result.records[0]
    expect(firstRecord.flightTimeSec).toBeCloseTo(0, 2)
    expect(firstRecord.coordinates).toEqual({ lat: 41.8635, lng: 45.279461 })
    expect(firstRecord.altitude).toBe(0)

    const lastRecord = result.records[3]
    expect(lastRecord.flightTimeSec).toBeCloseTo(1.36, 2)
    expect(lastRecord.coordinates).toEqual({ lat: 41, lng: 0.279461 })
    expect(lastRecord.altitude).toBe(3)
  })
})
