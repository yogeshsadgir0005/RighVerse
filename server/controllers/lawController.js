const mongoose = require('mongoose');
const Law = require('../models/Law');

const isValidObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
};

const cleanString = (v) => {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'string') return String(v);
  const s = v.trim();
  return s === '' ? undefined : s;
};

const cleanStringArray = (value) =>
  toArray(value)
    .flatMap((v) => {
      if (Array.isArray(v)) return v;
      // accept comma/newline separated strings from admin UI
      if (typeof v === 'string' && (v.includes(',') || v.includes('\n'))) {
        return v.split(/\n|,/g);
      }
      return [v];
    })
    .map(cleanString)
    .filter(Boolean);

const normalizeFaqs = (faqs) =>
  toArray(faqs)
    .map((f) => {
      if (!f) return null;
      if (typeof f === 'string') {
        return { question: f, answer: '' };
      }
      const question = cleanString(f.question ?? f.q);
      const answer = cleanString(f.answer ?? f.a);
      if (!question && !answer) return null;
      return { question: question || '', answer: answer || '' };
    })
    .filter(Boolean);

const normalizeJudgments = (judgments) =>
  toArray(judgments)
    .map((j) => {
      if (!j) return null;
      if (typeof j === 'string') {
        return { caseName: j, holding: '' };
      }

      const caseName = cleanString(j.caseName ?? j.title);
      const court = cleanString(j.court);
      const year = cleanString(j.year);
      const citation = cleanString(j.citation);
      const holding = cleanString(j.holding ?? j.summary);
      const link = cleanString(j.link);

      if (!caseName && !holding && !citation) return null;

      return {
        caseName: caseName || '',
        court,
        year,
        citation,
        holding: holding || '',
        link,
      };
    })
    .filter(Boolean);

const normalizeAmendments = (amendments) =>
  toArray(amendments)
    .map((a) => {
      if (!a) return null;

      // Old style: "string"
      if (typeof a === 'string') {
        const summary = cleanString(a);
        if (!summary) return null;
        return { summary };
      }

      // Mixed frontend/admin shapes
      const summary = cleanString(a.summary ?? a.type ?? a.note);
      const type = cleanString(a.type);
      const note = cleanString(a.note);
      let date = a.date ? new Date(a.date) : undefined;
      if (date && Number.isNaN(date.getTime())) date = undefined;

      if (!summary && !type && !note && !date) return null;

      return {
        date,
        summary: summary || '',
        type,
        note,
      };
    })
    .filter(Boolean);

const normalizeResources = (resources) =>
  toArray(resources)
    .map((r) => {
      if (!r) return null;
      if (typeof r === 'string') {
        return { label: r, url: r, type: 'link' };
      }
      const label = cleanString(r.label) || cleanString(r.url) || 'Resource';
      const url = cleanString(r.url);
      const type = cleanString(r.type) || 'link';
      if (!label && !url) return null;
      return { label, url, type };
    })
    .filter(Boolean);

