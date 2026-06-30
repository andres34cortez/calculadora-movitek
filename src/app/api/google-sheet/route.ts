import { NextResponse } from "next/server";

const sheetCsvUrl =
  "https://docs.google.com/spreadsheets/d/1EU0yPmyZ7YdcC_mDZD4w4O9bPNbxF-FKDt5Gg0fB5XQ/export?format=csv&gid=0";

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

export async function GET() {
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

  return NextResponse.json({
    usdPrice: parseMoney(priceRow[0] ?? ""),
    pesosPrice: parseMoney(priceRow[1] ?? ""),
    installments: {
      three: parseMoney(priceRow[2] ?? ""),
      six: parseMoney(priceRow[3] ?? ""),
      twelve: parseMoney(priceRow[4] ?? ""),
    },
    dollarBlue: parseMoney(dollarRow[1] ?? ""),
    source: "google-sheet",
    updatedAt: new Date().toISOString(),
  });
}
