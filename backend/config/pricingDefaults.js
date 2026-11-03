/**
 * Iron Legion Contracting — pricing & catalog defaults (Pass Five).
 *
 * This deployment of AlphaQuote is Iron Legion Contracting LLC's own
 * quoting tool. Everything in this module is a DEFAULT: labor rates,
 * markups, and terms pre-fill the app's editable settings, and the
 * starter templates below seed the template library. A user can edit
 * any of it in the app — nothing here hardcodes per-tenant behavior,
 * and the multi-tenant lockdown (auth, provisioning, scoping) is
 * untouched.
 *
 * Source of truth for the numbers: Iron Legion's pricing sheet
 * (October 2026, Defiance / NW Ohio market).
 */

// The only trades Iron Legion offers. Used for seeded categories,
// template categories, and picker defaults. Iron Legion does NOT do
// plumbing or electrical work — neither appears anywhere in defaults.
const SERVICE_CATEGORIES = [
  'Siding',
  'Fencing',
  'Decking',
  'Framing',
  'Landscaping',
  'Flooring'
];

const COMPANY_DISPLAY_NAME = 'Iron Legion Contracting';
const COMPANY_LEGAL_NAME = 'Iron Legion Contracting LLC';

// Billable labor rates ($/hr). Solo = one man, crew = two-person crew.
const SOLO_LABOR_RATE = 60;
const CREW_LABOR_RATE = 90;

// Materials are quoted at supplier cost + this markup (covers waste,
// pickup time, breakage). Pricing-sheet band is 10–15%; default is 15%.
const MATERIAL_MARKUP_PERCENT = 15;

// Overhead & profit margin applied on the job subtotal, on top of the
// material markup. This is the app's default "markup" setting value.
const OVERHEAD_MARGIN_PERCENT = 10;

// Jobs under this total are not worth mobilizing for; the app warns
// instead of silently quoting below it.
const MINIMUM_JOB_AMOUNT = 350;

// Material prices move; quotes do not stay open-ended.
const QUOTE_VALIDITY_DAYS = 14;

// Deposit terms: a share of the materials cost up front, balance on
// completion. Never $0 down, never 100% up front.
const DEPOSIT_MATERIALS_PERCENT_MIN = 30;
const DEPOSIT_MATERIALS_PERCENT_MAX = 50;

// Customer-facing terms printed on quotes (email + PDF footers).
// Wording follows the pricing sheet's "what to say when quoting".
const QUOTE_TERMS = [
  `This quote is valid for ${QUOTE_VALIDITY_DAYS} days from the date above.`,
  `Deposit: ${DEPOSIT_MATERIALS_PERCENT_MIN}–${DEPOSIT_MATERIALS_PERCENT_MAX}% of materials due up front. Balance due on completion.`,
  'Damage or rot found during demolition will be shown to the customer and agreed before any repair work begins. Repairs are billed as time & materials.',
  'Iron Legion does not perform plumbing or electrical work.'
];

/**
 * Starter estimate templates — one per trade (framing gets two: the
 * full package and the labor-only alternative). Rates are the
 * pricing sheet's mid-band numbers and quantities are its typical
 * jobs, so a template produces a realistic quote before any edits.
 * Shape matches the app's TaskTemplate / TaskTemplateItem models and
 * the seeder in backend/prisma/seed.js.
 */
