# ACKO Flexi Life Plan — Post-Payment to Issuance (P2I) Flow

## ENTRY POINT
- User completes payment (₹1,800/month)
- Screen: "Payment done! To issue your policy, we'll need some personal details"
- CTA: Continue → begins Profile Setup

---

## STAGE 1: PROFILE SETUP

### 1A. Personal Details
- Marital status
- Educational qualification (Below 10th / SSC / HSC / Diploma & above)
- Residential status: Resident Indian / NRI / PIO / OCI
- Address: House/Flat No., Apartment/Road/Area, Pincode, City, State

### 1B. Work Details
- Monthly income (after tax) — pre-filled if entered before payment, editable
- Current occupation type:
  - **If Salaried** → Monthly income + Employer name (typeahead search e.g. Tata, Tata Motors…)
  - **If Business owner** → separate financial verification path
  - **If Self-employed** → separate financial verification path

### 1C. Existing Insurance Disclosure
- Do you have existing life insurance? (Yes/No)
  - If Yes → Total sum assured
  - Have you discontinued payments in last 5 years? (Yes/No) → Sum assured
  - Have you currently applied with another insurer? (Yes/No) → Sum assured
  - Have you been rejected/re-proposed before? (Yes/No) → Sum assured
- Have you ever applied for any life insurance policy other than ACKO? (Yes/No)
  - Clarification: includes ULIP, TROP, Term, or similar

### 1D. Nominee Details
- Nominee name, Phone number, Date of birth, Relationship, % of sum assured, Email (optional)
- Option to add multiple nominees
- **If nominee is a minor** → Appointee required:
  - Appointee name, Date of birth, Relationship with nominee, Phone, Email (optional)

### 1E. Profile Setup Complete
- Screen: "Profile setup done! Next: KYC, Financial details, Medical & Lifestyle"
- Auto-transition to Pending Tasks Hub

---

## STAGE 2: PENDING TASKS HUB

Central screen showing task status. Tasks:
1. KYC
2. Financial details
3. Medical and lifestyle information

Statuses per task: Pending / In Progress / Scheduled / Under Review / Completed

Support options always available: See plan / FAQs / Talk to us

---

## STAGE 3: MEDICAL & LIFESTYLE (VMER — Video Medical Evaluation)

### 3A. Initiation
- User taps Medical and lifestyle information from Pending Tasks Hub
- Screen explains: 15–20 min video call, requires camera/mic, quiet location

### 3B. Doctor Availability Check
- **Doctor available now (in ~5 mins)**
  - Show countdown timer
  - Request camera & mic permissions if not already granted
  - CTA: Join call → Video call begins
- **No doctor available currently**
  - Next slot shown (e.g. "available in 2 hours")
  - Option: Schedule a call for later → go to slot picker

### 3C. Schedule Slot (if not joining immediately)
- Date picker (horizontal scroll, 7 days shown)
- Time slots: Morning / Afternoon / Evening (hourly slots)
- Confirmation: "We will send you a video call link an hour before your scheduled slot"
- Post-scheduling status in hub → "Scheduled"

### 3D. Scheduled Call Screen
- Shows: "Your call is scheduled for [Day, Date, Time]"
- Option to Reschedule
- Join call button activates when time approaches
- Pre-call instructions shown: duration, video format, topics covered

### 3E. Slot Conflict Edge Case
- If selected slot was booked by someone else → error screen → redirect to reschedule

### 3F. Post-Call: Response Review
- Trigger: after call ends, user receives Email + WhatsApp to review responses
- Screen: "Review your answers"
  - Health information section:
    - Tobacco/smoking in last year
    - Alcohol consumption → if Yes: frequency, units per week
    - Doctor advised to reduce/stop? (Yes/No) + additional comments
    - Family members deceased before 60 due to severe health conditions
    - Medical attention for listed conditions (e.g. Diabetes)
    - STD/HIV history (self and spouse)
  - Lifestyle information section:
    - Industry of work
    - Nature of work / daily tasks / responsibilities
    - Specific tasks (e.g. bomb disposal)
    - Adventure sports in last 5 years → if Yes: specify activity, type, frequency
    - International travel in last 6 months or planned → if Yes: countries, purpose, duration, accommodation, remote areas
  - Miscellaneous:
    - Legal issues or cases in India or abroad
