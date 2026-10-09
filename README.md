# Lyceum: Przejście na System Fiducjarny

> Interaktywny traktat makroekonomiczny i kompendium pojęciowe wyjaśniające ewolucję pieniądza od kotwicy kruszcowej (standard złota, Bretton Woods) do waluty z dekretu państwowego (fiat money) i endogenicznej kreacji dłużnej.

---

## 🏛️ Moduły Traktatu

1. **Istota Pieniądza: Ewolucja od Towaru do Zaufania:** Wyjaśnienie łacińskich korzeni (*fiat* oraz *fides*), teoria chartalizmu (Knapp), mechanizm podatkowego napędu waluty (tax-driven money) oraz status prawnego środka płatniczego (legal tender).
2. **Droga do Zerwania Kotwicy Kruszcowej (1870-1976):** Interaktywna oś czasu kluczowych punktów zwrotnych: Klasyczny Standard Złota (1870-1914), Dekret Roosevelta EO 6102 (1933), Bretton Woods (1944), Szok Nixona (1971) i Porozumienie Jamajskie (1976).
3. **Dylemat Triffina & Szok Nixona (Symulator 1945-1975):** Dynamiczny wykres Plotly zestawiający topniejące rezerwy złota USA w Fort Knox z lawinowo rosnącymi zagranicznymi zobowiązaniami dolarowymi. Wizualizacja punktu krytycznego (1960) oraz zamknięcia okienka złota (15 sierpnia 1971).
4. **Anatomia Kreacji Pieniądza: Pieniądz Dłużny (Endogeniczny):** Obalenie mitu depozytariusza. Modelowanie zjawiska "loans create deposits" (Bank of England 2014), kaskada rezerwy cząstkowej w NBP i paradoks niszczenia pieniądza przy spłacie długu.
5. **Równanie Wymiany Fishera & Podatek Inflacyjny:** Ilościowa teoria pieniądza ($M \cdot V = P \cdot Y$), wyliczanie stopy inflacji $\pi$, projekcja erozji siły nabywczej za $N$ lat oraz transfer siły nabywczej (seniorat).
6. **Niemożliwy Trójkąt Mundella-Fleminga (Trilemma Makroekonomiczna):** Interaktywna geometria wyboru 2 z 3 celów: stały kurs walutowy, swoboda przepływu kapitału, suwerenna polityka monetarna (fiat floating vs Bretton Woods vs Strefa Euro).
7. **Bilans Przejścia: Korzyści vs Patologie:** Analityczne zestawienie zalet (elastyczność antycykliczna, brak gorsetu deflacyjnego) z patologiami (Efekt Cantillona, rozjazd płac i produktywności od 1971 r., eksplozja długu publicznego).
8. **Sprawdzian Zrozumienia (Quiz Dydaktyczny):** 6 pytań testujących zrozumienie pułapek pojęciowych z natychmiastowym feedbackiem i zliczaniem punktów.
9. **Implementacja w Pythonie:** Czysty, modularny skrypt w Pythonie symulujący kreację pieniądza dłużnego, dylemat Triffina i projekcję inflacyjną Fishera.
10. **Słownik Pojęć & Bibliografia Akademicka:** Słownik terminów oraz zestawienie 7 pozycji źródłowych (Triffin, Knapp, Fisher, Mundell, Eichengreen, McLeay et al.).

---

## 🚀 Jak uruchomić

Otwórz plik bezpośrednio w przeglądarce:

```bash
open "Lyceum/system-fiducjarny/index.html"
```

Lub uruchom lokalny serwer HTTP:

```bash
cd "Lyceum/system-fiducjarny"
python3 -m http.server 8000
```

---

## 🧪 Weryfikacja

Wszystkie interakcje, suwaki i zliczanie punktów zostały zweryfikowane bezgłową przeglądarką Playwright (0 błędów konsoli, 0 ostrzeżeń):

```bash
./.venv312/bin/python Lyceum/system-fiducjarny/verify_site.py
```
