interface AqiResult {
  aqi: number;
  pm25: number;
}

const BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

export async function fetchAirQuality(
  latitude: number,
  longitude: number
): Promise<AqiResult> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: "us_aqi,european_aqi,pm2_5",
  });

  const res = await fetch(`${BASE_URL}?${params}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`AQI API error: ${res.status}`);
  }

  const data = await res.json();
  const current = data.current;

  return {
    aqi: current.us_aqi ?? current.european_aqi ?? 0,
    pm25: current.pm2_5 ?? 0,
  };
}
