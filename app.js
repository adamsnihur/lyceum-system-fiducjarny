/**
 * Lyceum: Traktat o Przejściu na System Fiducjarny
 * Silnik interaktywny, obliczenia makroekonomiczne i wizualizacje Plotly.js
 * Standard: SaaS Light EdTech, 60 FPS, zero błędów konsoli
 */

// =============================================================================
// 1. DANE HISTORYCZNE DLA DYLEMATU TRIFFINA (1945 - 1975)
// =============================================================================
const TRIFFIN_DATA = [
  { year: 1945, goldReserves: 20.1, foreignClaims: 3.2, note: "Koniec II Wojny Światowej. USA posiadają ponad 60% światowych rezerw złota. Wskaźnik pokrycia >600%." },
  { year: 1948, goldReserves: 24.4, foreignClaims: 5.1, note: "Początek Planu Marshalla. Eksport kapitału z USA odbudowuje Europę, zasilając ją w dolary." },
  { year: 1950, goldReserves: 22.8, foreignClaims: 6.5, note: "Wojna w Korei. Pierwszy powojenny deficyt bilansu płatniczego USA. Złoto powoli odpływa." },
  { year: 1953, goldReserves: 22.1, foreignClaims: 8.9, note: "Stabilizacja powojenna. Rezerwy dolarowe w Europie i Japonii rosną szybciej niż złoto w Fort Knox." },
  { year: 1956, goldReserves: 21.9, foreignClaims: 12.3, note: "Kryzys Sueski. Wzrost roli dolara jako globalnego środka płatniczego i waluty rezerwowej." },
  { year: 1958, goldReserves: 20.6, foreignClaims: 15.0, note: "Powrót wymienialności walut zachodnioeuropejskich. Europejskie banki centralne gromadzą dolary." },
  { year: 1960, goldReserves: 17.8, foreignClaims: 18.7, note: "Punkt krytyczny Triffina! Robert Triffin ostrzega Kongres: zagraniczne roszczenia przewyższyły rezerwy złota USA (pokrycie < 100%)." },
  { year: 1962, goldReserves: 16.1, foreignClaims: 22.4, note: "Powstanie London Gold Pool - konsorcjum banków centralnych próbujące sztucznie utrzymać cenę złota na poziomie 35 USD za uncję." },
  { year: 1965, goldReserves: 14.1, foreignClaims: 26.8, note: "Wystąpienie Charlesa de Gaulle'a. Francja żąda fizycznej wymiany setek milionów dolarów na złoto i wysyła okręt wojenny." },
  { year: 1968, goldReserves: 10.9, foreignClaims: 32.5, note: "Rozpad London Gold Pool po panice na rynkach kruszcu. Ustanowienie dwupoziomowego rynku złota (oficjalny 35 USD vs rynkowy wolny)." },
  { year: 1970, goldReserves: 11.1, foreignClaims: 40.2, note: "Wojna w Wietnamie i program Great Society pompują deficyt USA. Masowa ucieczka kapitału z dolara do marki niemieckiej (D-Mark)." },
  { year: 1971, goldReserves: 10.2, foreignClaims: 46.8, note: "15 sierpnia 1971: Szok Nixona! Prezydent Richard Nixon jednostronnie zawiesza wymienialność dolara na złoto. Koniec Bretton Woods." },
  { year: 1972, goldReserves: 10.5, foreignClaims: 58.0, note: "Porozumienie ze Smithsonian - nieudana próba ratowania stałych kursów poprzez dewaluację dolara do 38 USD za uncję." },
  { year: 1973, goldReserves: 11.6, foreignClaims: 67.2, note: "Ostateczne załamanie sztywnych powiązań kursowych. Rozpoczęcie ery płynnych kursów walutowych na świecie." },
  { year: 1975, goldReserves: 11.6, foreignClaims: 82.5, note: "Przygotowania do Porozumienia Jamajskiego (1976). Złoto zostaje formalnie usunięte z międzynarodowego systemu walutowego (demonetyzacja)." }
];

// =============================================================================
// 2. INICJALIZACJA I GŁÓWNY PUNKT WEJŚCIA
// =============================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Render formuł KaTeX
  if (window.renderMathInElement) {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }

  // Inicjalizacja Modułów
  initTriffinModule();
  initMoneyCreationModule();
  initFisherModule();
  initTrilemmaModule();
  initQuizModule();
  initCodeCopyModule();
  initScrollSpy();

  // Resize wykresów przy zmianie okna
  window.addEventListener("resize", () => {
    Plotly.Plots.resize("plotTriffin");
    Plotly.Plots.resize("plotMoneyCreation");
    Plotly.Plots.resize("plotFisher");
  });
});

