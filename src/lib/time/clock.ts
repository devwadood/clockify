export type ClockTime = {
  hours: number;
  minutes: number;
  totalMinutes: number;
};

/** Accepts browser 24-hour values and locale-shaped 12-hour values. */
export function parseClockTime(value: string): ClockTime | null {
  const match = value
    .trim()
    .toUpperCase()
    .match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3];
  if (minutes < 0 || minutes > 59) return null;
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === "AM") hours = hours === 12 ? 0 : hours;
    if (meridiem === "PM") hours = hours === 12 ? 12 : hours + 12;
  } else if (hours < 0 || hours > 23) return null;
  return { hours, minutes, totalMinutes: hours * 60 + minutes };
}

function timeZoneOffset(at: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  const representedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
  return representedAsUtc - at.getTime();
}

/** Converts a wall-clock value in an IANA project timezone into a UTC Date. */
export function projectDateTimeToUtc(
  date: string,
  clock: ClockTime,
  timeZone: string,
) {
  const [year, month, day] = date.split("-").map(Number);
  const wallClock = Date.UTC(year, month - 1, day, clock.hours, clock.minutes);
  let result = new Date(
    wallClock - timeZoneOffset(new Date(wallClock), timeZone),
  );
  // Re-evaluate once at the resolved instant to account for DST boundaries.
  result = new Date(wallClock - timeZoneOffset(result, timeZone));
  return result;
}

export function clockMinutesInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return Number(values.hour) * 60 + Number(values.minute);
}
