---
name: Radical Ledger
colors:
  surface: '#fcf9f2'
  surface-dim: '#dcdad3'
  surface-bright: '#fcf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ec'
  surface-container: '#f0eee7'
  surface-container-high: '#ebe8e1'
  surface-container-highest: '#e5e2db'
  on-surface: '#1c1c18'
  on-surface-variant: '#4d4632'
  inverse-surface: '#31312c'
  inverse-on-surface: '#f3f0ea'
  outline: '#7f7660'
  outline-variant: '#d1c6ab'
  surface-tint: '#735c00'
  primary: '#735c00'
  on-primary: '#ffffff'
  primary-container: '#facc15'
  on-primary-container: '#6c5700'
  inverse-primary: '#eec200'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#d0d1d1'
  on-tertiary-container: '#58595a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe083'
  primary-fixed-dim: '#eec200'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fcf9f2'
  on-background: '#1c1c18'
  surface-variant: '#e5e2db'
typography:
  display-lg:
    fontFamily: Fraunces
    fontSize: 72px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Fraunces
    fontSize: 48px
    fontWeight: '900'
    lineHeight: '1.1'
  headline-lg:
    fontFamily: Fraunces
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Fraunces
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '800'
    lineHeight: '1'
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stroke-thin: 1px
  stroke-thick: 3px
---

## Brand & Style
This design system adopts a **Neo-Brutalist** aesthetic specifically tailored for high-stakes financial environments. It rejects the traditional softness of modern fintech in favor of raw, unapologetic utility. The brand personality is authoritative, transparent, and high-energy. It evokes an emotional response of urgency and precision, treating financial data as a structural element rather than an abstract concept.

The visual style is defined by "hard" interfaces: heavy strokes, zero-radius corners, and high-contrast color blocking. There are no gradients, no blurs, and no organic shapes. Every element exists on a rigid grid, emphasizing the "ledger" nature of the software.

## Colors
The palette is built on a high-contrast "Caution" system. 

- **Primary (#FACC15):** A vibrant yellow used for actions, highlights, and critical data points. It replaces all traditional green success indicators to signal attention and energy.
- **Surface (#FAF7F0):** A warm paper-like neutral that provides a sophisticated base, preventing the high-contrast black/yellow from becoming visually fatiguing.
- **Contrast (#000000 & #FFFFFF):** Pure black is used for all structural borders and primary text. Pure white is reserved for content containers that require maximum separation from the paper background.

## Typography
Typography is the primary driver of hierarchy. 

- **Display & Headlines:** Use **Fraunces** with high-expression settings (Max weight, high optical size). Headlines should feel heavy and grounded.
- **Data & Mono:** **JetBrains Mono** is used for all numerical values, account IDs, and tabular data. The increased weight ensures legibility against heavy borders.
- **Body:** **Inter** provides a neutral, highly readable counterpoint to the more expressive display and mono faces. It is used for descriptions and long-form content.

## Layout & Spacing
The layout follows a **Strict Grid** model. All components are aligned to a 4px baseline and 12-column grid. 

Structural integrity is maintained through visible dividing lines. Instead of using whitespace alone to separate sections, use 1px black borders for internal divisions and 3px borders for primary container boundaries. 

- **Desktop:** 12 columns, 24px gutters, 48px outer margins.
- **Tablet:** 8 columns, 24px gutters, 32px outer margins.
- **Mobile:** 4 columns, 16px gutters, 16px outer margins. Layouts should stack vertically with no horizontal scrolling for data tables; use "card-row" conversions for mobile.

## Elevation & Depth
This design system completely avoids Z-axis simulation via blurs or soft shadows. Depth is achieved through **Hard Offsets**:

- **No Shadows:** Standard elements are flat.
- **Hard Shadow (Active/Hover):** Buttons and cards use a solid black rectangle offset by 4px or 8px (bottom-right) to indicate elevation. 
- **Layering:** Depth is indicated by stacking containers with alternating background colors (e.g., a white card on a yellow background, both with 3px black borders).
- **Visible Lines:** Use "hairline" (1px) borders for table rows and "bold" (3px) borders for main section headers.

## Shapes
The shape language is strictly **Rectilinear**. All corners are set to 0px. This applies to buttons, input fields, cards, and selection indicators. The lack of curves reinforces the industrial, data-heavy nature of the system.

## Components

### Buttons
- **Primary:** #FACC15 background, 3px black border, black JetBrains Mono text (Bold). On hover, add a 4px hard black offset shadow.
- **Secondary:** White background, 3px black border.
- **Ghost:** No background, 1px black border.

### Inputs
- **Field:** White background, 2px black border, 0px radius.
- **Focus State:** Background changes to #FACC15 (Yellow) or border thickness increases to 4px.
- **Labels:** JetBrains Mono, All-caps, Bold, 12px. Positioned strictly above the field.

### Cards & Containers
- Containers must have a 3px black border. 
- Use #FFFFFF for the card background to pop against the #FAF7F0 page surface.
- Headers within cards should be separated by a 2px horizontal black line.

### Data Tables
- Header cells: #FACC15 background, 2px bottom border, JetBrains Mono text.
- Body cells: 1px bottom border. No alternating row colors; use hover states that highlight the entire row in #FACC15.

### Selection Controls
- **Checkboxes/Radios:** 2px black stroke, 0px radius. Selected state is a solid black fill or a heavy "X" mark using the primary yellow.