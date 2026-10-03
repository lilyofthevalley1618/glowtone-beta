# Korean 12-type personal color (퍼스널 컬러 진단): consultant criteria
Researched Oct 3, 2026 (PT). Short summary for Glowtone's Expert scan and palettes.

## How consultants decide
1. **Undertone (웜/쿨) first.** Skin base leaning golden/yellow = warm (봄, 가을); pink/blue = cool (여름, 겨울). In CIELAB this is the hue angle h° (yellower = warm). [1][2]
2. **Value (명도: light ↔ deep).** Overall lightness of skin, hair and eyes taken together (L*). Within warm, value separates Spring (high) from Autumn (medium–low). [1][3]
3. **Chroma (채도: clear/bright ↔ mute/soft).** How vivid vs. grayed the person's coloring reads (C*). Within cool, chroma separates Summer (low) from Winter (high). [1][3]
4. **Contrast (대비).** The value gap between skin and hair/eyes. Dark hair on fair skin = high contrast (Winter, Bright, Deep); everything blending = low contrast (Light, Mute). Strong contrast can make someone read "deep" even with fair skin. [2][5][6]
5. **Drapes confirm.** Consultants hold color cloths under the face. The right colors even out the skin and brighten the eyes; the wrong ones add shadows, dullness or a gray/yellow cast. Results can differ between studios: the system is a guide, not a hard rule. [4][7]

Season summary [1]: Spring = warm, high value, mid–high chroma, medium contrast · Summer = cool, mid–high value, low chroma, low contrast · Autumn = warm, mid–low value, low chroma, medium contrast · Winter = cool, low value or extreme, high chroma, high contrast.

## The 12 types (most common Korean set) [3][4][7]
| Type | Criteria (T / V / C / contrast) | Flattering | Unflattering |
|---|---|---|---|
| 봄 웜 라이트 Spring Light | warm · high · soft-clear · low | cream, peach, light yellow, mint | black, burgundy, dark/heavy colors |
| 봄 웜 브라이트 Spring Bright | warm · mid-high · high · med-high | clear orange, coral, yellow-green, turquoise | dusty, grayed colors |
| 봄 웜 트루 Spring True | clearly warm · mid-high · mid-high · medium | coral, apricot, ivory, golden yellow | cool grays, icy colors, black |
| 여름 쿨 라이트 Summer Light | cool · high · low-mid · low | lavender, baby blue, rose, pastels | orange, mustard, heavy dark colors |
| 여름 쿨 뮤트 Summer Mute | cool · mid · low (grayed) · low | grayish blue, mauve, dusty rose | vivid/neon, black, yellow-orange |
| 여름 쿨 트루 Summer True | clearly cool · mid-high · low-mid · gentle | powder blue, rose pink, cool gray, soft navy | yellow/orange-heavy colors |
| 가을 웜 뮤트 Autumn Mute | warm · mid · low · low | khaki beige, dusty camel, olive, soft orange | very light pastels, vivid colors |
| 가을 웜 트루 Autumn True | clearly warm · mid · mid · medium | camel, brick, olive, mustard | icy pastels, fuchsia, cool gray |
| 가을 웜 딥 Autumn Deep | warm · low · mid · med-high | chocolate, terracotta, deep olive, wine brown | ivory/light pink (skin looks "floating") |
| 겨울 쿨 브라이트 Winter Bright | cool · mid · very high · high | vivid red, electric blue, magenta, fuchsia | murky, muddy colors (look tired) |
| 겨울 쿨 트루 Winter True | clearly cool · mid-low · high · high | black & white, true red, royal blue | warm earthy tones |
| 겨울 쿨 딥 Winter Deep | cool · low · mid-high · high | black, deep navy, dark emerald, burgundy | light, faint pastels |

## Corrections made to `js/palettes.js`
- The milestone-1 names **Spring Vivid, Summer Bright, Autumn Strong and Winter Vivid** were replaced with the **True** types, the most common Korean 12-type set: 봄 웜 트루, 여름 쿨 트루, 가을 웜 트루, 겨울 쿨 트루. Namu Wiki notes most studios fold "Strong" into Bright, Mute or Deep, and "Vivid" isn't a standard type name; some studios do use 여름 브라이트 and 가을 스트롱. [5][6]
- New palettes for Spring True and Summer True. Autumn True and Winter True keep their rich-warm and high-contrast-cool palettes, which match the sources.
- Autumn Mute's avoid list now includes light pastels ("make the face look spread out"). [4]
- Each type now has `crit` (Expert scan targets for T, V, C and contrast) plus re-tuned `proto` values. Saved results with the old ids are migrated automatically.
- Note: the landing page (parked) still shows the old Vivid/Strong names in its 12-type grid.

## Sources
1. Clad, "퍼스널컬러란? 색채학으로 보는 4계절 진단의 원리" (hue, value and chroma mapped to h°, L*, C*, plus a season table): https://www.your-personal-color.com/personal-color/
2. 세모테, "퍼스널컬러 진단" (undertone + value, chroma, contrast; golden vs pink base): https://aiselftest.com/personalcolor/
3. ELARA / tonecheck, "퍼스널컬러 12타입 총정리": https://tonecheck.net/guides/personal-color-12-types
4. Beauty Insight, "12가지 퍼스널컬러 완전정리" (best and worst colors per type): https://beautyinsight.tistory.com/210
5. 나무위키, "퍼스널 컬러" (PCCS tones per type, Strong-type note, results vary by studio): https://namu.wiki/w/퍼스널%20컬러 (English mirror: https://en.namu.wiki/w/퍼스널%20컬러)
6. Tone & Fit, "What Color Season Am I?" (contrast, light, soft and bright rules): https://toneandfit.app/guides/find-my-color-season/
7. PersonalColorAI, "How Korean 12-Season Color Analysis Works": https://personalcolorai.com/blog/korean-personal-color-analysis-12-seasons