function normalizeLawPayload(body = {}, { partial = false } = {}) {
  const out = { ...body };

  // top-level strings/numbers
  const topStringFields = ['title', 'slug', 'statuteName', 'category', 'lawType', 'courtLevel', 'jurisdiction', 'practiceArea'];
  for (const key of topStringFields) {
    if (key in out) out[key] = cleanString(out[key]);
  }

  if ('year' in out) {
    const y = Number(out.year);
    out.year = Number.isFinite(y) ? y : undefined;
  }

  if ('relevanceScore' in out) {
    const r = Number(out.relevanceScore);
    out.relevanceScore = Number.isFinite(r) ? r : 0;
  }

  if ('isPublished' in out) {
    out.isPublished = Boolean(out.isPublished);
  }

  // arrays
  if ('keywords' in out) out.keywords = cleanStringArray(out.keywords);
  if ('sections' in out) out.sections = cleanStringArray(out.sections);
  if ('situations' in out) out.situations = cleanStringArray(out.situations);
  if ('tags' in out) out.tags = cleanStringArray(out.tags);

  // citizen
  if ('citizen' in out || !partial) {
    const c = out.citizen || {};
    out.citizen = {
      ...c,
      summary: 'summary' in c ? cleanString(c.summary) : c.summary,
      whatThisMeans: 'whatThisMeans' in c ? cleanString(c.whatThisMeans) : c.whatThisMeans,
      realLifeExample: 'realLifeExample' in c ? cleanString(c.realLifeExample) : c.realLifeExample,
      stepsToTake: 'stepsToTake' in c ? cleanStringArray(c.stepsToTake) : c.stepsToTake,
      whoToContact: 'whoToContact' in c ? cleanStringArray(c.whoToContact) : c.whoToContact,
      mustKnow: 'mustKnow' in c ? cleanStringArray(c.mustKnow) : c.mustKnow,
      faqs: 'faqs' in c ? normalizeFaqs(c.faqs) : c.faqs,
    };
  }

  // lawyer
  if ('lawyer' in out || !partial) {
    const l = out.lawyer || {};
    out.lawyer = {
      ...l,
      officialText: 'officialText' in l ? cleanString(l.officialText) : l.officialText,
      interpretation: 'interpretation' in l ? cleanString(l.interpretation) : l.interpretation,
      relatedProvisions: 'relatedProvisions' in l ? cleanStringArray(l.relatedProvisions) : l.relatedProvisions,
      citations: 'citations' in l ? cleanStringArray(l.citations) : l.citations,
      judgments: 'judgments' in l ? normalizeJudgments(l.judgments) : l.judgments,
      amendments: 'amendments' in l ? normalizeAmendments(l.amendments) : l.amendments,
      commentary: 'commentary' in l ? cleanString(l.commentary) : l.commentary,
    };
  }

  if ('resources' in out) out.resources = normalizeResources(out.resources);

  // Remove undefined fields (important for updates)
  const prune = (obj) => {
    if (Array.isArray(obj)) return obj.map(prune).filter((v) => v !== undefined);
    if (obj && typeof obj === 'object') {
      const next = {};
      Object.entries(obj).forEach(([k, v]) => {
        const pv = prune(v);
        if (pv !== undefined) next[k] = pv;
      });
      return next;
    }
    return obj === undefined ? undefined : obj;
  };

  return prune(out);
}

function serializeLaw(doc) {
  const law = doc?.toObject ? doc.toObject() : doc;
  if (!law) return law;

  // Ensure backward/front-end compatibility shapes while preserving canonical fields
  if (law.citizen?.faqs) {
    law.citizen.faqs = law.citizen.faqs.map((f) => ({
      ...f,
      q: f.question ?? '',
      a: f.answer ?? '',
    }));
  }

  if (law.lawyer?.judgments) {
    law.lawyer.judgments = law.lawyer.judgments.map((j) => ({
      ...j,
      // compatibility aliases for older UI
      title: j.title ?? j.caseName ?? '',
      summary: j.summary ?? j.holding ?? '',
    }));
  }

  if (law.lawyer?.amendments) {
    law.lawyer.amendments = law.lawyer.amendments.map((a) => {
      if (typeof a === 'string') return { summary: a };
      return {
        ...a,
        summary: a.summary ?? a.type ?? a.note ?? '',
      };
    });
  }

  return law;
}

async function findLawBySlugOrId(identifier, { publicOnly = true } = {}) {
  const base = publicOnly ? { isPublished: true } : {};
  if (isValidObjectId(identifier)) {
    const byId = await Law.findOne({ ...base, _id: identifier });
    if (byId) return byId;
  }
  return Law.findOne({ ...base, slug: String(identifier).toLowerCase() });
}

