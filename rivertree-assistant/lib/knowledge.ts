/**
 * Built-in knowledge used by the assistant.
 * Agency details come from Rivertree's public listings; replace or extend
 * with the agency's own FAQ before going to production.
 */

export const AGENCY = {
  name: "River Tree Insurance",
  shortName: "Rivertree",
  phone: "(256) 715-0477",
  email: "rivertree@rt-ins.com",
  address: "9668 Madison Blvd, Suite 202, Madison, AL",
  founded: 2009,
};

export type Faq = { id: string; title: string; keywords: string[]; answer: string };

export const FAQS: Faq[] = [
  {
    id: "independent",
    title: "Why an independent agency",
    keywords: ["independent", "agency", "compare", "carriers", "companies", "shop", "quotes", "who are you", "rivertree", "river tree", "about"],
    answer: `Rivertree is a 100% independent agency. Instead of representing one insurer, we compare coverage and pricing across a range of carriers and recommend the best fit. We work for the client, not the insurance company.`,
  },
  {
    id: "auto",
    title: "Auto insurance",
    keywords: ["auto", "car", "vehicle", "driver", "collision", "comprehensive", "liability", "uninsured", "motorist"],
    answer: `A typical personal auto policy includes:
- **Liability** – bodily injury and property damage you cause to others. Alabama's minimum is 25/50/25.
- **Collision** – damage to your car from an accident, minus the deductible.
- **Comprehensive** – theft, hail, fire, animal strikes and other non-collision losses.
- **Uninsured / underinsured motorist** – protects you when the at-fault driver lacks enough coverage.
- **Medical payments** – medical bills for you and your passengers.

Most clients carry limits well above the state minimum, especially homeowners with assets to protect.`,
  },
  {
    id: "home",
    title: "Homeowners insurance",
    keywords: ["home", "homeowners", "house", "dwelling", "property", "ho-3", "ho3", "roof", "wind", "hail", "personal property", "contents"],
    answer: `A standard homeowners (HO-3) policy covers:
- **Dwelling (A)** – the structure, written to replacement cost.
- **Other structures (B)** – fences, sheds, detached garages.
- **Personal property (C)** – belongings, usually 50–70% of dwelling.
- **Loss of use (D)** – living expenses while the home is repaired.
- **Personal liability (E)** and **medical payments (F)**.

Flood and earthquake are excluded and need separate policies. In north Alabama, check the wind/hail deductible, which is often a percentage of the dwelling limit.`,
  },
  {
    id: "flood",
    title: "Flood insurance",
    keywords: ["flood", "water", "nfip", "rising water"],
    answer: `Flood damage is not covered by homeowners policies. Coverage is available through the NFIP or private flood carriers. NFIP policies normally have a **30-day waiting period**, so buy before storm season rather than after a forecast.`,
  },
  {
    id: "umbrella",
    title: "Umbrella insurance",
    keywords: ["umbrella", "excess", "lawsuit", "extra liability"],
    answer: `An umbrella policy adds liability protection, usually in $1M increments, above your auto and home limits. It is inexpensive relative to the protection and often requires minimum underlying limits (e.g. 250/500 auto, $300k home liability).`,
  },
  {
    id: "rv",
    title: "Recreational vehicles",
    keywords: ["rv", "boat", "motorcycle", "atv", "camper", "motorhome", "recreational", "golf cart"],
    answer: `Boats, RVs, motorcycles, ATVs and golf carts need their own policies or endorsements. Key options include agreed-value coverage, full-timer liability for RVs, and on-water towing for boats.`,
  },
  {
    id: "life",
    title: "Life insurance",
    keywords: ["life", "term", "whole life", "beneficiary", "death benefit"],
    answer: `- **Term life** covers a set period (10–30 years) at the lowest cost; ideal for income replacement and mortgages.
- **Permanent life** (whole or universal) lasts for life and builds cash value, at a higher premium.

A common starting point is 10–12× annual income, adjusted for debts, children and savings.`,
  },
  {
    id: "gl",
    title: "General liability",
    keywords: ["general liability", "gl", "business liability", "slip and fall", "certificate", "coi", "additional insured"],
    answer: `Commercial general liability covers third-party bodily injury, property damage, and personal/advertising injury arising from business operations. Contracts often require a **certificate of insurance (COI)** and naming the client as an **additional insured** — we can issue these on request.`,
  },
  {
    id: "bop",
    title: "Business owner's policy",
    keywords: ["bop", "business owner", "small business", "business insurance", "commercial property", "business interruption"],
    answer: `A Business Owner's Policy (BOP) bundles general liability, commercial property and business interruption for small and mid-sized businesses, typically at a lower price than buying each separately.`,
  },
  {
    id: "workcomp",
    title: "Workers' compensation",
    keywords: ["workers comp", "workers' comp", "workers compensation", "employee injury", "payroll"],
    answer: `Alabama requires workers' compensation for businesses with **five or more employees**. Premium is based on payroll and job class codes, and is adjusted by an audit at the end of the term.`,
  },
  {
    id: "commauto",
    title: "Commercial auto",
    keywords: ["commercial auto", "fleet", "business vehicle", "hired", "non-owned", "trucks"],
    answer: `Commercial auto covers vehicles owned or used by a business. Add **hired and non-owned auto** coverage if employees drive their own or rented vehicles for work.`,
  },
  {
    id: "cyber",
    title: "Cyber liability",
    keywords: ["cyber", "data breach", "ransomware", "hack"],
    answer: `Cyber liability covers breach response, notification costs, ransomware, business interruption and third-party claims after a data incident. Carriers often require MFA and backups before binding.`,
  },
  {
    id: "claims",
    title: "Filing a claim",
    keywords: ["claim", "file a claim", "accident", "damage", "report", "loss"],
    answer: `To file a claim:
1. Make sure everyone is safe and prevent further damage.
2. Take photos and gather details (date, location, other parties, police report number).
3. Call the carrier's 24/7 claims line or contact us and we'll open it for you.
4. Keep receipts for emergency repairs and temporary living costs.

Our team stays involved through the process and can advocate with the adjuster.`,
  },
  {
    id: "billing",
    title: "Billing and payments",
    keywords: ["bill", "billing", "pay", "payment", "premium", "autopay", "invoice", "due"],
    answer: `Payments go directly to the insurance carrier. Most offer autopay, monthly installments, or paid-in-full discounts. We can send the carrier's payment link or help set up autopay.`,
  },
  {
    id: "deductible",
    title: "Deductibles",
    keywords: ["deductible", "out of pocket"],
    answer: `The deductible is what you pay before insurance applies to a claim. A higher deductible lowers the premium; choose an amount you could comfortably pay tomorrow.`,
  },
  {
    id: "bundle",
    title: "Bundling and discounts",
    keywords: ["bundle", "discount", "save", "cheaper", "lower", "price", "cost"],
    answer: `Common discounts: bundling home and auto, multi-car, claims-free history, protective devices, new home construction, good student and paid-in-full. As an independent agency we re-shop at renewal if pricing jumps.`,
  },
  {
    id: "contact",
    title: "Contact",
    keywords: ["contact", "phone", "call", "office", "address", "hours", "email", "location", "where"],
    answer: `**River Tree Insurance**
${AGENCY.address}
Phone: ${AGENCY.phone}
Email: ${AGENCY.email}`,
  },
];

