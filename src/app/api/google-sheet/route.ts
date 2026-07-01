import { NextResponse } from "next/server";

const sheetCsvUrl =
  "https://docs.google.com/spreadsheets/d/1EU0yPmyZ7YdcC_mDZD4w4O9bPNbxF-FKDt5Gg0fB5XQ/export?format=csv&gid=0";

const fallbackDollarBlue = 1515;

const tradeInBaseUsd: Record<string, Record<string, number>> = {
  "iPhone X": { "64 GB": 120, "256 GB": 150 },
  "iPhone XR": { "64 GB": 160, "128 GB": 190, "256 GB": 220 },
  "iPhone XS": { "64 GB": 170, "256 GB": 210, "512 GB": 240 },
  "iPhone XS Max": { "64 GB": 210, "256 GB": 250, "512 GB": 280 },
  "iPhone 11": { "64 GB": 250, "128 GB": 290, "256 GB": 330 },
  "iPhone 11 Pro": { "64 GB": 320, "256 GB": 380, "512 GB": 430 },
  "iPhone 11 Pro Max": { "64 GB": 370, "256 GB": 430, "512 GB": 480 },
  "iPhone 12": { "64 GB": 330, "128 GB": 380, "256 GB": 430 },
  "iPhone 12 Pro": { "128 GB": 450, "256 GB": 500, "512 GB": 560 },
  "iPhone 12 Pro Max": { "128 GB": 520, "256 GB": 580, "512 GB": 640 },
  "iPhone 13": { "128 GB": 440, "256 GB": 500, "512 GB": 560 },
  "iPhone 13 Pro": { "128 GB": 620, "256 GB": 690, "512 GB": 760, "1 TB": 820 },
  "iPhone 13 Pro Max": { "128 GB": 700, "256 GB": 780, "512 GB": 850, "1 TB": 920 },
  "iPhone 14": { "128 GB": 590, "256 GB": 660, "512 GB": 730 },
  "iPhone 14 Pro": { "128 GB": 780, "256 GB": 860, "512 GB": 940, "1 TB": 1020 },
  "iPhone 14 Pro Max": { "128 GB": 870, "256 GB": 960, "512 GB": 1050, "1 TB": 1140 },
  "iPhone 15": { "128 GB": 720, "256 GB": 800, "512 GB": 890 },
  "iPhone 15 Pro": { "128 GB": 950, "256 GB": 1040, "512 GB": 1130, "1 TB": 1220 },
  "iPhone 15 Pro Max": { "256 GB": 1160, "512 GB": 1260, "1 TB": 1360 },
  "iPhone 16": { "128 GB": 860, "256 GB": 950, "512 GB": 1040 },
  "iPhone 16 Pro": { "128 GB": 1120, "256 GB": 1220, "512 GB": 1320, "1 TB": 1420 },
  "iPhone 16 Pro Max": { "256 GB": 1370, "512 GB": 1480, "1 TB": 1590 },
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseMoney(value: string) {
  const normalized = value.replace(/[$\s]/g, "").replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getBatteryFactor(battery: number) {
  if (battery >= 90) {
    return 1;
  }

  if (battery >= 85) {
    return 0.94;
  }

  if (battery >= 80) {
    return 0.88;
  }

  if (battery >= 75) {
    return 0.8;
  }

  if (battery >= 70) {
    return 0.7;
  }

  return 0.58;
}

function clampBattery(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function getCustomerQuote(searchParams: URLSearchParams, dollarBlue: number) {
  const model = searchParams.get("model") ?? "";
  const storage = searchParams.get("storage") ?? "";
  const color = searchParams.get("color") ?? "";
  const battery = clampBattery(Number(searchParams.get("battery") ?? 0));
  const baseUsd = tradeInBaseUsd[model]?.[storage] ?? 0;

  if (!model || !storage || baseUsd === 0) {
    return null;
  }

  const batteryFactor = getBatteryFactor(battery);
  const usdPrice = Math.round(baseUsd * batteryFactor);

  return {
    model,
    storage,
    color,
    battery,
    baseUsd,
    batteryAdjustmentPercent: Math.round((batteryFactor - 1) * 100),
    usdPrice,
    pesosPrice: Math.round(usdPrice * dollarBlue),
    source: "fallback-trade-in-table",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const response = await fetch(sheetCsvUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "No se pudo leer Google Sheets" },
      { status: response.status },
    );
  }

  const csv = await response.text();
  const rows = csv.split(/\r?\n/).map(parseCsvLine);
  const priceRow = rows[2] ?? [];
  const dollarRow = rows[4] ?? [];
  const dollarBlue = parseMoney(dollarRow[1] ?? "") || fallbackDollarBlue;

  return NextResponse.json({
    usdPrice: parseMoney(priceRow[0] ?? ""),
    pesosPrice: parseMoney(priceRow[1] ?? ""),
    installments: {
      three: parseMoney(priceRow[2] ?? ""),
      six: parseMoney(priceRow[3] ?? ""),
      twelve: parseMoney(priceRow[4] ?? ""),
    },
    dollarBlue,
    customerQuote: getCustomerQuote(searchParams, dollarBlue),
    source: "google-sheet",
    updatedAt: new Date().toISOString(),
  });
}