// =============================================================================
// 3. MODUŁ 3: DYLEMAT TRIFFINA I SZOK NIXONA
// =============================================================================
function initTriffinModule() {
  const slider = document.getElementById("sliderTriffinYear");
  const yearDisplay = document.getElementById("valTriffinYear");
  const kpiCover = document.getElementById("kpiCoverRatio");
  const kpiGold = document.getElementById("kpiGoldValue");
  const kpiClaims = document.getElementById("kpiDollarClaims");
  const kpiDeficit = document.getElementById("kpiTriffinDeficit");
  const narrativeBox = document.getElementById("triffinNarrativeText");
  const badgeStatus = document.getElementById("triffinStatusBadge");

  function update() {
    const selectedYear = parseInt(slider.value, 10);
    yearDisplay.textContent = selectedYear;

    // Interpolacja lub wyszukanie punktu
    let curr = TRIFFIN_DATA.find(d => d.year === selectedYear);
    if (!curr) {
      // Prosta interpolacja liniowa jeśli krok pomiędzy punktami
      const prev = TRIFFIN_DATA.filter(d => d.year <= selectedYear).pop() || TRIFFIN_DATA[0];
      const next = TRIFFIN_DATA.filter(d => d.year >= selectedYear).shift() || TRIFFIN_DATA[TRIFFIN_DATA.length - 1];
      if (prev.year === next.year) {
        curr = prev;
      } else {
        const factor = (selectedYear - prev.year) / (next.year - prev.year);
        curr = {
          year: selectedYear,
          goldReserves: prev.goldReserves + factor * (next.goldReserves - prev.goldReserves),
          foreignClaims: prev.foreignClaims + factor * (next.foreignClaims - prev.foreignClaims),
          note: prev.note
        };
      }
    }

    const coverRatio = (curr.goldReserves / curr.foreignClaims) * 100;
    const deficit = curr.foreignClaims - curr.goldReserves;

    kpiCover.textContent = coverRatio.toFixed(1) + "%";
    kpiGold.textContent = curr.goldReserves.toFixed(1) + " mld $";
    kpiClaims.textContent = curr.foreignClaims.toFixed(1) + " mld $";

    if (deficit > 0) {
      kpiDeficit.textContent = "-" + deficit.toFixed(1) + " mld $";
      kpiDeficit.className = "text-xl font-bold font-mono text-rose-600";
    } else {
      kpiDeficit.textContent = "+" + Math.abs(deficit).toFixed(1) + " mld $";
      kpiDeficit.className = "text-xl font-bold font-mono text-emerald-600";
    }

    // Status i kolory
    if (coverRatio >= 100) {
      kpiCover.className = "text-2xl font-bold font-mono text-emerald-600";
      badgeStatus.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200";
      badgeStatus.textContent = "Pełne Pokrycie Kruszcowe (Płynność Bezpieczna)";
    } else if (coverRatio >= 40) {
      kpiCover.className = "text-2xl font-bold font-mono text-amber-600";
      badgeStatus.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200";
      badgeStatus.textContent = "Strefa Ryzyka: Dylemat Triffina w Pełni";
    } else {
      kpiCover.className = "text-2xl font-bold font-mono text-rose-600";
      badgeStatus.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200";
      badgeStatus.textContent = "Kryzys Wypłacalności: Nieuchronny Run na Złoto!";
    }

    narrativeBox.textContent = curr.note;

    renderTriffinChart(selectedYear, curr);
  }

  function renderTriffinChart(selectedYear, currentPoint) {
    const years = TRIFFIN_DATA.map(d => d.year);
    const gold = TRIFFIN_DATA.map(d => d.goldReserves);
    const claims = TRIFFIN_DATA.map(d => d.foreignClaims);

    const traceGold = {
      x: years,
      y: gold,
      name: "Rezerwy Złota USA (mld $ po 35$/oz)",
      type: "scatter",
      mode: "lines+markers",
      line: { color: "#d97706", width: 3 },
      marker: { size: 6, color: "#b45309" }
    };

    const traceClaims = {
      x: years,
      y: claims,
      name: "Zagraniczne Zobowiązania Dolarowe (mld $)",
      type: "scatter",
      mode: "lines+markers",
      line: { color: "#2563eb", width: 3 },
      marker: { size: 6, color: "#1d4ed8" }
    };

    // Wskaźnik roku (pionowa linia)
    const cursorLine = {
      x: [selectedYear, selectedYear],
      y: [0, 90],
      name: `Wybrany Rok: ${selectedYear}`,
      type: "scatter",
      mode: "lines",
      line: { color: "#e11d48", width: 2, dash: "dot" },
      hoverinfo: "none"
    };

    // Kropki na aktywnej pozycji
    const activeGoldPoint = {
      x: [selectedYear],
      y: [currentPoint.goldReserves],
      name: "Złoto w wybranym roku",
      type: "scatter",
      mode: "markers",
      marker: { size: 12, color: "#d97706", line: { color: "#ffffff", width: 2 } },
      showlegend: false
    };

    const activeClaimsPoint = {
      x: [selectedYear],
      y: [currentPoint.foreignClaims],
      name: "Dolary w wybranym roku",
      type: "scatter",
      mode: "markers",
      marker: { size: 12, color: "#2563eb", line: { color: "#ffffff", width: 2 } },
      showlegend: false
    };

    const layout = {
      margin: { t: 30, r: 25, l: 45, b: 40 },
      autosize: true,
      height: 380,
      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#f8fafc",
      xaxis: {
        title: { text: "Rok", font: { size: 11, color: "#64748b" } },
        gridcolor: "#e2e8f0",
        tickmode: "linear",
        tick0: 1945,
        dtick: 5,
        range: [1944, 1976]
      },
      yaxis: {
        title: { text: "Wartość (mld USD)", font: { size: 11, color: "#64748b" } },
        gridcolor: "#e2e8f0",
        range: [0, 90]
      },
      legend: {
        orientation: "h",
        y: 1.12,
        x: 0,
        font: { size: 10, color: "#334155" }
      },
      annotations: [
        {
          x: 1960,
          y: 20,
          xref: "x",
          yref: "y",
          text: "1960: Przecięcie (Triffin)",
          showarrow: true,
          arrowhead: 2,
          arrowsize: 1,
          arrowcolor: "#475569",
          ax: -40,
          ay: -35,
          font: { size: 10, color: "#0f172a", family: "JetBrains Mono" },
          bgcolor: "#f1f5f9",
          bordercolor: "#cbd5e1",
          borderwidth: 1,
          borderpad: 4
        },
        {
          x: 1971,
          y: 47,
          xref: "x",
          yref: "y",
          text: "15.08.1971: Szok Nixona",
          showarrow: true,
          arrowhead: 2,
          arrowsize: 1,
          arrowcolor: "#e11d48",
          ax: -55,
          ay: -40,
          font: { size: 10, color: "#991b1b", family: "JetBrains Mono" },
          bgcolor: "#fee2e2",
          bordercolor: "#fca5a5",
          borderwidth: 1,
          borderpad: 4
        }
      ]
    };

    const config = { responsive: true, displayModeBar: false };
    Plotly.react("plotTriffin", [traceGold, traceClaims, cursorLine, activeGoldPoint, activeClaimsPoint], layout, config);
  }

  slider.addEventListener("input", update);
  update();
}

