# Life Insurance Buy Journey – Figma Design Report

**Source:** [Life - Visual Update](https://www.figma.com/design/e49M9h0d3JjxsNWzR0KvMw/Life---Visual-Update?node-id=16011-20713&m=dev)  
**Captured:** Via Playwright automation (password-protected access)  
**Canvas dimensions:** 30,963 × 9,170 px

---

## 1. Screens/Frames and Step-by-Step Flow

The Life Insurance buy journey is organized into **5 main sections**, arranged left-to-right:

| Section | Approx. Screens | Purpose |
|---------|----------------|---------|
| **Basic Information** | 10–15+ | Collect personal details (name, DOB, contact, address, etc.) |
| **Lifestyle Information** | 6–10 | Collect habits, health, occupation, hobbies, medical history |
| **Quote Page** | 3–5 | Show personalized quotes, coverage options, premiums |
| **Add-ons Flow** | 10–12 | Select optional riders (critical illness, waiver of premium, etc.) |
| **Review** | 3–5 | Summary of data, policy, add-ons, and final premium before purchase |

### Flow Summary

```
Intro/Onboarding → Basic Info → Lifestyle Info → Quote → Add-ons → Review → Purchase
```

- **Mobile-first:** All frames are portrait-oriented (phone dimensions).
- **Linear progression:** Clear left-to-right flow with labeled sections.
- **Chunked data collection:** Each section is broken into multiple small steps to reduce cognitive load.

---

## 2. Visual Design Patterns

### Layout
- **Orientation:** Portrait mobile screens (single-column).
- **Backgrounds:** Light (white/light grey) content areas on dark Figma canvas.
- **Structure:** Modular, wizard-style flow with distinct stages.

### Colors (inferred from thumbnails)
- **Content:** Light backgrounds with dark text.
- **Brand:** Likely ACKO purple (#522ED5) for primary actions (per project design system).
- **Neutrals:** Onyx scale for text and borders.

### Typography
- **Labels:** Sans-serif, clear hierarchy.
- **Readability:** High contrast, structured headings.

### Design Language
- Clean, modern, step-by-step.
- Focus on clarity and guided progression.
- Minimalist, functional UI.

---

## 3. UI Components (Expected)

| Component Type | Usage |
|----------------|--------|
| **Form fields** | Text inputs, date pickers, radio buttons, checkboxes, dropdowns |
| **CTAs** | "Next", "Continue", "Get Quote", "Select Plan", "Add to Policy", "Review & Submit" |
| **Progress** | Progress bars or step indicators |
| **Cards** | Quote options, add-on descriptions |
| **Icons/Illustrations** | Icons for sections, simple illustrations for guidance |

---

## 4. Section Details

### Basic Information
- **Screens:** 10–12+ frames.
- **Content:** Name, age, gender, contact, address, residency, dependents.
- **UI:** Form-heavy, likely one question or small group per screen.

### Lifestyle Information
- **Screens:** 6–10 frames.
- **Content:** Smoking, alcohol, occupation, hobbies, medical history, family history.
- **UI:** Multiple-choice, conditional follow-ups, possible illustrations.

### Quote Page
- **Screens:** 3–5 frames.
- **Content:** Premiums, coverage options, policy terms.
- **UI:** Numbers, summary cards, comparison, primary CTAs.

### Add-ons Flow
- **Screens:** 10–12 frames in two clusters.
- **Content:** Optional riders (critical illness, waiver of premium, accidental death, child term).
- **UI:** Toggles/checkboxes, descriptions, premium impact.

### Review
- **Screens:** 3–5 frames.
- **Content:** Summary of data, policy, add-ons, total premium.
- **UI:** Summary lists, edit links, "Submit" / "Proceed to Payment" CTA.

---

## 5. Comparison to Typical Insurance Buy Flows

| Aspect | This Design | Typical Insurance |
|--------|-------------|-------------------|
| **Structure** | Clear stages (Basic → Lifestyle → Quote → Add-ons → Review) | Similar staged flows |
| **Mobile** | Mobile-first, portrait screens | Increasingly common |
| **Chunking** | Many small steps | Often fewer, longer forms |
| **Add-ons** | Dedicated multi-step flow | Often inline or single screen |
| **Review** | Dedicated review step | Standard before purchase |

---

## 6. Screenshots Captured

| File | Description |
|------|-------------|
| `01-overview-zoomed-out.png` | Initial load / overview |
| `02-zoomed-in-basic.png` | Full journey at 4% zoom |
| `03-pan-right.png` | Pan right – Basic Info + Lifestyle |
| `04-lifestyle-section.png` | Lifestyle + Quote + Add-ons |
| `05-quote-section.png` | Quote + Add-ons + Review |
| `06-addons-section.png` | Add-ons + Review |
| `07-review-section.png` | End of journey – Review |

**Note:** Close-up screenshots in `closeups/` hit WebGL/zoom issues in headless mode; overview captures are reliable.

---

## 7. Alignment with Project Design System

From `prototype/skill.md`:

- **Primary:** Purple (#522ED5 / purple-600)
- **Font:** Euclid Circular B
- **Radius:** xl/2xl for cards, full for pills
- **Motion:** Framer Motion, 200–400ms, ease-out
- **Icons:** Custom SVG only (no emojis)

The Life journey should follow these patterns for consistency with Health and Motor.

---

## 8. Recommendations for Implementation

1. **LOB isolation:** Mirror Health: `lib/life/`, `components/life/`, `app/life/page.tsx`.
2. **Conversational UI:** Use the same progressive, chat-like pattern as Health.
3. **Script structure:** Define steps for Basic Info, Lifestyle, Quote, Add-ons, Review.
4. **Design tokens:** Reuse ACKO purple, Euclid font, and radius tokens.
5. **Mobile-first:** Implement for 375px width, then scale up.
