const mongoose = require('mongoose');

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
}

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true },
  },
  { _id: false }
);

const judgmentSchema = new mongoose.Schema(
  {
    caseName: { type: String, trim: true },   // canonical
    court: { type: String, trim: true },
    year: { type: String, trim: true },
    citation: { type: String, trim: true },
    holding: { type: String, trim: true },    // canonical
    link: { type: String, trim: true },
  },
  { _id: false }
);

const amendmentSchema = new mongoose.Schema(
  {
    date: { type: Date },                     // richer structure
    summary: { type: String, trim: true },    // canonical summary
    type: { type: String, trim: true },       // optional label/category
    note: { type: String, trim: true },       // optional extra note
  },
  { _id: false }
);

const resourceSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    url: { type: String, trim: true },
    type: { type: String, trim: true, default: 'link' },
  },
  { _id: false }
);

const lawSchema = new mongoose.Schema(
  {
    // --- METADATA ---
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    statuteName: { type: String, trim: true },
    year: { type: Number },
    category: { type: String, default: 'Other', trim: true },
    lawType: {
      type: String,
      enum: ['statute', 'case'],
      default: 'statute',
    },
    courtLevel: { type: String, trim: true }, // e.g. Supreme Court
    jurisdiction: { type: String, trim: true }, // e.g. India, Delhi
    practiceArea: { type: String, trim: true }, // e.g. Criminal, IPR

    // --- SEARCH & TAGS ---
    keywords: [{ type: String, trim: true }],
    sections: [{ type: String, trim: true }],
    situations: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    relevanceScore: { type: Number, default: 0 },

    // --- CITIZEN VIEW ---
    citizen: {
      summary: { type: String, trim: true },
      whatThisMeans: { type: String, trim: true },
      realLifeExample: { type: String, trim: true },
      stepsToTake: [{ type: String, trim: true }],
      whoToContact: [{ type: String, trim: true }],
      mustKnow: [{ type: String, trim: true }],
      faqs: [faqSchema],
    },

    // --- LAWYER VIEW ---
    lawyer: {
      officialText: { type: String, trim: true },
      interpretation: { type: String, trim: true },
      relatedProvisions: [{ type: String, trim: true }],
      citations: [{ type: String, trim: true }],
      judgments: [judgmentSchema],
      amendments: [amendmentSchema],
      commentary: { type: String, trim: true },
    },

    // --- RESOURCES ---
    resources: [resourceSchema],

    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// Generate slug automatically if missing
// Generate slug automatically if missing
lawSchema.pre('validate', function () {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
});

// Ensure unique slug by suffixing if needed (only on new docs or slug changed)
lawSchema.pre('save', async function () {
  if (!this.slug && this.title) this.slug = slugify(this.title);

  if (!this.slug) return;
  if (!this.isNew && !this.isModified('slug') && !this.isModified('title')) return;

  let base = slugify(this.slug || this.title);
  let candidate = base;
  let i = 1;

  while (true) {
    const existing = await this.constructor.findOne({ slug: candidate, _id: { $ne: this._id } }).select('_id');
    if (!existing) {
      this.slug = candidate;
      break;
    }
    i += 1;
    candidate = `${base}-${i}`;
  }
});

// Index for text search
lawSchema.index({
  title: 'text',
  statuteName: 'text',
  'citizen.whatThisMeans': 'text',
  'citizen.summary': 'text',
  keywords: 'text',
  sections: 'text',
  situations: 'text',
  tags: 'text',
});

// Optional targeted indexes
lawSchema.index({ isPublished: 1, createdAt: -1 });


module.exports = mongoose.model('Law', lawSchema);