// =============================================================================
// 4. MODUŁ 4: ANATOMIA NOWOCZESNEJ KREACJI PIENIĄDZA
// =============================================================================
function initMoneyCreationModule() {
  const sliderBase = document.getElementById("sliderBaseMoney");
  const sliderReserve = document.getElementById("sliderReserveRatio");
  const sliderLending = document.getElementById("sliderLendingRate");

  const valBase = document.getElementById("valBaseMoney");
  const valReserve = document.getElementById("valReserveRatio");
  const valLending = document.getElementById("valLendingRate");

  const kpiTotal = document.getElementById("kpiTotalMoney");
  const kpiCreated = document.getElementById("kpiCreatedDebt");
  const kpiDebtShare = document.getElementById("kpiDebtShare");
  const kpiMultiplier = document.getElementById("kpiMultiplier");

  function update() {
    const base = parseFloat(sliderBase.value);
    const rr = parseFloat(sliderReserve.value) / 100;
    const lend = parseFloat(sliderLending.value) / 100;

    valBase.textContent = base.toLocaleString("pl-PL") + " zł";
    valReserve.textContent = (rr * 100).toFixed(1) + "%";
    valLending.textContent = (lend * 100).toFixed(0) + "%";

    // Obliczenie sumy szeregu geometrycznego (kolejne rundy)
    // Runda 0: Depozyt = base
    // Runda 1: Kredyt = base * (1 - rr) * lend
    // Runda 2: Kredyt = PoprzedniKredyt * (1 - rr) * lend ...
    const ratio = (1 - rr) * lend;
    let totalMoney = 0;
    if (ratio < 1) {
      totalMoney = base / (1 - ratio);
    } else {
      totalMoney = base / 0.001; // Zabezpieczenie
    }

    const createdDebt = totalMoney - base;
    const debtShare = totalMoney > 0 ? (createdDebt / totalMoney) * 100 : 0;
    const effMultiplier = base > 0 ? totalMoney / base : 1;

    kpiTotal.textContent = Math.round(totalMoney).toLocaleString("pl-PL") + " zł";
    kpiCreated.textContent = Math.round(createdDebt).toLocaleString("pl-PL") + " zł";
    kpiDebtShare.textContent = debtShare.toFixed(1) + "%";
    kpiMultiplier.textContent = effMultiplier.toFixed(2) + "x";

    renderMoneyRounds(base, rr, lend);
  }

  function renderMoneyRounds(base, rr, lend) {
    const rounds = 8;
    const roundLabels = [];
    const deposits = [];
    const reserves = [];
    const loans = [];

    let currentDeposit = base;
    for (let i = 1; i <= rounds; i++) {
      roundLabels.push(`Runda ${i}`);
      const res = currentDeposit * rr;
      const loan = currentDeposit * (1 - rr) * lend;

      deposits.push(Math.round(currentDeposit));
      reserves.push(Math.round(res));
      loans.push(Math.round(loan));

      currentDeposit = loan; // Następna runda zasilana nowo wykreowanym kredytem
    }

    const traceDeposits = {
      x: roundLabels,
      y: deposits,
      name: "Depozyt w Rundzie",
      type: "bar",
      marker: { color: "#3b82f6" }
    };

    const traceLoans = {
      x: roundLabels,
      y: loans,
      name: "Nowy Kredyt (Kreacja)",
      type: "bar",
      marker: { color: "#10b981" }
    };

    const traceReserves = {
      x: roundLabels,
      y: reserves,
      name: "Rezerwa Obowiązkowa",
      type: "bar",
      marker: { color: "#f59e0b" }
    };

    const layout = {
      margin: { t: 30, r: 20, l: 50, b: 40 },
      barmode: "group",
      autosize: true,
      height: 360,
      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#f8fafc",
      xaxis: {
        gridcolor: "#e2e8f0",
        tickfont: { size: 10, color: "#64748b" }
      },
      yaxis: {
        title: { text: "Kwota (PLN)", font: { size: 11, color: "#64748b" } },
        gridcolor: "#e2e8f0"
      },
      legend: {
        orientation: "h",
        y: 1.14,
        x: 0,
        font: { size: 10, color: "#334155" }
      }
    };

    const config = { responsive: true, displayModeBar: false };
    Plotly.react("plotMoneyCreation", [traceDeposits, traceLoans, traceReserves], layout, config);
  }

  sliderBase.addEventListener("input", update);
  sliderReserve.addEventListener("input", update);
  sliderLending.addEventListener("input", update);
  update();
}