export const SAMPLE_DOCS: { name: string; type: string; text: string }[] = [
  {
    name: "Homeowners Declarations – Carter.txt",
    type: "text/plain",
    text: `HOMEOWNERS POLICY DECLARATIONS (HO-3)
Named Insured: Daniel and Maria Carter
Property Address: 118 Oak Hollow Dr, Madison, AL 35758
Policy Number: HO-4471-2291
Policy Period: 11/01/2026 to 11/01/2027
Carrier: Southern Mutual Insurance Co.

COVERAGES AND LIMITS
Coverage A – Dwelling: $425,000
Coverage B – Other Structures: $42,500
Coverage C – Personal Property: $297,500
Coverage D – Loss of Use: $85,000
Coverage E – Personal Liability: $300,000
Coverage F – Medical Payments: $5,000

DEDUCTIBLES
All Other Perils: $1,000
Wind/Hail: 2% of Coverage A ($8,500)

ENDORSEMENTS
Water Backup and Sump Overflow: $10,000
Replacement Cost – Personal Property: Included
Scheduled Jewelry: $12,000

DISCOUNTS APPLIED
Multi-policy (auto), Protective devices, Claims-free (5 years)

ANNUAL PREMIUM: $2,184.00`,
  },
  {
    name: "Commercial Proposal – Tennessee Valley Landscaping.txt",
    type: "text/plain",
    text: `COMMERCIAL INSURANCE PROPOSAL
Prepared for: Tennessee Valley Landscaping LLC
Contact: Jordan Hayes, Owner
Proposal Date: 09/15/2026
Effective Date: 10/01/2026

BUSINESS PROFILE
Operations: Residential and commercial landscaping, irrigation installation
Employees: 14 (annual payroll $620,000)
Vehicles: 6 pickup trucks, 3 trailers
Annual Revenue: $1.4M

RECOMMENDED COVERAGE
1. General Liability – $1M per occurrence / $2M aggregate. Premium: $3,420
2. Commercial Auto – $1M CSL, hired and non-owned included. Premium: $11,860
3. Workers' Compensation – Statutory / $1M employer's liability. Premium: $18,240
4. Inland Marine (equipment floater) – $185,000 scheduled equipment. Premium: $2,210
5. Commercial Umbrella – $2M. Premium: $2,950

TOTAL ESTIMATED ANNUAL PREMIUM: $38,680

NOTES
- Current GL carrier non-renewing due to class appetite change.
- Recommend adding pesticide/herbicide applicator endorsement to GL ($480).
- Payroll audit required annually for workers' compensation.
- Quote valid for 30 days.`,
  },
];