- Checkbox: "I confirm this is correct" + agree to T&C
- CTA: Submit / "Want to make changes? Talk to us"

### 3G. Post-Review Status
- Medical info → "Under review"
- If additional tests required → PPMC flow triggered (see Stage 3H)
- If no additional tests → Medical evaluation complete

### 3H. PPMC / Additional Health Tests
- Screen: "We require additional health tests to understand your health better"
- Sub-tasks: Test scheduling → Sample collection → Reports under evaluation → Complete

#### Home Test Scheduling
- Address selection: existing addresses (Home/Work) or add new
  - New address form: Flat, Area, Pincode, City, State + Save as (Home/Work/Other)
- Slot picker (same date/time UI as video call)
- Note: "Fasting for 12 hrs is mandatory before the test"
- Confirmation screen shows: Booking ID, date/time, address, assigned technician, reminders

#### Offline fallback
- If online scheduling not available: "We will get in touch with you shortly to schedule your home tests"

### 3I. Additional Documents Required
- Triggered if flagged health conditions need documentation
- Screen lists required documents per condition (e.g. Accident, Hypertension)
- For each condition: list of required docs (discharge summary, MRI, reports etc.)
- Upload interface: PDF, PNG, JPEG, ZIP — max 100MB per category
- Miscellaneous documents section for any additional uploads
- Options: Submit / "I don't have any of these documents" / Talk to us
- Pre-submit confirmation: "Have you uploaded all required documents?" Yes/No
  - If No → partial upload acknowledged → call/health check may be scheduled
- Post-submit: "Documents successfully uploaded. We'll review in 24–48 hours"

---

## STAGE 4: FINANCIAL VERIFICATION

Entry: User taps Financial details in Pending Tasks Hub

### Path A: Salaried
Three options presented:

#### A1. EPFO (Provident Fund)
- Enter registered mobile number → OTP from EPFO
- States:
  - Verifying (in progress)
  - Success → "We have verified your PF information" → Continue
  - Failure → "Try again" or "Show other options"
  - Timeout → "Verification taking longer than usual" → Check in Pending Tasks

#### A2. Account Aggregator
- Consent-based bank statement verification
- States:
  - Success → "Your income has been verified"
  - In progress → "We will notify you once complete"
  - Failure → "Try again" or "Change verification method"

#### A3. Document Upload (manual)
- Upload last 3 months salary slips (Month 1, 2, 3 separately)
- Select document type before upload

### Path B: Business Owner
Two options:

#### B1. GST Verification
- Enter GST number + ownership percentage
- States: Verifying → Success / Failure (same pattern as EPFO)

#### B2. Document Upload (manual)
- Any one of:
  - Income tax returns for last 3 years
  - Form 16A for last 3 years
  - Audited profit & loss account for last 3 years

### Path C: Self-Employed
- Document upload only (same docs as B2)

---

## STAGE 5: KYC
- Shown as a task in Pending Tasks Hub
- Detailed KYC screens not fully specified in this document
- Status: Pending → Completed

---

## STAGE 6: ALL TASKS COMPLETE

- All three tasks (KYC, Financial, Medical) show "Completed"
- Policy moves to issuance/approval
- If any task is "Under Review" → user sees review pending state with estimated timelines
- Support always available via call (1800 266 5433) or email (support.life@acko.com)

---

## NOTIFICATIONS (Email + WhatsApp)
- Post-video call: Review responses reminder
- Additional tests required: Alert with CTA
- Additional documents required: Alert with CTA
- All include support contact details and CTA deep-links back into the app

---

## EDGE CASES & STATES SUMMARY

| Scenario | Handling |
|---|---|
| User drops off mid-flow | Resume from last completed milestone (auto-transition) |
| Nominee is a minor | Appointee details mandatory |
| Monthly income pre-filled before payment | Shown pre-filled, editable |
| Doctor not available | Schedule later or get Email/WhatsApp link |
| Slot booked by another user | Error + reschedule |
| EPFO verification timeout | Async — check status in Pending Tasks |
| Partial document upload | Flagged, call may be scheduled |
| All tasks complete, one under review | Hub shows mixed states, user can proceed with others |