// =============================================================================
// 5. MODUŁ 5: RÓWNANIE FISHERA I PODATEK INFLACYJNY
// =============================================================================
function initFisherModule() {
  const sliderM = document.getElementById("sliderDeltaM");
  const sliderV = document.getElementById("sliderDeltaV");
  const sliderY = document.getElementById("sliderDeltaY");
  const sliderYears = document.getElementById("sliderHorizonYears");

  const valM = document.getElementById("valDeltaM");
  const valV = document.getElementById("valDeltaV");
  const valY = document.getElementById("valDeltaY");
  const valYears = document.getElementById("valHorizonYears");

  const kpiInfl = document.getElementById("kpiInflationRate");
  const kpiPower = document.getElementById("kpiRealPurchasingPower");
  const kpiLoss = document.getElementById("kpiLossPercent");
  const kpiSeigniorage = document.getElementById("kpiSeigniorageVal");

  function update() {
    const deltaM = parseFloat(sliderM.value) / 100;
    const deltaV = parseFloat(sliderV.value) / 100;
    const deltaY = parseFloat(sliderY.value) / 100;
    const horizon = parseInt(sliderYears.value, 10);

    valM.textContent = (deltaM >= 0 ? "+" : "") + (deltaM * 100).toFixed(1) + "%";
    valV.textContent = (deltaV >= 0 ? "+" : "") + (deltaV * 100).toFixed(1) + "%";
    valY.textContent = (deltaY >= 0 ? "+" : "") + (deltaY * 100).toFixed(1) + "%";
    valYears.textContent = horizon + " lat";

    // Wyliczenie rocznej stopy inflacji pi:
    // (1 + pi) = (1 + deltaM) * (1 + deltaV) / (1 + deltaY)
    const inflationRate = ((1 + deltaM) * (1 + deltaV) / (1 + deltaY)) - 1;
    const inflPercent = inflationRate * 100;

    // Siła nabywcza po N latach przy stałej inflacji
    const futurePower = 100 / Math.pow(1 + Math.max(-0.2, inflationRate), horizon);
    const lossPercent = Math.max(0, 100 - futurePower);

    kpiInfl.textContent = (inflPercent >= 0 ? "+" : "") + inflPercent.toFixed(1) + "%";
    if (inflPercent <= 3.5 && inflPercent >= 1.0) {
      kpiInfl.className = "text-2xl font-bold font-mono text-emerald-600";
    } else if (inflPercent > 3.5 && inflPercent <= 8.0) {
      kpiInfl.className = "text-2xl font-bold font-mono text-amber-600";
    } else {
      kpiInfl.className = "text-2xl font-bold font-mono text-rose-600";
    }

    kpiPower.textContent = futurePower.toFixed(1) + " zł";
    kpiLoss.textContent = "-" + lossPercent.toFixed(1) + "%";

    // Szacunkowy transfer wartości (seigniorage / realny podatek)
    kpiSeigniorage.textContent = (deltaM * 100).toFixed(1) + "% PKB";

    renderFisherChart(inflationRate, horizon);
  }

  function renderFisherChart(inflationRate, horizon) {
    const yearsArray = [];
    const userPowerArray = [];
    const goldRealPower = []; // Złoto historycznie zachowujące ~100% siły nabywczej

    for (let t = 0; t <= Math.max(25, horizon); t++) {
      yearsArray.push(t);
      const val = 100 / Math.pow(1 + Math.max(-0.2, inflationRate), t);
      userPowerArray.push(Math.max(0, val));
      goldRealPower.push(100); // Wzorzec stałej siły nabywczej kruszcu
    }

    const traceSim = {
      x: yearsArray,
      y: userPowerArray,
      name: "Twój Model Fiducjarny (Siła Nabywcza)",
      type: "scatter",
      mode: "lines",
      line: { color: "#e11d48", width: 3 }
    };

    const traceGold = {
      x: yearsArray,
      y: goldRealPower,
      name: "Wzorzec Kruszcowy (Stała Siła Nabywcza)",
      type: "scatter",
      mode: "lines",
      line: { color: "#d97706", width: 2, dash: "dash" }
    };

    const cursorMarker = {
      x: [horizon],
      y: [100 / Math.pow(1 + Math.max(-0.2, inflationRate), horizon)],
      name: `Horyzont: ${horizon} lat`,
      type: "scatter",
      mode: "markers",
      marker: { size: 12, color: "#2563eb", line: { color: "#ffffff", width: 2 } }
    };

    const layout = {
      margin: { t: 30, r: 20, l: 45, b: 40 },
      autosize: true,
      height: 360,
      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#f8fafc",
      xaxis: {
        title: { text: "Liczba Lat w Przyszłość", font: { size: 11, color: "#64748b" } },
        gridcolor: "#e2e8f0"
      },
      yaxis: {
        title: { text: "Realna Wartość Koszyka (z początkowych 100)", font: { size: 11, color: "#64748b" } },
        gridcolor: "#e2e8f0",
        range: [0, 115]
      },
      legend: {
        orientation: "h",
        y: 1.14,
        x: 0,
        font: { size: 10, color: "#334155" }
      }
    };

    const config = { responsive: true, displayModeBar: false };
    Plotly.react("plotFisher", [traceSim, traceGold, cursorMarker], layout, config);
  }

  sliderM.addEventListener("input", update);
  sliderV.addEventListener("input", update);
  sliderY.addEventListener("input", update);
  sliderYears.addEventListener("input", update);
  update();
}

