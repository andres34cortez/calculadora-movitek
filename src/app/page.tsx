"use client";

import { useEffect, useMemo, useState } from "react";

type PhoneModel = {
  name: string;
  storage: string[];
  colors: string[];
};

type DeviceCondition = "new" | "used";

type PriceItem = {
  id: string;
  model: string;
  storage: string;
  color: string;
  usdPrice: number;
  stock: "Disponible" | "Consultar";
  condition: DeviceCondition;
  battery?: number;
};

type SheetQuote = {
  usdPrice: number;
  pesosPrice: number;
  installments: {
    three: number;
    six: number;
    twelve: number;
  };
  dollarBlue: number;
  updatedAt: string;
};

const phoneModels: PhoneModel[] = [
  {
    name: "iPhone X",
    storage: ["64 GB", "256 GB"],
    colors: ["Space Gray", "Silver"],
  },
  {
    name: "iPhone XR",
    storage: ["64 GB", "128 GB", "256 GB"],
    colors: ["Black", "White", "Blue", "Coral", "Yellow", "Red"],
  },
  {
    name: "iPhone XS",
    storage: ["64 GB", "256 GB", "512 GB"],
    colors: ["Space Gray", "Silver", "Gold"],
  },
  {
    name: "iPhone 11",
    storage: ["64 GB", "128 GB", "256 GB"],
    colors: ["Black", "White", "Green", "Yellow", "Purple", "Red"],
  },
  {
    name: "iPhone 12",
    storage: ["64 GB", "128 GB", "256 GB"],
    colors: ["Black", "White", "Blue", "Green", "Purple", "Red"],
  },
  {
    name: "iPhone 13",
    storage: ["128 GB", "256 GB", "512 GB"],
    colors: ["Midnight", "Starlight", "Blue", "Pink", "Green", "Red"],
  },
  {
    name: "iPhone 14",
    storage: ["128 GB", "256 GB", "512 GB"],
    colors: ["Midnight", "Starlight", "Blue", "Purple", "Yellow", "Red"],
  },
  {
    name: "iPhone 15",
    storage: ["128 GB", "256 GB", "512 GB"],
    colors: ["Black", "Blue", "Green", "Yellow", "Pink"],
  },
  {
    name: "iPhone 16",
    storage: ["128 GB", "256 GB", "512 GB"],
    colors: ["Black", "White", "Teal", "Ultramarine", "Pink"],
  },
];

const priceList: PriceItem[] = [
  {
    id: "new-ip15-128-black",
    model: "iPhone 15",
    storage: "128 GB",
    color: "Black",
    usdPrice: 820,
    stock: "Disponible",
    condition: "new",
  },
  {
    id: "new-ip15-256-blue",
    model: "iPhone 15",
    storage: "256 GB",
    color: "Blue",
    usdPrice: 930,
    stock: "Consultar",
    condition: "new",
  },
  {
    id: "new-ip16-128-teal",
    model: "iPhone 16",
    storage: "128 GB",
    color: "Teal",
    usdPrice: 1040,
    stock: "Disponible",
    condition: "new",
  },
  {
    id: "new-ip16-256-white",
    model: "iPhone 16",
    storage: "256 GB",
    color: "White",
    usdPrice: 1190,
    stock: "Disponible",
    condition: "new",
  },
  {
    id: "used-ip13-128-midnight",
    model: "iPhone 13",
    storage: "128 GB",
    color: "Midnight",
    usdPrice: 560,
    stock: "Disponible",
    condition: "used",
    battery: 89,
  },
  {
    id: "used-ip14-128-purple",
    model: "iPhone 14",
    storage: "128 GB",
    color: "Purple",
    usdPrice: 680,
    stock: "Disponible",
    condition: "used",
    battery: 92,
  },
  {
    id: "used-ip15-128-black",
    model: "iPhone 15",
    storage: "128 GB",
    color: "Black",
    usdPrice: 760,
    stock: "Disponible",
    condition: "used",
    battery: 95,
  },
];

const dollarRate = 1260;
const installmentRates = {
  cash: 1,
  three: 1.12,
  six: 1.24,
  twelve: 1.52,
};

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const movitekWhatsapp = "2645555650";

function pesoValue(usdPrice: number, rate = installmentRates.cash) {
  return usdPrice * dollarRate * rate;
}

function fallbackInstallment(usdPrice: number, rate: number, installments: number) {
  return pesoValue(usdPrice, rate) / installments;
}

function getDeviceLabel(device: PriceItem) {
  return `${device.model} ${device.storage}`;
}

