/**
 * Reading coordinates that a person typed or pasted.
 *
 * Shared because coordinates are entered in two places: the start-up check,
 * and the map's manual-entry dialog when locating the device fails.
 */

const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;

export function isValidCoordinates(value: unknown): value is [number, number] {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const [long, lat] = value;
  return (
    typeof long === "number" &&
    Number.isFinite(long) &&
    Math.abs(long) <= MAX_LONGITUDE &&
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    Math.abs(lat) <= MAX_LATITUDE
  );
}

/**
 * Parse free text into [lat, lon].
 * Accepts formats like "35.6895, 139.6917", "35.6895 N, 139.6917 E",
 * or numbers with degree symbol. It strips commas and degree symbols,
 * and applies sign rules for N/S and E/W.
 */
export function parseCoordinates(text: string): [number, number] | null {
  if (!text) return null;
  // Replace degree symbols and commas with spaces to simplify parsing
  const cleaned = text.replaceAll(/(and|latitude|longitude)/g, "").trim();
  // Normalize common quote characters to simple ASCII variants
  const norm = cleaned
    .replace(/[‘’′]/g, "'")
    .replace(/[“”″]/g, '"')
    .replace(/''/g, '"');

  // First: try to detect DMS (degrees° minutes' seconds") coordinate groups
  // Examples handled: "35° 41' 57.9984'' N", "51°20'15.9936" E"
  const dmsRegex =
    /([+-]?\d+(?:\.\d+)?)\s*(?:°|deg)?\s*(\d+(?:\.\d+)?)?\s*(?:'|m)?\s*(\d+(?:\.\d+)?)?\s*(?:"|s)?\s*([NSEW])?/gi;
  const dmsParts: { num: number; dir?: string; origDeg: number }[] = [];
  let dm: RegExpExecArray | null;
  while ((dm = dmsRegex.exec(norm)) !== null) {
    // dm[1] = degrees, dm[2] = minutes (optional), dm[3] = seconds (optional), dm[4] = direction (optional)
    const deg = parseFloat(dm[1] as string);
    const min = dm[2] ? parseFloat(dm[2] as string) : 0;
    const sec = dm[3] ? parseFloat(dm[3] as string) : 0;
    const dir = dm[4]?.toUpperCase();
    const decimal = Math.abs(deg) + min / 60 + sec / 3600;
    dmsParts.push({ num: decimal, dir, origDeg: deg });
    if (dmsParts.length >= 2) break;
  }

  if (dmsParts.length >= 2) {
    let lat = dmsParts[0]!.num * (dmsParts[0]!.origDeg < 0 ? -1 : 1);
    let lon = dmsParts[1]!.num * (dmsParts[1]!.origDeg < 0 ? -1 : 1);
    const d0 = dmsParts[0]!.dir;
    const d1 = dmsParts[1]!.dir;
    if (d0 === "S") lat = -Math.abs(lat);
    if (d0 === "N") lat = Math.abs(lat);
    if (d1 === "W") lon = -Math.abs(lon);
    if (d1 === "E") lon = Math.abs(lon);
    return [lat, lon];
  }

  // Next: match number tokens with optional trailing direction letter (decimal degrees)
  const regex = /([+-]?\d+(?:\.\d+)?)(?:\s*°)?\s*([NSEW])?/gi;
  const parts: { num: number; dir?: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(norm)) !== null) {
    const num = parseFloat(m[1] as string);
    const dir = m[2]?.toUpperCase();
    parts.push({ num, dir });
    if (parts.length >= 2) break;
  }

  if (parts.length >= 2) {
    let lat = parts[0]!.num;
    let lon = parts[1]!.num;
    const d0 = parts[0]!.dir;
    const d1 = parts[1]!.dir;
    if (d0 === "S") lat = -Math.abs(lat);
    if (d0 === "N") lat = Math.abs(lat);
    if (d1 === "W") lon = -Math.abs(lon);
    if (d1 === "E") lon = Math.abs(lon);
    return [lat, lon];
  }

  // Fallback: pick the first two numbers found anywhere
  const nums = norm.match(/-?\d+(?:\.\d+)?/g);
  if (nums && nums.length >= 2) {
    let lat = parseFloat(nums[0] as string);
    let lon = parseFloat(nums[1] as string);
    // Apply sign hints if the text contains letters
    if (/[sS]/.test(norm) && !/[nN]/.test(norm)) lat = -Math.abs(lat);
    if (/[wW]/.test(norm) && !/[eE]/.test(norm)) lon = -Math.abs(lon);
    return [lat, lon];
  }

  return null;
}
