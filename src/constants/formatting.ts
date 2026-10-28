export const UNIVERSAL_FORMATTING_DIRECTIVE = `[UNIVERSAL FORMATTING DIRECTIVE]
Synthesize the accumulated upstream context into a clean, executive Markdown document. Dynamically adapt the headers and matrix fields to match the user's specific domain (e.g., sports, academics, product reviews, economics, entertainment).

Strict Document Hierarchy:
# [Dynamic Topic Title]

## 1. Executive Summary
- Concise 2-3 sentence direct answer to the user's prompt.
- Core verdict or high-level takeaway.

## 2. Comparative Matrix / Core Data
| Dimension / Metric | Subject A / Option 1 | Subject B / Option 2 | Notes / Benchmark |
| :--- | :--- | :--- | :--- |
(Populate with 4–7 relevant comparative attributes based on the domain: e.g., stats for sports, fees/placements for colleges, specs for tech, metrics for economics).

## 3. Key Findings & Detailed Analysis
- **[Dimension 1]:** Bulleted breakdown with concrete facts and numbers.
- **[Dimension 2]:** Bulleted breakdown with concrete facts and numbers.
- **[Dimension 3]:** Bulleted breakdown with concrete facts and numbers.

## 4. Strengths, Caveats & Missing Data
- **Highlights / Strengths:** Key advantages or standout points.
- **Limitations / Gaps:** Explicitly note missing data, assumptions, or unverified claims.

## 5. Sources & References
- List extracted URLs, verified sources, or data origins from upstream nodes.`;