function MovitekLogo() {
  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[conic-gradient(from_210deg,#ffd400,#ff3b30,#ff00c8,#0057ff,#00e5ff,#ffd400)] p-1 shadow-[0_0_34px_rgba(0,229,255,0.22)]">
      <div className="grid h-full w-full place-items-center rounded-full border border-white/10 bg-[#05080c]">
        <div className="text-center">
          <svg
            aria-label="Movitek"
            className="mx-auto h-8 w-10 drop-shadow-[0_0_14px_rgba(0,229,255,0.85)]"
            viewBox="0 0 64 48"
            role="img"
          >
            <path
              d="M8 40V8l24 16L56 8v32h-9V25L32 35 17 25v15H8Z"
              fill="none"
              stroke="url(#movitekGradient)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="7"
            />
            <defs>
              <linearGradient id="movitekGradient" x1="8" x2="56" y1="8" y2="40">
                <stop stopColor="#00e5ff" />
                <stop offset="0.52" stopColor="#245bff" />
                <stop offset="1" stopColor="#ff00c8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

function MovitekMarquee() {
  const items = Array.from({ length: 8 }, (_, index) => index);

  return (
    <div
      aria-label="Promociones Movitek"
      className="overflow-hidden rounded-lg border border-[#00e5ff]/20 bg-[#071018] py-3 shadow-[0_0_34px_rgba(0,229,255,0.08)]"
    >
      <div className="movitek-marquee flex w-max items-center gap-3">
        {[...items, ...items].map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex h-11 items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[conic-gradient(from_210deg,#ffd400,#ff3b30,#ff00c8,#0057ff,#00e5ff,#ffd400)] p-0.5">
              <span className="grid h-full w-full place-items-center rounded-full bg-[#05080c] text-sm font-black text-[#00e5ff]">
                M
              </span>
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              MOVITEK
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#72f3ff]">
              iPhone · Stock · Cotizacion
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [currentModelName, setCurrentModelName] = useState(phoneModels[3].name);
  const [storage, setStorage] = useState(phoneModels[3].storage[0]);
  const [battery, setBattery] = useState(86);
  const [color, setColor] = useState(phoneModels[3].colors[0]);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [condition, setCondition] = useState<DeviceCondition>("new");
  const [selectedDeviceId, setSelectedDeviceId] = useState("new-ip15-128-black");
  const [sheetQuote, setSheetQuote] = useState<SheetQuote | null>(null);
  const [sheetStatus, setSheetStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let isMounted = true;

    async function loadSheetQuote() {
      try {
        const response = await fetch("/api/google-sheet", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Sheet unavailable");
        }

        const data = (await response.json()) as SheetQuote;

        if (isMounted) {
          setSheetQuote(data);
          setSheetStatus("ready");
        }
      } catch {
        if (isMounted) {
          setSheetStatus("error");
        }
      }
    }

    loadSheetQuote();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentModel = useMemo(
    () => phoneModels.find((model) => model.name === currentModelName) ?? phoneModels[0],
    [currentModelName],
  );

  const availableDevices = useMemo(
    () => priceList.filter((device) => device.condition === condition),
    [condition],
  );

  const selectedDevice =
    availableDevices.find((device) => device.id === selectedDeviceId) ?? availableDevices[0];

  const quoteUsdPrice = sheetQuote?.usdPrice ?? selectedDevice?.usdPrice ?? 0;
  const quoteCashPrice = sheetQuote?.pesosPrice ?? pesoValue(quoteUsdPrice);
  const activeDollarRate = sheetQuote?.dollarBlue ?? dollarRate;

  const paymentOptions = selectedDevice
    ? [
        {
          label: "Contado",
          amount: quoteCashPrice,
          detail: "Precio en pesos",
        },
        {
          label: "3 cuotas",
          amount:
            sheetQuote?.installments.three ??
            fallbackInstallment(quoteUsdPrice, installmentRates.three, 3),
          detail: "Cuotas con tarjeta",
        },
        {
          label: "6 cuotas",
          amount:
            sheetQuote?.installments.six ??
            fallbackInstallment(quoteUsdPrice, installmentRates.six, 6),
          detail: "Cuotas con tarjeta",
        },
        {
          label: "12 cuotas",
          amount:
            sheetQuote?.installments.twelve ??
            fallbackInstallment(quoteUsdPrice, installmentRates.twelve, 12),
          detail: "Cuotas con tarjeta",
        },
      ]
    : [];

  const whatsappMessage = selectedDevice
    ? [
        "Hola Movitek, quiero recibir una cotizacion.",
        "",
        `Mi equipo actual: ${currentModelName} ${storage}, color ${color}, bateria ${battery}%.`,
        `Quiero un equipo ${condition === "new" ? "nuevo" : "usado"}: ${getDeviceLabel(
          selectedDevice,
        )}, ${selectedDevice.color}.`,
        selectedDevice.battery ? `Bateria del equipo usado: ${selectedDevice.battery}%.` : "",
        `Precio USD segun planilla: US$ ${quoteUsdPrice}.`,
        `Precio contado estimado: ${currency.format(quoteCashPrice)}.`,
        `Dolar blue usado: ${activeDollarRate}.`,
        "Me pasan la cotizacion final?",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const whatsappHref = `https://wa.me/${movitekWhatsapp}?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  function handleModelChange(modelName: string) {
    const nextModel = phoneModels.find((model) => model.name === modelName) ?? phoneModels[0];
    setCurrentModelName(nextModel.name);
    setStorage(nextModel.storage[0]);
    setColor(nextModel.colors[0]);
    setHasCalculated(false);
  }

  function handleConditionChange(nextCondition: DeviceCondition) {
    const firstDevice = priceList.find((device) => device.condition === nextCondition);
    setCondition(nextCondition);
    if (firstDevice) {
      setSelectedDeviceId(firstDevice.id);
    }
  }

  function handleCalculate() {
    setHasCalculated(true);
  }

  return (
    <main className="min-h-screen bg-[#05080c] text-white">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 sm:px-6">
        <header className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0b1118] p-4">
          <MovitekLogo />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#72f3ff]">
              Movitek.sj
            </p>
            <h1 className="text-2xl font-semibold leading-tight">Cotiza tu iPhone</h1>
          </div>
        </header>

        <MovitekMarquee />

        <section className="rounded-lg border border-white/10 bg-[#0b1118] p-4 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Ingresa los datos de tu dispositivo
              </h2>
              <p className="mt-1 text-sm text-[#9aa7b4]">
                Completa estos datos para calcular opciones disponibles.
              </p>
              <p className="mt-3 inline-flex rounded-md border border-[#00e5ff]/25 bg-[#00e5ff]/10 px-3 py-1 text-xs font-semibold text-[#72f3ff]">
                {sheetStatus === "ready"
                  ? "Google Sheet conectado"
                  : sheetStatus === "loading"
                    ? "Leyendo Google Sheet..."
                    : "Usando valores de respaldo"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#dfe6ee]">Modelo</span>
              <select
                value={currentModelName}
                onChange={(event) => handleModelChange(event.target.value)}
                className="h-12 rounded-md border border-white/10 bg-[#111923] px-3 text-base text-white outline-none transition focus:border-[#00e5ff] focus:ring-4 focus:ring-[#00e5ff]/15"
              >
                {phoneModels.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#dfe6ee]">Memoria</span>
              <select
                value={storage}
                onChange={(event) => {
                  setStorage(event.target.value);
                  setHasCalculated(false);
                }}
                className="h-12 rounded-md border border-white/10 bg-[#111923] px-3 text-base text-white outline-none transition focus:border-[#00e5ff] focus:ring-4 focus:ring-[#00e5ff]/15"
              >
                {currentModel.storage.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-sm font-medium text-[#dfe6ee]">
                Bateria
                <button
                  type="button"
                  aria-label="Donde ver la bateria"
                  className="group relative inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#00e5ff]/50 text-xs font-bold text-[#72f3ff]"
                >
                  ?
                  <span className="pointer-events-none absolute left-1/2 top-7 z-10 hidden w-64 -translate-x-1/2 rounded-md border border-white/10 bg-white p-3 text-left text-xs font-medium leading-5 text-[#111923] shadow-lg group-hover:block group-focus:block">
                    En el iPhone: Ajustes, Bateria, Salud y carga de la bateria.
                    Usa el porcentaje de capacidad maxima.
                  </span>
                </button>
              </span>
              <div className="flex h-12 items-center gap-3 rounded-md border border-white/10 bg-[#111923] px-3">
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={battery}
                  onChange={(event) => {
                    setBattery(Number(event.target.value));
                    setHasCalculated(false);
                  }}
                  className="w-full accent-[#00e5ff]"
                />
                <output className="w-12 text-right font-semibold text-white">{battery}%</output>
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#dfe6ee]">Color</span>
              <select
                value={color}
                onChange={(event) => {
                  setColor(event.target.value);
                  setHasCalculated(false);
                }}
                className="h-12 rounded-md border border-white/10 bg-[#111923] px-3 text-base text-white outline-none transition focus:border-[#00e5ff] focus:ring-4 focus:ring-[#00e5ff]/15"
              >
                {currentModel.colors.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-md bg-[#245bff] px-4 text-base font-semibold text-white shadow-[0_0_24px_rgba(36,91,255,0.35)] transition hover:bg-[#1b4be0]"
          >
            Calcular
          </button>
        </section>

        {hasCalculated ? (
          <>
            <section className="rounded-lg border border-white/10 bg-[#0b1118] p-4 shadow-sm sm:p-6">
              <h2 className="text-xl font-semibold text-white">Que equipo estas buscando?</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { value: "new" as const, label: "Nuevo", detail: "Stock del Excel" },
                  { value: "used" as const, label: "Usado", detail: "Con bateria visible" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleConditionChange(option.value)}
                    className={`rounded-lg border p-4 text-left transition ${
                      condition === option.value
                        ? "border-[#00e5ff] bg-[#00e5ff]/10"
                        : "border-white/10 bg-[#111923]"
                    }`}
                  >
                    <span className="block font-semibold">{option.label}</span>
                    <span className="mt-1 block text-sm text-[#9aa7b4]">{option.detail}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#0b1118] p-4 shadow-sm sm:p-6">
              <h2 className="text-xl font-semibold text-white">
                {condition === "new" ? "Celulares nuevos" : "Celulares usados"}
              </h2>
              <p className="mt-1 text-sm text-[#9aa7b4]">
                Por ahora esta lista esta mockeada. Despues sale del Google Sheet.
              </p>

              <div className="mt-5 grid gap-3">
                {availableDevices.map((device) => (
                  <label
                    key={device.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-4 transition ${
                      selectedDevice.id === device.id
                        ? "border-[#00e5ff] bg-[#00e5ff]/10"
                        : "border-white/10 bg-[#111923] hover:border-[#ff00c8]/45"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="device"
                        value={device.id}
                        checked={selectedDevice.id === device.id}
                        onChange={(event) => setSelectedDeviceId(event.target.value)}
                        className="h-4 w-4 accent-[#00e5ff]"
                      />
                      <span>
                        <span className="block font-semibold text-white">
                          {getDeviceLabel(device)}
                        </span>
                        <span className="block text-sm text-[#9aa7b4]">
                          {device.color} · {device.stock}
                          {device.battery ? ` · Bateria ${device.battery}%` : ""}
                        </span>
                      </span>
                    </span>
                    <strong className="shrink-0 text-right text-[#72f3ff]">
                      US$ {device.usdPrice}
                    </strong>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#00e5ff]/25 bg-[#081018] p-4 text-white shadow-[0_0_44px_rgba(0,229,255,0.08)] sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#72f3ff]">
                Cotizacion
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {selectedDevice ? getDeviceLabel(selectedDevice) : "Sin equipo"}
              </h2>
              <p className="mt-2 text-sm text-[#9aa7b4]">
                Los importes de contado y cuotas salen de la hoja "simular cuotas".
              </p>
              {selectedDevice ? (
                <>
                  <dl className="mt-5 grid gap-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <dt className="text-[#9aa7b4]">Precio USD planilla</dt>
                      <dd className="font-medium">US$ {quoteUsdPrice}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <dt className="text-[#9aa7b4]">Dolar blue</dt>
                      <dd className="font-medium">{currency.format(activeDollarRate)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <dt className="text-[#9aa7b4]">Tu equipo</dt>
                      <dd className="text-right font-medium">
                        {currentModelName}, {storage}, {color}, {battery}%
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <dt className="text-[#9aa7b4]">Tipo buscado</dt>
                      <dd className="font-medium">
                        {condition === "new" ? "Nuevo" : "Usado"}
                      </dd>
                    </div>
                    {selectedDevice.battery ? (
                      <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                        <dt className="text-[#9aa7b4]">Bateria del usado</dt>
                        <dd className="font-medium">{selectedDevice.battery}%</dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {paymentOptions.map((option) => (
                      <article
                        key={option.label}
                        className="rounded-lg border border-white/10 bg-white/[0.07] p-4"
                      >
                        <p className="text-sm text-[#9aa7b4]">{option.label}</p>
                        <strong className="mt-2 block text-2xl text-white">
                          {currency.format(option.amount)}
                        </strong>
                        <span className="mt-1 block text-sm text-[#c9d2dc]">
                          {option.detail}
                        </span>
                      </article>
                    ))}
                  </div>

                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 flex h-12 w-full items-center justify-center rounded-md bg-[#18c964] px-4 text-base font-semibold text-[#041008] transition hover:bg-[#14b558]"
                  >
                    Enviar cotizacion por WhatsApp
                  </a>
                </>
              ) : null}
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