// =============================================================================
// 6. MODUŁ 6: NIEMOŻLIWY TRÓJKĄT MUNDELLA-FLEMINGA
// =============================================================================
const TRILEMMA_REGIMES = {
  fiatFloating: {
    title: "Współczesny Płynny Pieniądz Fiducjarny (Polska, USA, Wielka Brytania, Japonia)",
    badge: "Wybór: Wolny Kapitał + Niezależna Polityka",
    abandoned: "Poświęcony Cel: Sztywny Kurs Walutowy (Kurs jest płynny / floating)",
    desc: "Kraj pozwala rynkowi swobodnie wyceniać walutę (kurs płynny). W zamian bank centralny ma pełną swobodę ustalania stóp procentowych dla walki z inflacją lub recesją, a inwestorzy mogą bez przeszkód transferować kapitał za granicę.",
    edgeA: "active", // Capital <-> Autonomy
    node1: "disabled", // Fixed rate
    node2: "active",   // Capital
    node3: "active"    // Autonomy
  },
  brettonWoods: {
    title: "Standard Złota / Bretton Woods (Przed 1971 rokiem)",
    badge: "Wybór: Stały Kurs + Niezależna Polityka / Kotwica Kruszcu",
    abandoned: "Poświęcony Cel: Swoboda Przepływu Kapitału (Wymagała restrykcyjnych kontroli kapitałowych)",
    desc: "Kurs waluty jest ściśle powiązany ze złotem lub dolarem. Aby bank centralny mógł prowadzić własną politykę wewnętrzną, państwo musi wprowadzić drastyczne kontrole dewizowe i zakazy transferu złota/kapitału za granicę.",
    edgeA: "disabled",
    node1: "active",
    node2: "disabled",
    node3: "active"
  },
  eurozone: {
    title: "Unia Walutowa / Sztywny Peg Walutowy (Strefa Euro, Hongkong, Dania)",
    badge: "Wybór: Stały Kurs + Swobodny Przepływ Kapitału",
    abandoned: "Poświęcony Cel: Suwerenna Polityka Monetarna (Brak własnego banku centralnego)",
    desc: "Kurs jest zablokowany na sztywno (lub państwa przyjęły jedną wspólną walutę - Euro), a kapitał płynie bez barier. Konsekwencja: żaden pojedynczy kraj (np. Grecja, Włochy) nie może obniżyć stóp procentowych ani zdewaluować waluty, by wyjść z kryzysu.",
    edgeA: "disabled",
    node1: "active",
    node2: "active",
    node3: "disabled"
  }
};

