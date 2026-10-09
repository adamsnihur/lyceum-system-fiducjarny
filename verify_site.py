import asyncio
import os
from playwright.async_api import async_playwright

async def run_tests():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        console_errors = []
        page_errors = []

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        file_path = "file://" + os.path.abspath("Lyceum/system-fiducjarny/index.html")
        print(f"Loading {file_path}...")
        await page.goto(file_path, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2000)

        print("Console errors on load:", console_errors)
        print("Page errors on load:", page_errors)
        assert len(console_errors) == 0, f"Found console errors: {console_errors}"
        assert len(page_errors) == 0, f"Found page errors: {page_errors}"

        # 1. Test Moduł 3: Dylemat Triffina
        print("Testing Module 3: Triffin Dilemma slider...")
        slider_year = page.locator("#sliderTriffinYear")
        await slider_year.fill("1960")
        await slider_year.dispatch_event("input")
        await page.wait_for_timeout(500)
        val_year = await page.locator("#valTriffinYear").inner_text()
        kpi_cover = await page.locator("#kpiCoverRatio").inner_text()
        print(f"Triffin 1960 -> Year: {val_year}, Cover Ratio: {kpi_cover}")
        assert "1960" in val_year
        assert "%" in kpi_cover

        # Przełączenie na 1971
        await slider_year.fill("1971")
        await slider_year.dispatch_event("input")
        await page.wait_for_timeout(500)
        kpi_cover_71 = await page.locator("#kpiCoverRatio").inner_text()
        print(f"Triffin 1971 -> Cover Ratio: {kpi_cover_71}")
        assert "21.8%" in kpi_cover_71

        # 2. Test Moduł 4: Kreacja Pieniądza
        print("Testing Module 4: Money Creation slider...")
        slider_reserve = page.locator("#sliderReserveRatio")
        await slider_reserve.fill("10")
        await slider_reserve.dispatch_event("input")
        await page.wait_for_timeout(500)
        val_reserve = await page.locator("#valReserveRatio").inner_text()
        kpi_mult = await page.locator("#kpiMultiplier").inner_text()
        print(f"Money Creation rr=10% -> Val: {val_reserve}, Multiplier: {kpi_mult}")
        assert "10.0%" in val_reserve

        # 3. Test Moduł 5: Fisher & Inflacja
        print("Testing Module 5: Fisher Inflation slider...")
        slider_m = page.locator("#sliderDeltaM")
        await slider_m.fill("15")
        await slider_m.dispatch_event("input")
        await page.wait_for_timeout(500)
        val_infl = await page.locator("#kpiInflationRate").inner_text()
        print(f"Fisher DeltaM=15% -> Inflation: {val_infl}")
        assert "%" in val_infl

        # 4. Test Moduł 6: Trilemma Buttons
        print("Testing Module 6: Trilemma regime tabs...")
        btn_bw = page.locator(".trilemma-btn[data-regime='brettonWoods']")
        await btn_bw.click()
        await page.wait_for_timeout(400)
        regime_title = await page.locator("#trilemmaRegimeTitle").inner_text()
        print(f"Trilemma Bretton Woods -> Title: {regime_title}")
        assert "Bretton Woods" in regime_title

        btn_euro = page.locator(".trilemma-btn[data-regime='eurozone']")
        await btn_euro.click()
        await page.wait_for_timeout(400)
        regime_title_euro = await page.locator("#trilemmaRegimeTitle").inner_text()
        print(f"Trilemma Eurozone -> Title: {regime_title_euro}")
        assert "Strefa Euro" in regime_title_euro

        # 5. Test Moduł 8: Quiz
        print("Testing Module 8: Quiz question answering...")
        btn_q0 = page.locator("#q_0_opt_1")  # Poprawna opcja (indeks 1)
        await btn_q0.scroll_into_view_if_needed()
        await btn_q0.click()
        await page.wait_for_timeout(400)
        expl_text = await page.locator("#expl_q_0").inner_text()
        badge_score = await page.locator("#quizScoreBadge").inner_text()
        print(f"Quiz Q0 Answered -> Score: {badge_score}, Expl: {expl_text[:50]}...")
        assert "1 / 6" in badge_score
        assert "Prawidłowa odpowiedź" in expl_text

        # 6. Test Jakości Layoutu & Brak Obciętych Tekstów (SVG & DOM)
        print("Testing Layout & Text Clipping across SVG and DOM...")
        clipped_svg = await page.evaluate('''() => {
            const issues = [];
            document.querySelectorAll('svg').forEach(svg => {
                const vb = svg.viewBox.baseVal;
                if (!vb || vb.width === 0) return;
                svg.querySelectorAll('text, tspan').forEach(t => {
                    const text = t.textContent.trim();
                    if (!text) return;
                    try {
                        const bbox = t.getBBox();
                        // Allow small subpixel tolerance of 2px
                        if (bbox.x < vb.x - 2 || (bbox.x + bbox.width) > (vb.x + vb.width + 2)) {
                            issues.push({ text: text, x: bbox.x, width: bbox.width, vb_x: vb.x, vb_w: vb.width });
                        }
                    } catch (e) {}
                });
            });
            return issues;
        }''')
        print(f"SVG Text clipping issues found: {len(clipped_svg)}")
        assert len(clipped_svg) == 0, f"Found clipped SVG text elements: {clipped_svg}"

        # Test responsywności w 3 viewportach (brak poziomego scrolla)
        viewports = [
            ("Desktop 1440px", {"width": 1440, "height": 900}),
            ("Tablet 768px", {"width": 768, "height": 1024}),
            ("Mobile 375px", {"width": 375, "height": 812})
        ]
        for name, vp in viewports:
            await page.set_viewport_size(vp)
            await page.wait_for_timeout(300)
            has_h_scroll = await page.evaluate('''() => {
                return document.documentElement.scrollWidth > window.innerWidth + 2;
            }''')
            print(f"Viewport {name} -> Horizontal scroll detected: {has_h_scroll}")
            assert not has_h_scroll, f"Horizontal scroll detected on {name}!"

        # Reset viewport do screenshotu
        await page.set_viewport_size({"width": 1440, "height": 900})

        # 7. Screenshot dla weryfikacji wizualnej
        screenshot_path = "Lyceum/system-fiducjarny/screenshot_verified.png"
        await page.screenshot(path=screenshot_path, full_page=True)
        print(f"Full page screenshot saved to {screenshot_path}")

        print("Wszystkie asercje testowe zakończone SUKCESEM (PASS)!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_tests())
