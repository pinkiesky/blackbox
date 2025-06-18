import type { LogRecord } from "@/types/data";

export function linearInterpolate(
  start: number,
  end: number,
  fraction: number,
): number {
  return start + (end - start) * fraction;
}

export function circularInterpolate(
  start: number,
  end: number,
  fraction: number,
): number {
  // Handle circular interpolation for angles (0-360 degrees)
  let diff = end - start;

  // Find the shortest angular distance
  if (diff > 180) {
    diff -= 360;
  } else if (diff < -180) {
    diff += 360;
  }

  let result = start + diff * fraction;

  // Normalize to 0-360 range
  if (result < 0) {
    result += 360;
  } else if (result >= 360) {
    result -= 360;
  }

  return result;
}

export function resampleData(
  data: LogRecord[],
  targetFrequencySec: number,
): LogRecord[] {
  if (data.length === 0) {
    return [];
  }

  if (data[0].flightTimeSec !== 0) {
    throw new Error("The first record must have flightTimeSec equal to 0.");
  }

  const totalDuration = data[data.length - 1].flightTimeSec;
  const resampled: LogRecord[] = [];
  resampled.push({
    ...data[0],
    $resample: {
      deviationSec: 0,
      interpolated: false,
      originalFirstRecord: data[0],
      originalSecondRecord: data[0],
      time: 0,
    }
  });

  for (let time = targetFrequencySec; time <= totalDuration; time += targetFrequencySec) {
    const secondRecordIndex = data.findIndex(record => record.flightTimeSec >= time);
    if (secondRecordIndex === -1) {
      resampled.push({ ...resampled[resampled.length - 1] });
      continue;
    }

    const firstRecordIndex = secondRecordIndex - 1;
    if (firstRecordIndex < 0) {
      throw new Error("Fatal: no valid first record found for interpolation.");
    }
    const secondRecord = data[secondRecordIndex];
    const firstRecord = data[firstRecordIndex];

    const minDeviationSec = Math.min(
      Math.abs(time - firstRecord.flightTimeSec),
      Math.abs(secondRecord.flightTimeSec - time),
    );

    const fraction = (time - firstRecord.flightTimeSec) / (secondRecord.flightTimeSec - firstRecord.flightTimeSec);
    const interpolatedRecord: LogRecord = {
      flightTimeSec: time,
      coordinates: {
        lat: linearInterpolate(firstRecord.coordinates.lat, secondRecord.coordinates.lat, fraction),
        lng: linearInterpolate(firstRecord.coordinates.lng, secondRecord.coordinates.lng, fraction),
      },
      altitudeM: linearInterpolate(firstRecord.altitudeM, secondRecord.altitudeM, fraction),
      date: new Date(data[0].date.getTime() + (time * 1000)),
      groundSpeedKmh: linearInterpolate(firstRecord.groundSpeedKmh, secondRecord.groundSpeedKmh, fraction),
      headingDeg: circularInterpolate(firstRecord.headingDeg, secondRecord.headingDeg, fraction),
      $resample: {
        deviationSec: minDeviationSec,
        interpolated: true,
        originalFirstRecord: firstRecord,
        originalSecondRecord: secondRecord,
        time,
      }
    };

    resampled.push(interpolatedRecord);
  }

  return resampled;
}