function initTrilemmaModule() {
  const buttons = document.querySelectorAll(".trilemma-btn");
  const titleEl = document.getElementById("trilemmaRegimeTitle");
  const badgeEl = document.getElementById("trilemmaRegimeBadge");
  const abandonedEl = document.getElementById("trilemmaAbandonedGoal");
  const descEl = document.getElementById("trilemmaRegimeDesc");

  const nodeFixed = document.getElementById("nodeFixedRate");
  const nodeCapital = document.getElementById("nodeFreeCapital");
  const nodeAutonomy = document.getElementById("nodeMonetaryAutonomy");

  const line12 = document.getElementById("lineFixedCapital");
  const line23 = document.getElementById("lineCapitalAutonomy");
  const line31 = document.getElementById("lineAutonomyFixed");

  function selectRegime(key) {
    const data = TRILEMMA_REGIMES[key];
    if (!data) return;

    buttons.forEach(btn => {
      if (btn.dataset.regime === key) {
        btn.className = "trilemma-btn px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm transition-all";
      } else {
        btn.className = "trilemma-btn px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all";
      }
    });

    titleEl.textContent = data.title;
    badgeEl.textContent = data.badge;
    abandonedEl.textContent = data.abandoned;
    descEl.textContent = data.desc;

    // Stylizacja wierzchołków SVG
    applyNodeStyle(nodeFixed, data.node1);
    applyNodeStyle(nodeCapital, data.node2);
    applyNodeStyle(nodeAutonomy, data.node3);

    // Krawędzie
    if (key === "fiatFloating") {
      // łączy Capital (node2) i Autonomy (node3)
      setLineStyle(line23, "#2563eb", 4);
      setLineStyle(line12, "#cbd5e1", 2, "4,4");
      setLineStyle(line31, "#cbd5e1", 2, "4,4");
    } else if (key === "brettonWoods") {
      // łączy Fixed (node1) i Autonomy (node3)
      setLineStyle(line31, "#d97706", 4);
      setLineStyle(line12, "#cbd5e1", 2, "4,4");
      setLineStyle(line23, "#cbd5e1", 2, "4,4");
    } else if (key === "eurozone") {
      // łączy Fixed (node1) i Capital (node2)
      setLineStyle(line12, "#059669", 4);
      setLineStyle(line23, "#cbd5e1", 2, "4,4");
      setLineStyle(line31, "#cbd5e1", 2, "4,4");
    }
  }

  function applyNodeStyle(el, state) {
    if (!el) return;
    if (state === "active") {
      el.setAttribute("fill", "#2563eb");
      el.setAttribute("stroke", "#ffffff");
      el.setAttribute("stroke-width", "3");
      el.setAttribute("opacity", "1");
    } else {
      el.setAttribute("fill", "#94a3b8");
      el.setAttribute("stroke", "#e2e8f0");
      el.setAttribute("stroke-width", "2");
      el.setAttribute("opacity", "0.4");
    }
  }

  function setLineStyle(el, stroke, width, dash = "none") {
    if (!el) return;
    el.setAttribute("stroke", stroke);
    el.setAttribute("stroke-width", width);
    if (dash === "none") {
      el.removeAttribute("stroke-dasharray");
    } else {
      el.setAttribute("stroke-dasharray", dash);
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => selectRegime(btn.dataset.regime));
  });

  // Domyślny wybór: Współczesny płynny fiat
  selectRegime("fiatFloating");
}