export function generateDomainAwareMockReport(topic: string): string {
  const t = topic.trim() || 'Comparative Analysis';
  const lower = t.toLowerCase();

  // Sports domain
  if (lower.includes('cricket') || lower.includes('football') || lower.includes('nba') || lower.includes('messi') || lower.includes('ronaldo') || lower.includes('sport') || lower.includes('player')) {
    return `# Performance & Benchmark Analysis: ${t}

## 1. Executive Summary
- Elite-level comparative evaluation reveals distinct stylistic and statistical advantages across both subjects.
- Subject A demonstrates superior peak scoring efficiency and offensive impact, while Subject B leads in longevity, defensive work rate, and positional versatility.

## 2. Comparative Matrix / Core Data
| Dimension / Metric | Subject A / Player 1 | Subject B / Player 2 | Notes / Benchmark |
| :--- | :--- | :--- | :--- |
| Primary Scoring / Output Rate | 0.84 per match | 0.72 per match | Top 1% tier global benchmark |
| Efficiency / Accuracy Rate | 64.2% | 58.7% | Based on verified tournament data |
| Trophy / Championship Count | 34 Major Titles | 31 Major Titles | International & domestic totals |
| Defensive / Auxiliary Actions | 1.8 tackles/game | 3.4 tackles/game | Subject B holds tactical edge |
| Peak Performance Rating (ELO) | 2,140 | 2,095 | Normalized historical metric |
| Availability / Fitness Index | 94.1% start rate | 91.8% start rate | Tracked over past 5 seasons |

## 3. Key Findings & Detailed Analysis
- **Scoring & Offensive Precision:** Subject A generates higher expected goals (xG) and conversion rates in decisive playoff scenarios.
- **Tactical Versatility:** Subject B creates broader space for teammates, registering 38% more secondary assists and transition recoveries.
- **Clutch Performance:** In tournament finals, Subject A accounts for 1.15 goal contributions per 90 minutes versus Subject B's 0.95.

## 4. Strengths, Caveats & Missing Data
- **Highlights / Strengths:** Extraordinary technical consistency, record-setting peak metrics, and international accolade dominance.
- **Limitations / Gaps:** Historical tracking prior to 2018 relies on disparate federation databases; tracking variances of ±3% noted in recovery metrics.

## 5. Sources & References
- Official League Performance Analytics Database (2020–2025)
- Federation Statistical Bulletins & Matchday Telemetry
- Verified Player Performance Index Archives`;
  }

  // College / Academic Selection domain
  if (lower.includes('college') || lower.includes('university') || lower.includes('campus') || lower.includes('degree') || lower.includes('placement') || lower.includes('tuition') || lower.includes('iit') || lower.includes('mit')) {
    return `# Institution Comparison & Academic Dossier: ${t}

## 1. Executive Summary
- Strategic institutional comparison indicates both institutions offer high return-on-investment, but diverge significantly in specialized departmental focus and campus lifestyle.
- Option A is recommended for research-driven technical specializations, while Option B provides superior median placement compensation and alumni network density.

## 2. Comparative Matrix / Core Data
| Dimension / Metric | Institution A | Institution B | Notes / Benchmark |
| :--- | :--- | :--- | :--- |
| National / Global Ranking | #14 (NIRF/QS) | #19 (NIRF/QS) | Top-tier accreditation |
| Annual Tuition & Fees | $18,500 / yr | $24,200 / yr | Excludes hostel/lodging |
| Median Placement Package | $112,000 / annum | $124,500 / annum | Verified 2024 placement data |
| Placement Percentage | 96.4% | 94.8% | Eligible graduating batch |
| Faculty-to-Student Ratio | 1 : 9 | 1 : 12 | Laboratory mentorship metric |
| Research Grant Funding | $48.2M annually | $32.6M annually | Government & industry grants |

## 3. Key Findings & Detailed Analysis
- **Placement & Industry Trajectory:** Institution B maintains stronger corporate recruitment pipelines in Tier-1 software and management consulting firms.
- **Curriculum & Research Output:** Institution A produces 42% more peer-reviewed citations per faculty member and offers flexible interdisciplinary electives.
- **Infrastructure & Lab Access:** Institution A features 24/7 dedicated compute clusters and incubator facilities with active seed-stage grants.

## 4. Strengths, Caveats & Missing Data
- **Highlights / Strengths:** Exceptional return on tuition capital, established international exchange partnerships, and high retention rates.
- **Limitations / Gaps:** 2025 graduate employment numbers remain provisional; scholarship distribution percentages not fully disaggregated.

## 5. Sources & References
- National Institutional Ranking Framework (NIRF / QS World Rankings 2024-2025)
- University Career Services Audited Placement Reports
- Department of Higher Education Accreditation Archives`;
  }

  // Tech / Product Review domain
  if (lower.includes('phone') || lower.includes('laptop') || lower.includes('gpu') || lower.includes('macbook') || lower.includes('software') || lower.includes('product') || lower.includes('review') || lower.includes('tech') || lower.includes('apple') || lower.includes('samsung') || lower.includes('nvidia')) {
    return `# Technical Evaluation & Benchmark Report: ${t}

## 1. Executive Summary
- Comparative hardware and software benchmarking demonstrates that Option 1 is superior for productivity and battery efficiency, while Option 2 leads in graphical throughput and open-ecosystem extensibility.
- Decision hinges on workflow requirements: choose Option 1 for mobility and sustained thermal stability, or Option 2 for raw computing horsepower.

## 2. Comparative Matrix / Core Data
| Dimension / Metric | Option A / Model 1 | Option B / Model 2 | Notes / Benchmark |
| :--- | :--- | :--- | :--- |
| Base MSRP / Retail Price | $1,199 | $1,299 | Tier-1 flagship standard |
| Compute Benchmark (Geekbench) | 3,820 (Single) / 14,900 (Multi) | 3,250 (Single) / 16,100 (Multi) | Normalized Geekbench 6 score |
| Power Efficiency (TDP) | 28W Peak | 65W Peak | Measured under continuous load |
| Battery Endurance (Real-world) | 16.5 hours | 11.2 hours | Standardized web/video loop |
| Display Panel & Refresh | 120Hz OLED (1600 nits) | 144Hz Mini-LED (1400 nits) | Color gamut > 99% DCI-P3 |
| Thermal Throttling Delta | < 4.5% after 30 min | ~12.8% after 30 min | Sustained heavy compute stress |

## 3. Key Findings & Detailed Analysis
- **Compute Throughput & Architecture:** Option A delivers unmatched single-core burst responsiveness, while Option B excels in multi-threaded 3D rendering.
- **Thermal & Acoustic Management:** Option A operates fanless or near-silent under standard operational loads, generating negligible acoustic noise.
- **Ecosystem Integration:** Option A offers seamless zero-latency handoff across unified companion devices; Option B provides expansive modular upgrade paths.

## 4. Strengths, Caveats & Missing Data
- **Highlights / Strengths:** Best-in-class power-to-performance ratio, industry-leading display calibration, and multi-year software longevity.
- **Limitations / Gaps:** Long-term battery degradation curve past 24 months is extrapolated from synthetic cycle testing.

## 5. Sources & References
- Independent Hardware Testing Laboratories & AnandTech Archives
- Manufacturer Technical Whitepapers & FCC Compliance Filings
- Verified Benchmark Aggregators (Geekbench, Cinebench 2024)`;
  }

  // Default / Universal domain
  return `# Executive Synthesis & Decision Matrix: ${t}

## 1. Executive Summary
- Comprehensive multi-agent investigation into "${t}" confirms robust findings across primary quantitative and qualitative criteria.
- Core assessment provides an actionable pathway with distinct trade-offs between speed, cost, and comprehensive long-term reliability.

## 2. Comparative Matrix / Core Data
| Dimension / Metric | Subject A / Option 1 | Subject B / Option 2 | Notes / Benchmark |
| :--- | :--- | :--- | :--- |
| Operational Efficiency | 92.4% | 84.1% | +8.3% margin for Option 1 |
| Implementation Cost | Moderate ($$) | High ($$$) | Option 1 is 26% more cost-effective |
| Scalability & Capacity | High (Up to 100k ops/sec) | Very High (250k+ ops/sec) | Option 2 designed for ultra-scale |
| Security & Compliance | SOC2, HIPAA, ISO 27001 | SOC2, FedRAMP, ISO 27001 | Both satisfy enterprise standards |
| Integration Overhead | 2–3 Weeks | 5–6 Weeks | Low friction onboarding with Option 1 |
| Community & Ecosystem Support | 4.8 / 5.0 (42k stars) | 4.3 / 5.0 (18k stars) | Verified GitHub & market metrics |

## 3. Key Findings & Detailed Analysis
- **Strategic Impact:** Option 1 enables accelerated time-to-value with minimal infrastructural modification, making it ideal for immediate deployment.
- **Quantitative Performance:** Option 2 handles extreme peak bursts with lower latency variance, though at substantially higher operational resource expenditure.
- **Risk Mitigation:** Both options offer automated failover and encryption at rest, reducing single-point-of-failure vulnerabilities.

## 4. Strengths, Caveats & Missing Data
- **Highlights / Strengths:** Verified empirical benchmarks, enterprise-grade availability, and clean documentation coverage.
- **Limitations / Gaps:** Edge network telemetry in secondary regions remains unconfirmed; upstream data relies on self-reported operational audits.

## 5. Sources & References
- Upstream Multi-Agent Analytical Pipeline Synthesis
- Industry Standard Benchmarking Repositories & Whitepapers (2024–2025)
- Verified Domain Analytics & Performance Indices`;
}
