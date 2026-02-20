# ACKO Life Insurance Pricing Module

## Overview
This module provides realistic pricing calculations for ACKO Life Insurance term plans and riders, based on actual ACKO pricing structure as of 2026.

## Data Sources
- [ACKO Low-Cost Term Insurance](https://www.acko.com/life-insurance/cheap-term-life-insurance/)
- [ACKO 1 Crore Term Insurance](https://www.acko.com/life-insurance/1-crore-term-insurance/)
- [ACKO Critical Illness Rider](https://www.acko.com/life-insurance/critical-illness-insurance/)

## Base Premium Pricing

### Starting Rates
- **₹18/day** (~₹6,570/year) for ₹1 Cr coverage
- 30-year-old non-smoking male
- 20-year policy term
- Low-risk occupation

### Base Rate Structure
```
Male:   ₹6.57 per ₹1 lakh coverage (annual)
Female: ₹5.50 per ₹1 lakh coverage (annual, ~15-20% lower)
```

### Age-Based Pricing Multipliers
| Age Range | Multiplier | Example (₹1Cr, Male) |
|-----------|-----------|---------------------|
| 18-25     | 0.75x     | ₹4,927/yr          |
| 26-30     | 1.0x      | ₹6,570/yr          |
| 31-35     | 1.25x     | ₹8,213/yr          |
| 36-40     | 1.6x      | ₹10,512/yr         |
| 41-45     | 2.1x      | ₹13,797/yr         |
| 46-50     | 3.0x      | ₹19,710/yr         |
| 51-55     | 4.2x      | ₹27,594/yr         |
| 56-60     | 6.0x      | ₹39,420/yr         |

### Smoking Status Impact
| Status  | Multiplier | Impact |
|---------|-----------|--------|
| Never   | 1.0x      | Base rate |
| Past    | 1.15x     | +15% |
| Current | 1.8x      | +80% |

### Occupation Risk Impact
| Risk Level | Multiplier | Examples |
|-----------|-----------|----------|
| Low       | 1.0x      | Desk jobs, IT professionals, teachers |
| Medium    | 1.25x     | Field work, sales, moderate physical work |
| High      | 1.65x     | Mining, construction, hazardous work |

### Policy Term Adjustments
| Term    | Multiplier | Benefit |
|---------|-----------|---------|
| 10 yrs  | 1.1x      | Shorter commitment |
| 15 yrs  | 1.05x     | - |
| 20 yrs  | 1.0x      | Base (optimal) |
| 25 yrs  | 0.98x     | Slight discount |
| 30 yrs  | 0.95x     | -5% |
| 35 yrs  | 0.93x     | -7% |
| 40 yrs  | 0.92x     | -8% (best value) |

## Rider Pricing

### Available Riders

#### 1. Accidental Death Benefit Rider
- **Premium**: ₹0.50 per ₹1 lakh coverage (annual)
- **Example**: ₹50/yr per ₹10 lakh coverage
- **Max Coverage**: 2x base sum assured
- **Min Coverage**: ₹5 lakh
- **Category**: Accidental (counts toward 30% cap)
- **Age Impact**: Minimal
- **Smoking Impact**: None

#### 2. Accidental Total Permanent Disability Rider
- **Premium**: ₹0.30 per ₹1 lakh coverage (annual)
- **Example**: ₹30/yr per ₹10 lakh coverage
- **Max Coverage**: 1x base sum assured
- **Min Coverage**: ₹5 lakh
- **Category**: Accidental (counts toward 30% cap)
- **Age Impact**: Minimal
- **Smoking Impact**: None

#### 3. Critical Illness Benefit Rider
- **Premium**: ₹0.80 per ₹1 lakh coverage (annual)
- **Example**: ₹80/yr per ₹10 lakh coverage
- **Max Coverage**: 1x base sum assured
- **Min Coverage**: ₹5 lakh
- **Category**: Critical Illness (separate 100% cap)
- **Age Impact**: Moderate (1.0x ≤35, 1.2x ≤45, 1.5x >45)
- **Smoking Impact**: Yes (same as base)

## Business Rules

### 1. Accidental Rider Premium Cap
**Rule**: Combined accidental rider premiums ≤ 30% of base premium

**Example**:
```
Base Premium: ₹10,000/yr
Accidental Limit: ₹3,000/yr (30%)

✅ Valid:
- Accidental Death (₹50L): ₹250
- Disability (₹50L): ₹150
- Total: ₹400 (13% of base)

❌ Invalid:
- Accidental Death (₹1Cr): ₹2,500
- Disability (₹50L): ₹1,500
- Total: ₹4,000 (exceeds 30% limit)
```

### 2. Critical Illness Premium Cap
**Rule**: Critical illness rider premium ≤ 100% of base premium

**Example**:
```
Base Premium: ₹10,000/yr
CI Limit: ₹10,000/yr (100%)

✅ Valid:
- Critical Illness (₹50L): ₹4,000 (40% of base)

❌ Invalid:
- Critical Illness (₹1Cr): ₹12,000 (exceeds 100% limit)
```

**Note**: Critical illness cap is **independent** of accidental cap.

## Real-World Examples

### Example 1: Young Professional
**Profile**:
- Age: 25
- Gender: Male
- Smoking: Never
- Occupation: Software Engineer (Low Risk)
- Coverage: ₹50 lakh
- Term: 30 years

**Premium Calculation**:
```
Base Rate: ₹6.57 per lakh
Coverage: 50 lakhs
Age Multiplier: 0.75
Term Multiplier: 0.95

Base Premium = 6.57 × 50 × 0.75 × 0.95
             = ₹2,340/year
             = ₹195/month
             = ₹6.4/day
```

**With Riders**:
```
+ Accidental Death (₹50L): ₹250/yr
+ Critical Illness (₹25L): ₹200/yr
Total Premium: ₹2,790/year (₹232/month)
```

### Example 2: Mid-Career Parent
**Profile**:
- Age: 35
- Gender: Female
- Smoking: Never
- Occupation: Marketing Manager (Low Risk)
- Coverage: ₹1 Crore
- Term: 25 years

**Premium Calculation**:
```
Base Rate: ₹5.50 per lakh (female)
Coverage: 100 lakhs
Age Multiplier: 1.25
Term Multiplier: 0.98

Base Premium = 5.50 × 100 × 1.25 × 0.98
             = ₹6,738/year
             = ₹562/month
```

**With Riders**:
```
+ Accidental Death (₹1Cr): ₹500/yr
+ Disability (₹50L): ₹150/yr
+ Critical Illness (₹50L): ₹500/yr
Total Premium: ₹7,888/year (₹657/month)
```

### Example 3: Established Professional (Smoker)
**Profile**:
- Age: 40
- Gender: Male
- Smoking: Current
- Occupation: Construction Manager (High Risk)
- Coverage: ₹2 Crore
- Term: 20 years

**Premium Calculation**:
```
Base Rate: ₹6.57 per lakh
Coverage: 200 lakhs
Age Multiplier: 1.6
Smoking Multiplier: 1.8
Occupation Multiplier: 1.65
Term Multiplier: 1.0

Base Premium = 6.57 × 200 × 1.6 × 1.8 × 1.65
             = ₹62,578/year
             = ₹5,215/month
```

**Accidental Limit**: ₹18,773/yr (30%)
**CI Limit**: ₹62,578/yr (100%)

## Usage in Code

### Calculate Base Premium
```typescript
import { calculateBasePremium, PricingFactors } from '@/lib/life/pricing';

const factors: PricingFactors = {
  age: 30,
  gender: 'male',
  smokingStatus: 'never',
  sumAssured: 10000000, // ₹1 Cr
  policyTerm: 20,
  occupationRisk: 'low',
};

const premium = calculateBasePremium(factors);
// Returns: 6570 (annual premium)
```

### Calculate Rider Premium
```typescript
import { calculateRiderPremium } from '@/lib/life/pricing';

const riderPremium = calculateRiderPremium(
  'accidental_death',
  5000000, // ₹50 lakh coverage
  30,      // age
  'never'  // smoking status
);
// Returns: 250 (annual premium)
```

### Calculate Total with Riders
```typescript
import { calculateTotalPremium, SelectedRider } from '@/lib/life/pricing';

const breakdown = calculateTotalPremium(
  factors,
  [
    { riderId: 'accidental_death', coverageAmount: 5000000 },
    { riderId: 'critical_illness', coverageAmount: 2500000 },
  ]
);

console.log(breakdown);
// {
//   basePremium: 6570,
//   accidentalRidersPremium: 250,
//   criticalIllnessRidersPremium: 200,
//   totalPremium: 7020,
//   monthlyPremium: 585,
//   dailyPremium: 19,
//   accidentalPremiumLimit: 1971,
//   accidentalLimitUsedPercent: 12.68,
//   criticalIllnessPremiumLimit: 6570,
//   isAccidentalOverLimit: false,
//   isCriticalIllnessOverLimit: false
// }
```

## Key Insights

1. **Buy Young**: Premiums are 25% cheaper for buyers under 25
2. **Quit Smoking**: Saves ~45% on premiums (1.8x → 1.0x)
3. **Longer Terms**: 30-40 year terms offer 5-8% discounts
4. **Female Advantage**: ~15-20% lower base rates
5. **Riders are Cheap**: Most riders add only 5-15% to base premium

## Accuracy Note

These calculations are based on publicly available ACKO pricing information and industry standards. Actual premiums may vary based on:
- Detailed medical underwriting
- Specific health conditions
- Family medical history
- BMI and other health metrics
- Promotional offers or discounts
- Policy-specific terms and conditions

For exact quotes, users should complete the full application process with their specific details.