// =============================================================================
// 7. MODUŁ 8: QUIZ SPRAWDZAJĄCY ZROZUMIENIE
// =============================================================================
const QUIZ_QUESTIONS = [
  {
    question: "Co stanowi fundament wartości współczesnego pieniądza fiducjarnego (fiat), skoro nie jest on wymienialny na złoto?",
    options: [
      "Fizyczna rzadkość papieru i zabezpieczeń holograficznych w banknotach.",
      "Przymus prawny (legal tender), obowiązek uiszczania podatków w tej walucie oraz zaufanie do państwa i banku centralnego.",
      "Ukryte rezerwy platyny i diamentów zdeponowane w Bazylei przez BIS.",
      "Zobowiązanie MFW do skupu walut po stałym kursie w razie kryzysu."
    ],
    correct: 1,
    explanation: "Zgodnie z teorią chartalizmu (Knapp) i prawem państwowym, waluta fiat ma wartość, ponieważ państwo pod rygorem sankcji wymaga płacenia w niej podatków oraz nadaje jej status jedynego prawnego środka umarzania zobowiązań. Dodatkowym filarem jest zaufanie (fides) uczestników rynku, że inni odbiorcy również ją zaakceptują."
  },
  {
    question: "Na czym polegał fundamentalny Dylemat Triffina w powojennym systemie z Bretton Woods?",
    options: [
      "Na konflikcie między rosnącym zapotrzebowaniem świata na dolary dla handlu a spadkiem wskaźnika pokrycia tych dolarów złotem w USA.",
      "Na braku zgody między Keynesem a White'em co do lokalizacji siedziby MFW.",
      "Na niemożności prowadzenia handlu z ZSRR z powodu embarga na złoto.",
      "Na różnicy w gęstości złota z kopalni w RPA w porównaniu do złota z Alaski."
    ],
    correct: 0,
    explanation: "Aby zapewnić płynność handlu światowego, USA musiały generować chroniczny deficyt bilansu płatniczego (eksportować dolary). Jednak im więcej dolarów krążyło za granicą, tym bardziej malało zaufanie do ich wymienialności na złoto po 35 USD/oz, aż w końcu roszczenia zagraniczne wielokrotnie przewyższyły rezerwy Fort Knox."
  },
  {
    question: "W jaki sposób powstaje zdecydowana większość (ok. 90-95%) współczesnego pieniądza w gospodarce?",
    options: [
      "Jest drukowana w państwowych mennicach i papierniach wartościowych.",
      "Bank centralny wysyła czeki każdemu obywatelowi na początku każdego roku.",
      "Przez banki komercyjne w momencie udzielania kredytów - kredyt tworzy nowy depozyt bezgotówkowy.",
      "Poprzez wydobycie surowców energetycznych i ich certyfikację."
    ],
    correct: 2,
    explanation: "Jak oficjalnie wyjaśnia Bank of England (2014) i EBC, we współczesnym systemie to kredyty tworzą depozyty ('loans create deposits'). Gdy bank komercyjny udziela kredytu, nie pożycza cudzych oszczędności ze skarbca, lecz tworzy nowy zapis księgowy w pasywach i aktywach, generując nowy pieniądz z długu."
  },
  {
    question: "Dlaczego Richard Nixon 15 sierpnia 1971 roku ogłosił 'tymczasowe' zamknięcie okienka złota (tzw. Szok Nixona)?",
    options: [
      "Ponieważ złoto zostało całkowicie zużyte w przemyśle mikroprocesorowym.",
      "Ponieważ zagraniczne banki centralne (m.in. Francji i RFN) zażądały wymiany miliardów dolarów na złoto, grożąc wyczyszczeniem skarbców USA.",
      "Z powodu zaleceń Miltona Friedmana, by natychmiast wprowadzić walutę w 100% cyfrową.",
      "Ponieważ odkryto gigantyczne złoża złota w Teksasie, co zdewaluowało kruszec."
    ],
    correct: 1,
    explanation: "Koszty wojny w Wietnamie oraz programów socjalnych doprowadziły do nadpodaży dolara. Gdy europejskie banki centralne (zwłaszcza Francja de Gaulle'a) zaczęły masowo realizować prawo do wymiany papierowych rezerw na fizyczne złoto po 35 USD za uncję, rezerwy USA stopniały do poziomu krytycznego. Nixon zablokował wymienialność, ratując resztki złota."
  },
  {
    question: "Czym jest tzw. Efekt Cantillona w kontekście kreacji pieniądza fiducjarnego?",
    options: [
      "Automatycznym wyrównywaniem się cen koszyka dóbr w skali całego świata.",
      "Zjawiskiem, w którym nowy pieniądz trafia najpierw do wybranych podmiotów (sektor finansowy, rząd), przynosząc im korzyść, zanim wywoła wzrost cen kosztem reszty społeczeństwa.",
      "Efektem psychologicznym polegającym na gromadzeniu monet o wysokim nominale.",
      "Wzrostem siły nabywczej emerytów podczas ekspansji monetarnej."
    ],
    correct: 1,
    explanation: "Richard Cantillon zauważył, że nowy pieniądz nie rozchodzi się po gospodarce równomiernie jak deszcz. Ci, którzy otrzymują go jako pierwsi (banki, korporacje, rząd), wydają go po starych cenach. Gdy pieniądz w końcu dotrze do pracowników najemnych, ceny towarów i aktywów zdążyły już wzrosnąć."
  },
  {
    question: "Zgodnie z Niemożliwym Trójkątem Mundella-Fleminga, co zyskuje kraj, który rezygnuje ze stałego kursu walutowego na rzecz kursu płynnego?",
    options: [
      "Gwarancję zerowej stopy bezrobocia przez 50 lat.",
      "Możliwość jednoczesnego utrzymania swobody przepływu kapitału i suwerennej polityki stóp procentowych.",
      "Brak jakichkolwiek wahań cen importowanych towarów.",
      "Automatyczne członkostwo w Radzie Bezpieczeństwa ONZ."
    ],
    correct: 1,
    explanation: "Płynny kurs walutowy pełni rolę amortyzatora wstrząsów zewnętrznych. Dzięki rezygnacji ze sztywnego kursu, polski NBP czy Fed mogą podnosić lub obniżać stopy procentowe zależnie od krajowej sytuacji, nie blokując międzynarodowych transferów kapitału."
  }
];

