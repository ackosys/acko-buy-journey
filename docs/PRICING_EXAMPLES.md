# ACKO Life Insurance - Pricing Examples

## Quick Reference: Common Scenarios

### Scenario 1: Fresh Graduate (25-year-old)
```
👤 Profile:
   - Age: 25 years
   - Gender: Male
   - Smoking: Never
   - Job: Software Engineer (Low Risk)
   - Coverage: ₹50 lakh
   - Term: 30 years

💰 Base Premium: ₹2,340/year (₹195/month or ₹6/day)

🛡️ Add-ons:
   ✓ Accidental Death (₹50L): +₹250/yr
   ✓ Critical Illness (₹25L): +₹200/yr
   
📊 Total: ₹2,790/year (₹232/month)
```

### Scenario 2: Young Parent (30-year-old)
```
👤 Profile:
   - Age: 30 years
   - Gender: Female
   - Smoking: Never
   - Job: Teacher (Low Risk)
   - Coverage: ₹1 Crore
   - Term: 25 years

💰 Base Premium: ₹5,225/year (₹435/month or ₹14/day)

🛡️ Add-ons:
   ✓ Accidental Death (₹1Cr): +₹500/yr
   ✓ Disability (₹50L): +₹150/yr
   ✓ Critical Illness (₹50L): +₹440/yr
   
📊 Total: ₹6,315/year (₹526/month)
   
⚡ Business Rules:
   • Accidental cap: ₹1,568 (30% of base)
   • Used: ₹650 (41%)
   • Remaining: ₹918
```

### Scenario 3: Established Professional (35-year-old)
```
👤 Profile:
   - Age: 35 years
   - Gender: Male
   - Smoking: Never
   - Job: Manager (Low Risk)
   - Coverage: ₹1 Crore
   - Term: 20 years

💰 Base Premium: ₹8,213/year (₹684/month or ₹22/day)

🛡️ Add-ons:
   ✓ Accidental Death (₹2Cr): +₹1,000/yr
   ✓ Disability (₹1Cr): +₹300/yr
   ✓ Critical Illness (₹50L): +₹480/yr
   
📊 Total: ₹9,993/year (₹833/month)
   
⚡ Business Rules:
   • Accidental cap: ₹2,464 (30% of base)
   • Used: ₹1,300 (53%)
   • Remaining: ₹1,164
```

### Scenario 4: Mid-Career (40-year-old, Smoker)
```
👤 Profile:
   - Age: 40 years
   - Gender: Male
   - Smoking: Current (!)
   - Job: Sales Manager (Medium Risk)
   - Coverage: ₹1.5 Crore
   - Term: 20 years

💰 Base Premium: ₹29,592/year (₹2,466/month or ₹81/day)

🛡️ Add-ons:
   ✓ Accidental Death (₹1.5Cr): +₹750/yr
   ✓ Critical Illness (₹75L): +₹1,080/yr
   
📊 Total: ₹31,422/year (₹2,619/month)
   
⚡ Business Rules:
   • Accidental cap: ₹8,878 (30% of base)
   • Used: ₹750 (8%)
   • Remaining: ₹8,128
   
💡 Tip: Quitting smoking could save ₹11,100/year!
```

### Scenario 5: High-Risk Job (38-year-old)
```
👤 Profile:
   - Age: 38 years
   - Gender: Male
   - Smoking: Never
   - Job: Construction Manager (High Risk!)
   - Coverage: ₹2 Crore
   - Term: 25 years

💰 Base Premium: ₹33,928/year (₹2,827/month or ₹93/day)

🛡️ Add-ons:
   ✓ Accidental Death (₹4Cr): +₹2,000/yr
   ✓ Disability (₹2Cr): +₹600/yr
   ❌ Critical Illness: Skipped
   
📊 Total: ₹36,528/year (₹3,044/month)
   
⚡ Business Rules:
   • Accidental cap: ₹10,178 (30% of base)
   • Used: ₹2,600 (26%)
   • Remaining: ₹7,578
```

## Rider Pricing Quick Reference

| Rider | Cost per ₹10L | Example (₹50L) | Max Coverage |
|-------|--------------|----------------|--------------|
| **Accidental Death** | ₹50/yr | ₹250/yr | 2x base |
| **Disability** | ₹30/yr | ₹150/yr | 1x base |
| **Critical Illness** | ₹80/yr | ₹400/yr | 1x base |

## Age Impact Chart