// @desc    Get Laws with Filters & Pagination
// @route   GET /api/laws
exports.getLaws = async (req, res) => {
  try {
    const {
      q,
      category,
      year,
      courtLevel,
      jurisdiction,
      practiceArea,
      lawType,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isPublished: true };

    if (q) {
      const rx = { $regex: q, $options: 'i' };
      query.$or = [
        { title: rx },
        { statuteName: rx },
        { keywords: rx },
        { sections: rx },
        { situations: rx },
        { tags: rx },
        { 'citizen.summary': rx },
        { 'citizen.whatThisMeans': rx },
        { 'citizen.realLifeExample': rx },
        { 'lawyer.officialText': rx },
        { 'lawyer.interpretation': rx },
        { 'lawyer.relatedProvisions': rx },
        { 'lawyer.citations': rx },
        { 'lawyer.commentary': rx },
      ];
    }

    if (category && category !== 'All') query.category = category;
    if (year) {
      const y = Number(year);
      if (Number.isFinite(y)) query.year = y;
    }
    if (courtLevel) query.courtLevel = courtLevel;
    if (jurisdiction) query.jurisdiction = { $regex: jurisdiction, $options: 'i' };
    if (practiceArea) query.practiceArea = { $regex: practiceArea, $options: 'i' };
    if (lawType) query.lawType = lawType;

    let sortOption = { relevanceScore: -1, createdAt: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'year_desc') sortOption = { year: -1 };
    if (sort === 'year_asc') sortOption = { year: 1 };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 12));

    const items = await Law.find(query)
      .sort(sortOption)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Law.countDocuments(query);

    res.json({
      items: items.map(serializeLaw),
      pagination: {
        page: pageNum,
        pages: Math.ceil(count / limitNum),
        total: count,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Autosuggest for Search Bar
// @route   GET /api/laws/suggest
exports.suggestLaws = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const rx = { $regex: q, $options: 'i' };

    const results = await Law.find({
      $or: [{ title: rx }, { statuteName: rx }, { keywords: rx }, { tags: rx }],
      isPublished: true,
    })
      .select('title statuteName year category slug')
      .limit(5);

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get Single Law by Slug or ID (public)
// @route   GET /api/laws/:idOrSlug
exports.getLawById = async (req, res) => {
  try {
    const law = await findLawBySlugOrId(req.params.id, { publicOnly: true });
    if (!law) return res.status(404).json({ message: 'Law not found' });
    res.json(serializeLaw(law));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- ADMIN CONTROLLERS ---

exports.adminListLaws = async (req, res) => {
  try {
    const { q, isPublished } = req.query;
    const query = {};

    if (q) {
      const rx = { $regex: q, $options: 'i' };
      query.$or = [{ title: rx }, { statuteName: rx }, { slug: rx }];
    }

    if (isPublished === 'true') query.isPublished = true;
    if (isPublished === 'false') query.isPublished = false;

    const items = await Law.find(query).sort({ createdAt: -1 });
    res.json({ items: items.map(serializeLaw) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createLaw = async (req, res) => {
  try {
    const payload = normalizeLawPayload(req.body, { partial: false });
    const newLaw = new Law(payload);
    const saved = await newLaw.save();
    res.status(201).json(serializeLaw(saved));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateLaw = async (req, res) => {
  try {
    const payload = normalizeLawPayload(req.body, { partial: true });

    const updated = await Law.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
      context: 'query',
    });

    if (!updated) return res.status(404).json({ message: 'Law not found' });

    // Re-save once if title/slug changed, to apply slug de-dupe pre-save logic
    const needsSlugRefresh = 'title' in payload || 'slug' in payload;
    if (needsSlugRefresh) {
      if (!payload.slug && updated.title) updated.slug = undefined; // allow regen
      await updated.save();
    }

    res.json(serializeLaw(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteLaw = async (req, res) => {
  try {
    const deleted = await Law.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Law not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    const law = await Law.findById(req.params.id);
    if (!law) return res.status(404).json({ message: 'Law not found' });

    law.isPublished = !law.isPublished;
    await law.save();
    res.json(serializeLaw(law));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Optional admin detail (useful later)
// GET /api/laws/admin/:idOrSlug
exports.adminGetLaw = async (req, res) => {
  try {
    const law = await findLawBySlugOrId(req.params.id, { publicOnly: false });
    if (!law) return res.status(404).json({ message: 'Law not found' });
    res.json(serializeLaw(law));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};