function initQuizModule() {
  const container = document.getElementById("quizContainer");
  const scoreBadge = document.getElementById("quizScoreBadge");
  const resetBtn = document.getElementById("btnResetQuiz");

  let answeredCount = 0;
  let correctCount = 0;
  const userAnswers = new Array(QUIZ_QUESTIONS.length).fill(null);

  function renderQuiz() {
    container.innerHTML = "";
    answeredCount = 0;
    correctCount = 0;

    QUIZ_QUESTIONS.forEach((q, qIndex) => {
      const card = document.createElement("div");
      card.className = "p-5 bg-white border border-slate-200 rounded-xl space-y-3";
      card.id = `quizCard_${qIndex}`;

      const header = document.createElement("div");
      header.className = "flex items-start justify-between gap-3";
      header.innerHTML = `
        <div class="text-sm font-bold text-slate-900 leading-snug">
          <span class="font-mono text-blue-600 mr-1.5">${qIndex + 1}.</span> ${q.question}
        </div>
        <span id="badge_q_${qIndex}" class="shrink-0 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
          Oczekuje
        </span>
      `;
      card.appendChild(header);

      const optsContainer = document.createElement("div");
      optsContainer.className = "space-y-2 pt-1";

      q.options.forEach((optText, optIndex) => {
        const btn = document.createElement("button");
        btn.className = "quiz-opt-btn";
        btn.id = `q_${qIndex}_opt_${optIndex}`;
        btn.innerHTML = `
          <span class="w-5 h-5 rounded-full border border-slate-300 text-xs font-mono flex items-center justify-center shrink-0 text-slate-500">
            ${String.fromCharCode(65 + optIndex)}
          </span>
          <span class="text-xs leading-relaxed text-slate-700">${optText}</span>
        `;

        btn.addEventListener("click", () => handleAnswer(qIndex, optIndex));
        optsContainer.appendChild(btn);
      });
      card.appendChild(optsContainer);

      const explBox = document.createElement("div");
      explBox.id = `expl_q_${qIndex}`;
      explBox.className = "hidden text-xs p-3.5 rounded-lg leading-relaxed mt-2";
      card.appendChild(explBox);

      container.appendChild(card);
    });

    updateScoreDisplay();
  }

  function handleAnswer(qIndex, selectedOpt) {
    if (userAnswers[qIndex] !== null) return; // Już odpowiedziano

    userAnswers[qIndex] = selectedOpt;
    answeredCount++;
    const q = QUIZ_QUESTIONS[qIndex];
    const isCorrect = selectedOpt === q.correct;
    if (isCorrect) correctCount++;

    // Zablokuj przyciski tego pytania
    q.options.forEach((_, optIndex) => {
      const btn = document.getElementById(`q_${qIndex}_opt_${optIndex}`);
      btn.disabled = true;
      if (optIndex === q.correct) {
        btn.classList.add("correct");
        btn.querySelector("span:first-child").className = "w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-mono flex items-center justify-center shrink-0";
      } else if (optIndex === selectedOpt && !isCorrect) {
        btn.classList.add("incorrect");
        btn.querySelector("span:first-child").className = "w-5 h-5 rounded-full bg-rose-600 text-white text-xs font-mono flex items-center justify-center shrink-0";
      }
    });

    // Badge statusu
    const badge = document.getElementById(`badge_q_${qIndex}`);
    if (isCorrect) {
      badge.className = "shrink-0 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800";
      badge.textContent = "Poprawnie (+1)";
    } else {
      badge.className = "shrink-0 text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800";
      badge.textContent = "Błąd (0)";
    }

    // Wyjaśnienie
    const explBox = document.getElementById(`expl_q_${qIndex}`);
    explBox.classList.remove("hidden");
    if (isCorrect) {
      explBox.className = "text-xs p-3.5 rounded-lg leading-relaxed mt-2 bg-emerald-50 border border-emerald-200 text-emerald-900";
      explBox.innerHTML = `<strong>Prawidłowa odpowiedź:</strong> ${q.explanation}`;
    } else {
      explBox.className = "text-xs p-3.5 rounded-lg leading-relaxed mt-2 bg-rose-50 border border-rose-200 text-rose-900";
      explBox.innerHTML = `<strong>Błędny wybór.</strong> Poprawna opcja to <strong>${String.fromCharCode(65 + q.correct)}</strong>.<br>${q.explanation}`;
    }

    updateScoreDisplay();
  }

  function updateScoreDisplay() {
    scoreBadge.textContent = `${correctCount} / ${QUIZ_QUESTIONS.length}`;
    if (answeredCount === QUIZ_QUESTIONS.length) {
      if (correctCount >= 5) {
        scoreBadge.className = "px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-mono text-sm font-bold";
      } else if (correctCount >= 3) {
        scoreBadge.className = "px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-mono text-sm font-bold";
      } else {
        scoreBadge.className = "px-3 py-1 bg-rose-100 text-rose-800 rounded-full font-mono text-sm font-bold";
      }
    }
  }

  resetBtn.addEventListener("click", () => {
    userAnswers.fill(null);
    renderQuiz();
  });

  renderQuiz();
}

// =============================================================================
// 8. KOPIOWANIE KODU PYTHONA
// =============================================================================
function initCodeCopyModule() {
  const btn = document.getElementById("btnCopyPython");
  const codeEl = document.getElementById("pythonCodeSnippet");

  if (!btn || !codeEl) return;

  btn.addEventListener("click", () => {
    const text = codeEl.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btn.innerHTML;
      btn.innerHTML = "<span>✓ Skopiowano!</span>";
      btn.className = "btn-secondary text-xs text-emerald-700 border-emerald-300";
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.className = "btn-secondary text-xs";
      }, 2500);
    }).catch(err => {
      console.error("Błąd kopiowania: ", err);
    });
  });
}

// =============================================================================
// 9. SCROLLSPY DLA TOC W SIDEBARZE
// =============================================================================
function initScrollSpy() {
  const links = document.querySelectorAll(".nav-link");
  const sections = [];

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) sections.push({ link, target });
    }
  });

  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach(({ link, target }) => {
      const top = target.offsetTop;
      const height = target.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        links.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
      }
    });
  });
}