const STARTER_TEMPLATES = [
  {
    name: 'Siding — Vinyl (Typical Ranch)',
    description: 'Vinyl siding on a one-story ranch, about 1,200 sq ft of wall, including demo and house wrap',
    category: 'Siding',
    isPublic: true,
    tasks: [
      { name: 'Vinyl siding, installed', description: 'Vinyl siding installed, mid-band rate', category: 'Siding', unit: 'sqft', quantity: 1200, unitPrice: 6.50 },
      { name: 'Remove old siding (demo)', description: 'Tear off and dispose of existing siding', category: 'Siding', unit: 'sqft', quantity: 1200, unitPrice: 1.50 },
      { name: 'House wrap', description: 'Weather-resistant house wrap under new siding', category: 'Siding', unit: 'sqft', quantity: 1200, unitPrice: 0.75 },
      { name: 'Trim', description: 'Corner boards, window/door trim — flat allowance', category: 'Siding', unit: 'job', quantity: 1, unitPrice: 800 }
    ]
  },
  {
    name: 'Fencing — PT Wood Privacy (150 LF)',
    description: '150 linear ft of 6 ft pressure-treated wood privacy fence with one walk gate, plus removal of the old fence',
    category: 'Fencing',
    isPublic: true,
    tasks: [
      { name: 'PT wood privacy fence, installed', description: '6 ft pressure-treated pine privacy fence, posts set in concrete. Call 811 before digging.', category: 'Fencing', unit: 'linear ft', quantity: 150, unitPrice: 27 },
      { name: 'Walk gate', description: 'Single walk gate, framed and hung', category: 'Fencing', unit: 'each', quantity: 1, unitPrice: 400 },
      { name: 'Old fence removal', description: 'Tear out and dispose of existing fence', category: 'Fencing', unit: 'linear ft', quantity: 150, unitPrice: 4.50 }
    ]
  },
  {
    name: 'Decking — PT Wood Deck (300 sq ft)',
    description: '300 sq ft ground-level pressure-treated deck with 4 steps and permit',
    category: 'Decking',
    isPublic: true,
    tasks: [
      { name: 'PT wood deck, installed', description: 'Framing, decking, and basic railing included. Footings below Ohio frost line.', category: 'Decking', unit: 'sqft', quantity: 300, unitPrice: 28 },
      { name: 'Stairs', description: 'Deck steps, per step', category: 'Decking', unit: 'step', quantity: 4, unitPrice: 375 },
      { name: 'Permit', description: 'Building permit — flat allowance, confirm with the jurisdiction', category: 'Decking', unit: 'job', quantity: 1, unitPrice: 200 }
    ]
  },
  {
    name: 'Framing — Package (Labor + Materials)',
    description: 'New wood framing package priced per sq ft of floor area: labor, lumber, sheathing, and hardware',
    category: 'Framing',
    isPublic: true,
    tasks: [
      { name: 'Framing package (labor + materials)', description: 'Layout, cutting, assembly, raising, bracing; lumber and sheathing included', category: 'Framing', unit: 'sqft', quantity: 500, unitPrice: 16 }
    ]
  },
  {
    name: 'Framing — Labor Only',
    description: 'New wood framing, labor only, priced per sq ft of floor area (customer supplies materials)',
    category: 'Framing',
    isPublic: true,
    tasks: [
      { name: 'Framing labor only', description: 'Layout, cutting, assembly, raising, bracing — materials by others', category: 'Framing', unit: 'sqft', quantity: 500, unitPrice: 6.50 }
    ]
  },
  {
    name: 'Landscaping — Mulch & Bed Cleanup',
    description: 'Mulch install (3-yard minimum) with bed cleanup and edging — a typical half-day job',
    category: 'Landscaping',
    isPublic: true,
    tasks: [
      { name: 'Mulch, installed', description: 'Mulch delivered and spread, per cubic yard (3-yard minimum)', category: 'Landscaping', unit: 'cu yd', quantity: 3, unitPrice: 70 },
      { name: 'Bed cleanup + edge', description: 'Clean out beds and cut a fresh edge — per job', category: 'Landscaping', unit: 'job', quantity: 1, unitPrice: 275 },
      { name: 'Crew labor', description: 'Two-person crew labor, per hour (half day shown — adjust to the job)', category: 'Landscaping', unit: 'hour', quantity: 4, unitPrice: 85 }
    ]
  },
  {
    name: 'Flooring — LVP (500 sq ft)',
    description: '500 sq ft of luxury vinyl plank, floating click-lock, including old floor removal and trim',
    category: 'Flooring',
    isPublic: true,
    tasks: [
      { name: 'LVP flooring, installed', description: 'Luxury vinyl plank installed, floating click-lock', category: 'Flooring', unit: 'sqft', quantity: 500, unitPrice: 6.00 },
      { name: 'Old floor removal', description: 'Remove and dispose of existing flooring', category: 'Flooring', unit: 'sqft', quantity: 500, unitPrice: 2.00 },
      { name: 'Trim & transitions', description: 'Baseboards, transitions, and stair nosing — flat allowance', category: 'Flooring', unit: 'job', quantity: 1, unitPrice: 300 }
    ]
  }
];

module.exports = {
  SERVICE_CATEGORIES,
  COMPANY_DISPLAY_NAME,
  COMPANY_LEGAL_NAME,
  SOLO_LABOR_RATE,
  CREW_LABOR_RATE,
  MATERIAL_MARKUP_PERCENT,
  OVERHEAD_MARGIN_PERCENT,
  MINIMUM_JOB_AMOUNT,
  QUOTE_VALIDITY_DAYS,
  DEPOSIT_MATERIALS_PERCENT_MIN,
  DEPOSIT_MATERIALS_PERCENT_MAX,
  QUOTE_TERMS,
  STARTER_TEMPLATES
};
