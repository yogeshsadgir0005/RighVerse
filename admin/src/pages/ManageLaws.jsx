import React, { useEffect, useMemo, useState } from "react";
import {
  adminCreateLaw,
  adminDeleteLaw,
  adminListLaws,
  adminTogglePublish,
  adminUpdateLaw,
} from "../api/lawApi";

const parseCsv = (s) =>
  (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const joinCsv = (val) => {
  if (typeof val === "string") return val;
  return Array.isArray(val) ? val.filter(Boolean).join(", ") : "";
};

const emptyForm = () => ({
  title: "",
  slug: "",
  statuteName: "",
  year: "",
  category: "Other",
  lawType: "statute",
  courtLevel: "",
  jurisdiction: "",
  practiceArea: "",
  keywords: [],
  situations: [],
  sections: [],
  tags: [],
  relevanceScore: 0,
  isPublished: false,
  citizen: {
    summary: "",
    whatThisMeans: "",
    realLifeExample: "",
    stepsToTake: [],
    whoToContact: [],
    mustKnow: [],
    faqs: [{ question: "", answer: "" }],
  },
  lawyer: {
    officialText: "",
    interpretation: "",
    relatedProvisions: [],
    judgments: [{ caseName: "", court: "", year: "", citation: "", holding: "", link: "" }],
    amendments: [{ date: "", summary: "", type: "", note: "" }],
    commentary: "",
    citations: [],
  },
  resources: [{ label: "", url: "", type: "link" }],
});

const normalizeFaqsForForm = (faqs) => {
  const arr = Array.isArray(faqs) ? faqs : [];
  const mapped = arr
    .map((f) => ({
      question: f?.question ?? f?.q ?? "",
      answer: f?.answer ?? f?.a ?? "",
    }))
    .filter((f) => f.question || f.answer);
  return mapped.length ? mapped : [{ question: "", answer: "" }];
};

const normalizeJudgmentsForForm = (judgments) => {
  const arr = Array.isArray(judgments) ? judgments : [];
  const mapped = arr
    .map((j) => ({
      caseName: j?.caseName ?? j?.title ?? "",
      court: j?.court ?? "",
      year: j?.year ?? "",
      citation: j?.citation ?? "",
      holding: j?.holding ?? j?.summary ?? "",
      link: j?.link ?? "",
    }))
    .filter((j) => j.caseName || j.holding || j.citation || j.court || j.year || j.link);
  return mapped.length
    ? mapped
    : [{ caseName: "", court: "", year: "", citation: "", holding: "", link: "" }];
};

const normalizeAmendmentsForForm = (amendments) => {
  const arr = Array.isArray(amendments) ? amendments : [];
  const mapped = arr
    .map((a) => {
      if (typeof a === "string") {
        return { date: "", summary: a, type: "", note: "" };
      }
      return {
        date: a?.date ? String(a.date).slice(0, 10) : "",
        summary: a?.summary ?? a?.type ?? a?.note ?? "",
        type: a?.type ?? "",
        note: a?.note ?? "",
      };
    })
    .filter((a) => a.summary || a.date || a.type || a.note);
  return mapped.length ? mapped : [{ date: "", summary: "", type: "", note: "" }];
};

const normalizeResourcesForForm = (resources) => {
  const arr = Array.isArray(resources) ? resources : [];
  const mapped = arr
    .map((r) => ({
      label: r?.label ?? "",
      url: r?.url ?? "",
      type: r?.type ?? "link",
    }))
    .filter((r) => r.label || r.url || r.type);
  return mapped.length ? mapped : [{ label: "", url: "", type: "link" }];
};

function cleanPayload(form) {
  const trim = (v) => (typeof v === "string" ? v.trim() : v);

const cleanStringArray = (arr) => {
    // Parse the raw string into an array right before sending to the backend
    if (typeof arr === "string") return arr.split(",").map((x) => trim(x)).filter(Boolean);
    
    return (Array.isArray(arr) ? arr : [])
      .map((x) => trim(x))
      .filter(Boolean);
  };

  const payload = {
    ...form,
    title: trim(form.title),
    slug: trim(form.slug) || undefined, // backend can auto-generate
    statuteName: trim(form.statuteName),
    year: form.year === "" ? undefined : Number(form.year),
    category: trim(form.category),
    lawType: trim(form.lawType),
    courtLevel: trim(form.courtLevel),
    jurisdiction: trim(form.jurisdiction),
    practiceArea: trim(form.practiceArea),
    relevanceScore: Number(form.relevanceScore || 0),
    isPublished: Boolean(form.isPublished),

    keywords: cleanStringArray(form.keywords),
    situations: cleanStringArray(form.situations),
    sections: cleanStringArray(form.sections),
    tags: cleanStringArray(form.tags),

    citizen: {
      summary: trim(form.citizen?.summary),
      whatThisMeans: trim(form.citizen?.whatThisMeans),
      realLifeExample: trim(form.citizen?.realLifeExample),
      stepsToTake: cleanStringArray(form.citizen?.stepsToTake),
      whoToContact: cleanStringArray(form.citizen?.whoToContact),
      mustKnow: cleanStringArray(form.citizen?.mustKnow),
      faqs: (Array.isArray(form.citizen?.faqs) ? form.citizen.faqs : [])
        .map((f) => ({
          question: trim(f?.question),
          answer: trim(f?.answer),
        }))
        .filter((f) => f.question || f.answer),
    },

    lawyer: {
      officialText: trim(form.lawyer?.officialText),
      interpretation: trim(form.lawyer?.interpretation),
      relatedProvisions: cleanStringArray(form.lawyer?.relatedProvisions),
      citations: cleanStringArray(form.lawyer?.citations),
      judgments: (Array.isArray(form.lawyer?.judgments) ? form.lawyer.judgments : [])
        .map((j) => ({
          caseName: trim(j?.caseName),
          court: trim(j?.court),
          year: trim(j?.year),
          citation: trim(j?.citation),
          holding: trim(j?.holding),
          link: trim(j?.link),
        }))
        .filter((j) => j.caseName || j.holding || j.citation || j.court || j.year || j.link),
      amendments: (Array.isArray(form.lawyer?.amendments) ? form.lawyer.amendments : [])
        .map((a) => ({
          date: trim(a?.date) || undefined,
          summary: trim(a?.summary),
          type: trim(a?.type),
          note: trim(a?.note),
        }))
        .filter((a) => a.date || a.summary || a.type || a.note),
      commentary: trim(form.lawyer?.commentary),
    },

    resources: (Array.isArray(form.resources) ? form.resources : [])
      .map((r) => ({
        label: trim(r?.label),
        url: trim(r?.url),
        type: trim(r?.type) || "link",
      }))
      .filter((r) => r.label || r.url),
  };

  return payload;
}

export default function ManageLaws() {
  // keep your current behavior
  const token = "skipped_client_check";

  const [q, setQ] = useState("");
  const [showPublished, setShowPublished] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const isEdit = useMemo(() => Boolean(editing?._id), [editing]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminListLaws({ q, isPublished: showPublished }, token);
      setList(res.items || []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm());
  };

  const startEdit = (law) => {
    setEditing(law);
    setForm({
      ...emptyForm(),
      ...law,
      year: law?.year ?? "",
      relevanceScore: law?.relevanceScore ?? 0,
      isPublished: !!law?.isPublished,

      keywords: Array.isArray(law?.keywords) ? law.keywords : [],
      sections: Array.isArray(law?.sections) ? law.sections : [],
      situations: Array.isArray(law?.situations) ? law.situations : [],
      tags: Array.isArray(law?.tags) ? law.tags : [],

      citizen: {
        ...emptyForm().citizen,
        ...(law?.citizen || {}),
        stepsToTake: Array.isArray(law?.citizen?.stepsToTake) ? law.citizen.stepsToTake : [],
        whoToContact: Array.isArray(law?.citizen?.whoToContact) ? law.citizen.whoToContact : [],
        mustKnow: Array.isArray(law?.citizen?.mustKnow) ? law.citizen.mustKnow : [],
        faqs: normalizeFaqsForForm(law?.citizen?.faqs),
      },

      lawyer: {
        ...emptyForm().lawyer,
        ...(law?.lawyer || {}),
        relatedProvisions: Array.isArray(law?.lawyer?.relatedProvisions) ? law.lawyer.relatedProvisions : [],
        citations: Array.isArray(law?.lawyer?.citations) ? law.lawyer.citations : [],
        judgments: normalizeJudgmentsForForm(law?.lawyer?.judgments),
        amendments: normalizeAmendmentsForForm(law?.lawyer?.amendments),
      },

      resources: normalizeResourcesForForm(law?.resources),
    });
  };

  const save = async () => {
    try {
      const payload = cleanPayload(form);

      if (!payload.title) {
        alert("Title is required");
        return;
      }

      if (isEdit) {
        await adminUpdateLaw(editing._id, payload, token);
      } else {
        await adminCreateLaw(payload, token);
      }

      await load();
      startCreate();
      alert(`Law ${isEdit ? "updated" : "created"} successfully`);
    } catch (e) {
      // This will now show the actual Mongoose validation or duplicate key error
      alert(e?.response?.data?.message || e?.message || "Failed to save law");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this law? This cannot be undone.")) return;
    try {
      await adminDeleteLaw(id, token);
      await load();
      if (editing?._id === id) startCreate();
    } catch (e) {
      alert(e?.message || "Failed to delete");
    }
  };

  const togglePublish = async (id) => {
    try {
      await adminTogglePublish(id, token);
      await load();
      if (editing?._id === id) {
        // keep editor in sync if currently editing same law
        const updated = list.find((x) => x._id === id);
        if (updated) {
          startEdit({ ...editing, isPublished: !editing.isPublished });
        }
      }
    } catch (e) {
      alert(e?.message || "Failed to toggle publish");
    }
  };

const setCitizenArray = (key, value) => {
    setForm((p) => ({ ...p, citizen: { ...p.citizen, [key]: value } })); 
  };

  const setLawyerArray = (key, value) => {
    setForm((p) => ({ ...p, lawyer: { ...p.lawyer, [key]: value } })); 
  };

  // Generic nested row helpers
  const addCitizenFaq = () => {
    setForm((p) => ({
      ...p,
      citizen: {
        ...p.citizen,
        faqs: [...(p.citizen?.faqs || []), { question: "", answer: "" }],
      },
    }));
  };

  const updateCitizenFaq = (idx, key, value) => {
    setForm((p) => {
      const faqs = [...(p.citizen?.faqs || [])];
      faqs[idx] = { ...(faqs[idx] || {}), [key]: value };
      return { ...p, citizen: { ...p.citizen, faqs } };
    });
  };

  const removeCitizenFaq = (idx) => {
    setForm((p) => {
      const faqs = [...(p.citizen?.faqs || [])];
      faqs.splice(idx, 1);
      return {
        ...p,
        citizen: {
          ...p.citizen,
          faqs: faqs.length ? faqs : [{ question: "", answer: "" }],
        },
      };
    });
  };

  const addJudgment = () => {
    setForm((p) => ({
      ...p,
      lawyer: {
        ...p.lawyer,
        judgments: [
          ...(p.lawyer?.judgments || []),
          { caseName: "", court: "", year: "", citation: "", holding: "", link: "" },
        ],
      },
    }));
  };

  const updateJudgment = (idx, key, value) => {
    setForm((p) => {
      const judgments = [...(p.lawyer?.judgments || [])];
      judgments[idx] = { ...(judgments[idx] || {}), [key]: value };
      return { ...p, lawyer: { ...p.lawyer, judgments } };
    });
  };

  const removeJudgment = (idx) => {
    setForm((p) => {
      const judgments = [...(p.lawyer?.judgments || [])];
      judgments.splice(idx, 1);
      return {
        ...p,
        lawyer: {
          ...p.lawyer,
          judgments: judgments.length
            ? judgments
            : [{ caseName: "", court: "", year: "", citation: "", holding: "", link: "" }],
        },
      };
    });
  };

  const addAmendment = () => {
    setForm((p) => ({
      ...p,
      lawyer: {
        ...p.lawyer,
        amendments: [...(p.lawyer?.amendments || []), { date: "", summary: "", type: "", note: "" }],
      },
    }));
  };

  const updateAmendment = (idx, key, value) => {
    setForm((p) => {
      const amendments = [...(p.lawyer?.amendments || [])];
      amendments[idx] = { ...(amendments[idx] || {}), [key]: value };
      return { ...p, lawyer: { ...p.lawyer, amendments } };
    });
  };

  const removeAmendment = (idx) => {
    setForm((p) => {
      const amendments = [...(p.lawyer?.amendments || [])];
      amendments.splice(idx, 1);
      return {
        ...p,
        lawyer: {
          ...p.lawyer,
          amendments: amendments.length ? amendments : [{ date: "", summary: "", type: "", note: "" }],
        },
      };
    });
  };

  const addResource = () => {
    setForm((p) => ({
      ...p,
      resources: [...(p.resources || []), { label: "", url: "", type: "link" }],
    }));
  };

  const updateResource = (idx, key, value) => {
    setForm((p) => {
      const resources = [...(p.resources || [])];
      resources[idx] = { ...(resources[idx] || {}), [key]: value };
      return { ...p, resources };
    });
  };

  const removeResource = (idx) => {
    setForm((p) => {
      const resources = [...(p.resources || [])];
      resources.splice(idx, 1);
      return {
        ...p,
        resources: resources.length ? resources : [{ label: "", url: "", type: "link" }],
      };
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-serif font-bold text-stone-900">Admin • Manage Laws</h1>

        {/* Controls */}
        <div className="mt-6 bg-white border border-stone-200 shadow-sm rounded-xl p-5 flex flex-col md:flex-row gap-4 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, statute, slug..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-stone-50 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 text-sm"
          />
          <select
            value={showPublished}
            onChange={(e) => setShowPublished(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-stone-50 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 text-sm"
          >
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Unpublished</option>
          </select>
          <button
            onClick={load}
            className="px-6 py-2.5 rounded-lg bg-white border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition-colors text-sm shadow-sm"
          >
            Refresh
          </button>
          <button
            onClick={startCreate}
            className="px-6 py-2.5 rounded-lg bg-stone-900 text-white font-bold hover:bg-black transition-colors text-sm shadow-md"
          >
            + New Law
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List */}
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl shadow-sm p-5 h-fit">
            <div className="font-serif font-bold text-lg text-stone-800 mb-4 border-b border-stone-100 pb-2">
              All Laws
            </div>

            {loading ? (
              <div className="text-stone-400 text-center py-4">Loading...</div>
            ) : list.length === 0 ? (
              <div className="text-stone-400 text-center py-4">No records found.</div>
            ) : (
              <div className="space-y-3 max-h-[850px] overflow-y-auto pr-2">
                {list.map((law) => (
                  <div
                    key={law._id}
                    className={`border rounded-lg p-4 transition-all ${
                      editing?._id === law._id
                        ? "bg-stone-50 border-stone-400 ring-1 ring-stone-200"
                        : "bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div>
                        <div className="font-bold text-stone-900 leading-snug">{law.title}</div>
                        <div className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">
                          {law.category || "Other"} {law.year ? `• ${law.year}` : ""} • {law.lawType || "statute"}
                        </div>
                        {law.slug && (
                          <div className="text-[11px] text-stone-400 mt-1 break-all">/{law.slug}</div>
                        )}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                              law.isPublished
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {law.isPublished ? "Published" : "Draft"}
                          </span>
                          {typeof law.relevanceScore === "number" && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-stone-100 text-stone-600">
                              Score {law.relevanceScore}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2 pt-2 border-t border-stone-100">
                        <button
                          onClick={() => startEdit(law)}
                          className="flex-1 px-3 py-1.5 rounded text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => togglePublish(law._id)}
                          className="flex-1 px-3 py-1.5 rounded text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200"
                        >
                          {law.isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => del(law._id)}
                          className="px-3 py-1.5 rounded text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
              <div>
                <div className="font-serif font-bold text-2xl text-stone-900">
                  {isEdit ? "Edit Law" : "Create New Law"}
                </div>
                {isEdit && editing?._id && (
                  <div className="text-xs text-stone-500 mt-1">ID: {editing._id}</div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={save}
                  className="px-6 py-2.5 rounded-lg bg-stone-900 text-white font-bold hover:bg-black transition-colors shadow-md"
                >
                  {isEdit ? "Update Law" : "Create Law"}
                </button>
                <button
                  onClick={startCreate}
                  className="px-4 py-2.5 rounded-lg border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Basic Info */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-stone-400 tracking-wider mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Title *">
                    <input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className="input"
                    />
                  </Field>

                  <Field label="Slug (optional)">
                    <input
                      value={form.slug || ""}
                      onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                      placeholder="auto-generated if left blank"
                      className="input"
                    />
                  </Field>

                  <Field label="Statute Name">
                    <input
                      value={form.statuteName}
                      onChange={(e) => setForm((p) => ({ ...p, statuteName: e.target.value }))}
                      className="input"
                    />
                  </Field>

                  <Field label="Year">
                    <input
                      value={form.year}
                      onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                      placeholder="e.g. 2005"
                      className="input"
                    />
                  </Field>

                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="input"
                    >
                      {[
                        "Criminal Law",
                        "Civil & Property",
                        "Family Law",
                        "Employment & Labor",
                        "Consumer Rights",
                        "Traffic & Vehicle Laws",
                        "Cyber Law",
                        "Women & Child Protection",
                        "Finance & Tax",
                        "Transparency & Governance",
                        "Accident & Compensation",
                        "Other",
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Type">
                    <select
                      value={form.lawType}
                      onChange={(e) => setForm((p) => ({ ...p, lawType: e.target.value }))}
                      className="input"
                    >
                      <option value="statute">statute</option>
                      <option value="case">case</option>
                    </select>
                  </Field>

                  <Field label="Court Level">
                    <select
                      value={form.courtLevel || ""}
                      onChange={(e) => setForm((p) => ({ ...p, courtLevel: e.target.value }))}
                      className="input"
                    >
                      <option value="">Select Court Level...</option>
                      <option value="Supreme Court">Supreme Court</option>
                      <option value="High Court">High Court</option>
                      <option value="District Court">District Court</option>
                      <option value="Tribunal">Tribunal</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>

                  <Field label="Jurisdiction">
                    <input
                      value={form.jurisdiction}
                      onChange={(e) => setForm((p) => ({ ...p, jurisdiction: e.target.value }))}
                      className="input"
                    />
                  </Field>

                  <Field label="Practice Area">
                    <input
                      value={form.practiceArea}
                      onChange={(e) => setForm((p) => ({ ...p, practiceArea: e.target.value }))}
                      className="input"
                    />
                  </Field>

                  <Field label="Relevance Score (admin)">
                    <input
                      value={form.relevanceScore}
                      onChange={(e) => setForm((p) => ({ ...p, relevanceScore: e.target.value }))}
                      className="input"
                    />
                  </Field>

                  <Field label="Publish Status">
                    <div className="h-[42px] px-4 rounded-lg border border-stone-300 bg-stone-50 flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-700">
                        {form.isPublished ? "Published" : "Draft"}
                      </span>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!form.isPublished}
                          onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                          className="sr-only"
                        />
                        <span
                          className={`w-10 h-6 rounded-full relative transition ${
                            form.isPublished ? "bg-green-500" : "bg-stone-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${
                              form.isPublished ? "left-4.5" : "left-0.5"
                            }`}
                          />
                        </span>
                      </label>
                    </div>
                  </Field>

                 <Field label="Keywords (comma separated)">
                    <input
                      value={joinCsv(form.keywords)}
                      onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))}
                      className="input"
                    />
                  </Field>

                  <Field label="Sections (comma separated)">
                    <input
                      value={joinCsv(form.sections)}
                      onChange={(e) => setForm((p) => ({ ...p, sections: e.target.value }))}
                      className="input"
                    />
                  </Field>

                  <Field label="Situations (comma separated)">
                    <input
                      value={joinCsv(form.situations)}
                      onChange={(e) => setForm((p) => ({ ...p, situations: e.target.value }))}
                      className="input"
                    />
                  </Field>

                  <Field label="Tags (comma separated)">
                    <input
                      value={joinCsv(form.tags)}
                      onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                      className="input"
                    />
                  </Field>
                </div>
              </section>

              {/* Citizen Content */}
              <section className="bg-yellow-50/50 p-6 rounded-xl border border-yellow-100">
                <h2 className="text-lg font-serif font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Citizen View
                </h2>

                <div className="grid grid-cols-1 gap-5">
                  <Field label="Summary">
                    <textarea
                      value={form.citizen.summary}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, citizen: { ...p.citizen, summary: e.target.value } }))
                      }
                      className="textarea border-yellow-200 focus:ring-yellow-400"
                    />
                  </Field>

                  <Field label="What this means">
                    <textarea
                      value={form.citizen.whatThisMeans}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, citizen: { ...p.citizen, whatThisMeans: e.target.value } }))
                      }
                      className="textarea border-yellow-200 focus:ring-yellow-400"
                    />
                  </Field>

                  <Field label="Real-life example">
                    <textarea
                      value={form.citizen.realLifeExample}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, citizen: { ...p.citizen, realLifeExample: e.target.value } }))
                      }
                      className="textarea border-yellow-200 focus:ring-yellow-400"
                    />
                  </Field>

                  <Field label="Steps to take (comma separated)">
                    <input
                      value={joinCsv(form.citizen.stepsToTake)}
                      onChange={(e) => setCitizenArray("stepsToTake", e.target.value)}
                      className="input border-yellow-200 focus:ring-yellow-400"
                    />
                  </Field>

                  <Field label="Who to contact (comma separated)">
                    <input
                      value={joinCsv(form.citizen.whoToContact)}
                      onChange={(e) => setCitizenArray("whoToContact", e.target.value)}
                      className="input border-yellow-200 focus:ring-yellow-400"
                    />
                  </Field>

                  <Field label="Must know (comma separated)">
                    <input
                      value={joinCsv(form.citizen.mustKnow)}
                      onChange={(e) => setCitizenArray("mustKnow", e.target.value)}
                      className="input border-yellow-200 focus:ring-yellow-400"
                    />
                  </Field>

                  {/* FAQ editor */}
                  <div className="border border-yellow-200 rounded-xl bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-bold text-stone-700">FAQs</div>
                      <button
                        type="button"
                        onClick={addCitizenFaq}
                        className="px-3 py-1.5 rounded-md text-xs font-bold bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      >
                        + Add FAQ
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(form.citizen.faqs || []).map((faq, idx) => (
                        <div key={idx} className="border border-yellow-100 rounded-lg p-3 bg-yellow-50/40">
                          <div className="grid grid-cols-1 gap-3">
                            <Field label={`Question ${idx + 1}`}>
                              <input
                                value={faq.question || ""}
                                onChange={(e) => updateCitizenFaq(idx, "question", e.target.value)}
                                className="input border-yellow-200 focus:ring-yellow-400"
                              />
                            </Field>
                            <Field label="Answer">
                              <textarea
                                value={faq.answer || ""}
                                onChange={(e) => updateCitizenFaq(idx, "answer", e.target.value)}
                                className="textarea border-yellow-200 focus:ring-yellow-400 min-h-[90px]"
                              />
                            </Field>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeCitizenFaq(idx)}
                              className="px-3 py-1.5 rounded text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                            >
                              Remove FAQ
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Lawyer Content */}
              <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h2 className="text-lg font-serif font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-500 rounded-full"></span> Lawyer View
                </h2>

                <div className="grid grid-cols-1 gap-5">
                  <Field label="Official text">
                    <textarea
                      value={form.lawyer.officialText}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, lawyer: { ...p.lawyer, officialText: e.target.value } }))
                      }
                      className="textarea border-slate-300 focus:ring-slate-400 font-mono text-sm min-h-[140px]"
                    />
                  </Field>

                  <Field label="Interpretation">
                    <textarea
                      value={form.lawyer.interpretation}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, lawyer: { ...p.lawyer, interpretation: e.target.value } }))
                      }
                      className="textarea border-slate-300 focus:ring-slate-400 min-h-[120px]"
                    />
                  </Field>

                  <Field label="Related provisions (comma separated)">
                    <input
                      value={joinCsv(form.lawyer.relatedProvisions)}
                      onChange={(e) => setLawyerArray("relatedProvisions", e.target.value)}
                      className="input border-slate-300 focus:ring-slate-400"
                    />
                  </Field>

                  <Field label="Citations (comma separated)">
                    <input
                      value={joinCsv(form.lawyer.citations)}
                      onChange={(e) => setLawyerArray("citations", e.target.value)}
                      className="input border-slate-300 focus:ring-slate-400"
                    />
                  </Field>

                  <Field label="Commentary">
                    <textarea
                      value={form.lawyer.commentary || ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, lawyer: { ...p.lawyer, commentary: e.target.value } }))
                      }
                      className="textarea border-slate-300 focus:ring-slate-400 min-h-[120px]"
                    />
                  </Field>

                  {/* Judgments */}
                  <div className="border border-slate-200 rounded-xl bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-bold text-stone-700">Judgments</div>
                      <button
                        type="button"
                        onClick={addJudgment}
                        className="px-3 py-1.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        + Add Judgment
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(form.lawyer.judgments || []).map((j, idx) => (
                        <div key={idx} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Case Name">
                              <input
                                value={j.caseName || ""}
                                onChange={(e) => updateJudgment(idx, "caseName", e.target.value)}
                                className="input border-slate-300 focus:ring-slate-400"
                              />
                            </Field>
                            <Field label="Court">
                              <input
                                value={j.court || ""}
                                onChange={(e) => updateJudgment(idx, "court", e.target.value)}
                                className="input border-slate-300 focus:ring-slate-400"
                              />
                            </Field>
                            <Field label="Year">
                              <input
                                value={j.year || ""}
                                onChange={(e) => updateJudgment(idx, "year", e.target.value)}
                                className="input border-slate-300 focus:ring-slate-400"
                              />
                            </Field>
                            <Field label="Citation">
                              <input
                                value={j.citation || ""}
                                onChange={(e) => updateJudgment(idx, "citation", e.target.value)}
                                className="input border-slate-300 focus:ring-slate-400"
                              />
                            </Field>
                            <div className="md:col-span-2">
                              <Field label="Holding / Summary">
                                <textarea
                                  value={j.holding || ""}
                                  onChange={(e) => updateJudgment(idx, "holding", e.target.value)}
                                  className="textarea border-slate-300 focus:ring-slate-400 min-h-[90px]"
                                />
                              </Field>
                            </div>
                            <div className="md:col-span-2">
                              <Field label="Link">
                                <input
                                  value={j.link || ""}
                                  onChange={(e) => updateJudgment(idx, "link", e.target.value)}
                                  className="input border-slate-300 focus:ring-slate-400"
                                />
                              </Field>
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeJudgment(idx)}
                              className="px-3 py-1.5 rounded text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                            >
                              Remove Judgment
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amendments */}
                  <div className="border border-slate-200 rounded-xl bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-bold text-stone-700">Amendments</div>
                      <button
                        type="button"
                        onClick={addAmendment}
                        className="px-3 py-1.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        + Add Amendment
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(form.lawyer.amendments || []).map((a, idx) => (
                        <div key={idx} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Date">
                              <input
                                type="date"
                                value={a.date || ""}
                                onChange={(e) => updateAmendment(idx, "date", e.target.value)}
                                className="input border-slate-300 focus:ring-slate-400"
                              />
                            </Field>
                            <Field label="Type">
                              <input
                                value={a.type || ""}
                                onChange={(e) => updateAmendment(idx, "type", e.target.value)}
                                placeholder="e.g. Amendment / Notification"
                                className="input border-slate-300 focus:ring-slate-400"
                              />
                            </Field>
                            <div className="md:col-span-2">
                              <Field label="Summary">
                                <textarea
                                  value={a.summary || ""}
                                  onChange={(e) => updateAmendment(idx, "summary", e.target.value)}
                                  className="textarea border-slate-300 focus:ring-slate-400 min-h-[90px]"
                                />
                              </Field>
                            </div>
                            <div className="md:col-span-2">
                              <Field label="Note (optional)">
                                <input
                                  value={a.note || ""}
                                  onChange={(e) => updateAmendment(idx, "note", e.target.value)}
                                  className="input border-slate-300 focus:ring-slate-400"
                                />
                              </Field>
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeAmendment(idx)}
                              className="px-3 py-1.5 rounded text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                            >
                              Remove Amendment
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Resources */}
              <section className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-stone-800">Resources</h2>
                    <p className="text-stone-500 text-sm">Add links/files/reference resources shown in the law detail page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addResource}
                    className="px-3 py-1.5 rounded-md text-xs font-bold bg-stone-200 text-stone-700 hover:bg-stone-300"
                  >
                    + Add Resource
                  </button>
                </div>

                <div className="space-y-3">
                  {(form.resources || []).map((r, idx) => (
                    <div key={idx} className="border border-stone-200 rounded-lg p-3 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Field label="Label">
                          <input
                            value={r.label || ""}
                            onChange={(e) => updateResource(idx, "label", e.target.value)}
                            className="input"
                          />
                        </Field>

                        <Field label="URL">
                          <input
                            value={r.url || ""}
                            onChange={(e) => updateResource(idx, "url", e.target.value)}
                            className="input"
                            placeholder="https://..."
                          />
                        </Field>

                        <Field label="Type">
                          <select
                            value={r.type || "link"}
                            onChange={(e) => updateResource(idx, "type", e.target.value)}
                            className="input"
                          >
                            <option value="link">link</option>
                            <option value="pdf">pdf</option>
                            <option value="doc">doc</option>
                            <option value="video">video</option>
                            <option value="helpline">helpline</option>
                            <option value="portal">portal</option>
                          </select>
                        </Field>
                      </div>

                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeResource(idx)}
                          className="px-3 py-1.5 rounded text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                        >
                          Remove Resource
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-stone-100">
                <button
                  onClick={save}
                  className="px-8 py-3 rounded-xl bg-stone-900 text-white font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl"
                >
                  {isEdit ? "Update Law" : "Create Law"}
                </button>

                {isEdit && (
                  <button
                    onClick={() => togglePublish(editing._id)}
                    className="px-6 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition-colors"
                  >
                    {form.isPublished ? "Unpublish" : "Publish"}
                  </button>
                )}

                {isEdit && (
                  <button
                    onClick={() => del(editing._id)}
                    className="px-6 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-colors"
                  >
                    Delete Law
                  </button>
                )}

                <button
                  onClick={startCreate}
                  className="px-6 py-3 rounded-xl border border-stone-300 text-stone-600 font-bold hover:bg-stone-50 transition-colors"
                >
                  Reset Form
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-stone-400 text-center text-sm">
          Admin panel supports full law schema editing including FAQs, judgments, amendments, resources, slug and publish status.
        </div>
      </div>

      {/* Local utility styles */}
      <style>{`
        .input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          background: white;
          border: 1px solid rgb(214 211 209);
          outline: none;
          font-size: 14px;
        }
        .input:focus {
          box-shadow: 0 0 0 2px rgb(168 162 158 / 0.35);
        }
        .textarea {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          background: white;
          border: 1px solid rgb(214 211 209);
          outline: none;
          min-height: 80px;
          resize: vertical;
          font-size: 14px;
          line-height: 1.5;
        }
        .textarea:focus {
          box-shadow: 0 0 0 2px rgb(168 162 158 / 0.35);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block w-full">
      <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">{label}</div>
      {children}
    </label>
  );
}