| Age | ₹1 Cr Base Premium (Male, Non-smoker, 20yr term) |
|-----|--------------------------------------------------|
| 25  | ₹4,928/year (~₹410/month) |
| 30  | ₹6,570/year (~₹548/month) |
| 35  | ₹8,213/year (~₹684/month) |
| 40  | ₹10,512/year (~₹876/month) |
| 45  | ₹13,797/year (~₹1,150/month) |
| 50  | ₹19,710/year (~₹1,643/month) |

## Smoking Impact

**Example**: 35-year-old male, ₹1 Crore, 20-year term

| Status | Annual Premium | Monthly | vs Non-smoker |
|--------|---------------|---------|---------------|
| Never  | ₹8,213 | ₹684 | Baseline |
| Past   | ₹9,445 | ₹787 | +15% (+₹1,232/yr) |
| Current| ₹14,783 | ₹1,232 | +80% (+₹6,570/yr) |

**💡 Insight**: Quitting smoking = Save enough for an iPhone every 2 years!

## Coverage Amount Impact

**Example**: 30-year-old male, non-smoker, 20-year term

| Coverage | Annual Premium | Monthly | Daily |
|----------|---------------|---------|-------|
| ₹25 lakh | ₹1,643 | ₹137 | ₹4.50 |
| ₹50 lakh | ₹3,285 | ₹274 | ₹9 |
| ₹1 crore | ₹6,570 | ₹548 | ₹18 |
| ₹2 crore | ₹13,140 | ₹1,095 | ₹36 |
| ₹5 crore | ₹32,850 | ₹2,738 | ₹90 |

## Business Rules at a Glance

### ⚠️ Accidental Rider Cap (30% Rule)

```
If Base Premium = ₹10,000/year
Then Accidental Limit = ₹3,000/year (30%)

Example combinations that work:
✅ Accidental Death (₹1Cr) + Disability (₹50L) = ₹500 + ₹150 = ₹650
✅ Accidental Death (₹2Cr) + Disability (₹1Cr) = ₹1,000 + ₹300 = ₹1,300
✅ Accidental Death (₹2Cr) only = ₹1,000
✅ Both at max: Accidental Death (₹4Cr) + Disability (₹2Cr) = ₹2,000 + ₹600 = ₹2,600

Doesn't work:
❌ Accidental Death (₹6Cr) + Disability (₹2Cr) = ₹3,000 + ₹600 = ₹3,600 (exceeds limit)
```

### 💚 Critical Illness Cap (100% Rule)

```
If Base Premium = ₹10,000/year
Then CI Limit = ₹10,000/year (100%)

This is SEPARATE from accidental cap!

Example:
✅ Base: ₹10,000
✅ Accidental Death (₹2Cr): ₹1,000
✅ Disability (₹1Cr): ₹300
✅ Critical Illness (₹1Cr): ₹8,000
Total: ₹19,300/year

Accidental: ₹1,300 / ₹3,000 (43% used) ✅
Critical: ₹8,000 / ₹10,000 (80% used) ✅
```

## Key Takeaways

1. **Start Early**: 25-year-olds pay 25% less than 30-year-olds
2. **Women Save**: ~15-20% lower premiums than men
3. **Quit Smoking**: Save up to 45% on premiums
4. **Longer Terms**: 30-40 year terms = 5-8% discount
5. **Riders Are Affordable**: Typically add only 5-15% to base premium
6. **Two Separate Caps**: Accidental (30%) and Critical Illness (100%) are independent

## Calculator

**Want to estimate your premium?**

```
Step 1: Find your base rate (₹1 Cr, male, 30, non-smoker, 20yr) = ₹6,570

Step 2: Adjust for your profile:
• Different age? Multiply by age factor
• Female? Multiply by 0.84
• Smoker? Multiply by 1.8
• High-risk job? Multiply by 1.65
• Different coverage? Multiply by (your coverage / 1 Cr)

Step 3: Add riders:
• Accidental Death: Coverage × ₹0.005
• Disability: Coverage × ₹0.003
• Critical Illness: Coverage × ₹0.008

Example: 35-year-old female, ₹50L, non-smoker, low risk
= 6,570 × 1.25 (age) × 0.84 (female) × 0.5 (coverage)
= ₹3,450/year

+ Accidental Death (₹50L) = 50L × 0.005 = ₹250
+ Critical Illness (₹25L) = 25L × 0.008 = ₹200
Total = ₹3,900/year (₹325/month)
```

---

**Note**: These are estimates based on ACKO's publicly available pricing structure. Actual premiums may vary based on detailed medical underwriting, health conditions, and policy-specific terms. For exact quotes, complete the application with your specific details.
