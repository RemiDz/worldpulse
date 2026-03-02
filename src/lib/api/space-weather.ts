interface KpResult {
  value: number;
  timestamp: string;
}

interface SolarWindResult {
  speed: number;
  density: number;
  timestamp: string;
}

export async function fetchKpIndex(): Promise<KpResult> {
  const res = await fetch(
    "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`KP API error: ${res.status}`);
  }

  const data: string[][] = await res.json();
  // data[0] is header: ["time_tag", "Kp", "a_running", "station_count"]
  // Walk backwards to find last valid reading
  for (let i = data.length - 1; i > 0; i--) {
    const kp = parseFloat(data[i][1]);
    if (!isNaN(kp)) {
      return { value: kp, timestamp: data[i][0] };
    }
  }

  throw new Error("No valid KP data found");
}

export async function fetchSolarWind(): Promise<SolarWindResult> {
  const res = await fetch(
    "https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json",
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Solar wind API error: ${res.status}`);
  }

  const data: (string | null)[][] = await res.json();
  // data[0] is header: ["time_tag", "density", "speed", "temperature"]
  // Walk backwards to find last row with valid speed
  for (let i = data.length - 1; i > 0; i--) {
    const speed = data[i][2] != null ? parseFloat(data[i][2] as string) : NaN;
    const density = data[i][1] != null ? parseFloat(data[i][1] as string) : 0;
    if (!isNaN(speed) && speed > 0) {
      return {
        speed,
        density: isNaN(density) ? 0 : density,
        timestamp: data[i][0] as string,
      };
    }
  }

  throw new Error("No valid solar wind data found");
}
