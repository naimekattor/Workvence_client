"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { axiosFetch } from "@/utils";
import adminAxios from "@/utils/adminAxios";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";

const CATEGORIES = [
  "AI",
  "Web Development",
  "Mobile Development",
  "Design",
  "Writing",
  "Marketing",
  "Video & Animation",
  "Data",
  "Other",
];

const CreateBrief = () => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const [step, setStep] = useState(1);
  const [rawInput, setRawInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    deliveryTime: "",
  });

  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ["admin-categories-brief-create"],
    queryFn: () => adminAxios.get("/categories").then(({ data }: any) => data).catch(() => []),
  });

  const categoryList = Array.isArray(fetchedCategories)
    ? fetchedCategories
    : Array.isArray(fetchedCategories?.data)
    ? fetchedCategories.data
    : fetchedCategories?.categories || [];

  const rawFormatted = categoryList.length > 0
    ? categoryList.map((cat: any) => typeof cat === 'string' ? { name: cat, slug: cat.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : { name: cat.name || cat.title || String(cat), slug: cat.slug || (cat.name || cat.title || '').toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })
    : CATEGORIES.map((c) => ({ name: c, slug: c.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));

  const categories = [
    ...rawFormatted.filter((c: any) => c.slug !== 'other-and-general' && c.slug !== 'other' && !c.name.toLowerCase().includes('other')),
    ...rawFormatted.filter((c: any) => c.slug === 'other-and-general' || c.slug === 'other' || c.name.toLowerCase().includes('other'))
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // AI Generate mutation
  const aiGenerate = useMutation({
    mutationFn: (prompt: string) =>
      axiosFetch
        .post("/briefs/ai-generate", { prompt })
        .then(({ data }) => data),
    onSuccess: (data: any) => {
      const draft = data?.draft || data;
      setForm({
        title: draft?.title || "",
        description: draft?.description || "",
        category: draft?.category || "",
        budget: draft?.budget || "",
        deliveryTime: draft?.deliveryTime || "",
      });
      setStep(2);
      toast.success("AI draft generated!");
    },
    onError: () => {
      toast.error("Failed to generate draft. Try again.");
    },
  });

  // Post brief mutation
  const postBrief = useMutation({
    mutationFn: (briefData: any) =>
      axiosFetch.post("/briefs", briefData).then(({ data }) => data),
    onSuccess: () => {
      setStep(3);
      toast.success("Project posted successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to post project");
    },
  });

  const handleAIGenerate = () => {
    if (!rawInput.trim()) {
      toast.error("Please describe your project requirements");
      return;
    }
    aiGenerate.mutate(rawInput);
  };

  const handleSkipAI = () => {
    setStep(2);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    postBrief.mutate({
      title: form.title,
      description: form.description,
      category: form.category || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      deliveryTime: form.deliveryTime ? Number(form.deliveryTime) : undefined,
    });
  };

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex justify-center bg-slate-50 py-10 min-h-[80vh] px-4">
      <div className="w-full max-w-[780px] flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 mb-1.5">Post a Job Project</h1>
          <p className="text-slate-500 text-sm sm:text-[15px]">Describe what you need — AI can help structure it for you</p>
        </div>

        {/* Progress */}
        <div className="flex items-center bg-white rounded-xl p-4 sm:px-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 flex-1 relative">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${step >= 1 ? "bg-emerald-500 text-white border-2 border-emerald-500" : "bg-slate-100 text-slate-400 border-2 border-slate-200"}`}>
              1
            </span>
            <span className={`hidden sm:inline text-sm font-semibold whitespace-nowrap ${step >= 1 ? "text-slate-900" : "text-slate-400"}`}>
              Describe
            </span>
          </div>
          <div className={`flex-1 sm:flex-[0_0_40px] h-0.5 mx-2 rounded-sm transition-colors ${step > 1 ? "bg-emerald-500" : "bg-slate-200"}`} />
          <div className="flex items-center gap-2.5 flex-1 relative">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${step >= 2 ? "bg-emerald-500 text-white border-2 border-emerald-500" : "bg-slate-100 text-slate-400 border-2 border-slate-200"}`}>
              2
            </span>
            <span className={`hidden sm:inline text-sm font-semibold whitespace-nowrap ${step >= 2 ? "text-slate-900" : "text-slate-400"}`}>
              Review & Edit
            </span>
          </div>
          <div className={`flex-1 sm:flex-[0_0_40px] h-0.5 mx-2 rounded-sm transition-colors ${step > 2 ? "bg-emerald-500" : "bg-slate-200"}`} />
          <div className="flex items-center gap-2.5 flex-1 relative">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${step >= 3 ? "bg-emerald-500 text-white border-2 border-emerald-500" : "bg-slate-100 text-slate-400 border-2 border-slate-200"}`}>
              3
            </span>
            <span className={`hidden sm:inline text-sm font-semibold whitespace-nowrap ${step >= 3 ? "text-slate-900" : "text-slate-400"}`}>
              Published
            </span>
          </div>
        </div>

        {/* Step 1: Describe */}
        {step === 1 && !aiGenerate.isPending && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-8 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">What do you need done?</h2>
              <p className="text-sm text-slate-500 mb-5">
                Describe your project in plain language. Be as specific as
                possible — include goals, features, timeline, and budget if you
                have them in mind.
              </p>
            </div>
            <textarea
              placeholder="e.g. I need a mobile app for my restaurant that lets customers browse the menu, place orders, and pay online. Budget is around $2,000 and I need it within 3 weeks..."
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="w-full min-h-[180px] p-4 border border-slate-200 rounded-xl text-[15px] leading-relaxed text-slate-800 resize-y outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-inherit"
            />
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2">
              <button type="button" className="py-3 px-6 rounded-lg font-semibold text-sm bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer text-center" onClick={handleSkipAI}>
                Skip AI — Write manually
              </button>
              <button
                type="button"
                className="py-3 px-6 rounded-lg font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-95 text-white border-none transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAIGenerate}
                disabled={!rawInput.trim()}
              >
                ✨ Generate with AI
              </button>
            </div>
          </div>
        )}

        {/* AI Loading */}
        {step === 1 && aiGenerate.isPending && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-10 sm:p-14 flex flex-col items-center justify-center gap-4 text-center">
            <div className="text-4xl animate-pulse">✨</div>
            <h3 className="text-lg font-bold text-slate-900">Workvence AI is crafting your project...</h3>
            <p className="text-sm text-slate-500">This usually takes a few seconds</p>
            <div className="flex gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.16s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.32s]" />
            </div>
          </div>
        )}

        {/* Step 2: Review & Edit */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-8 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Review & Edit Your Project</h2>
              <p className="text-sm text-slate-500 mb-5">
                Fine-tune the details below before publishing
              </p>
            </div>

            <div className="flex flex-col gap-1.5 mb-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</label>
              <input
                type="text"
                placeholder="Give your project a clear title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full p-3 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50/50 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="flex flex-col gap-1.5 mb-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</label>
              <textarea
                placeholder="Detailed description of the project..."
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full min-h-[120px] p-3 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50/50 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-y leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full p-3 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50/50 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="">Select a category</option>
                  {categories.map((c: any) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Budget (USD)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={form.budget}
                  onChange={(e) => updateField("budget", e.target.value)}
                  className="w-full p-3 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50/50 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Delivery Time (Days)</label>
                <input
                  type="number"
                  placeholder="e.g. 7"
                  value={form.deliveryTime}
                  onChange={(e) => updateField("deliveryTime", e.target.value)}
                  className="w-full p-3 px-3.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50/50 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
              <div />
            </div>

            <div className="flex justify-between items-center gap-4 mt-2">
              <button type="button" className="py-3 px-6 rounded-lg font-semibold text-sm bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                type="button"
                className="py-3 px-7 rounded-lg font-semibold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={postBrief.isPending}
              >
                {postBrief.isPending ? "Publishing..." : "Publish Project"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 sm:p-12 text-center flex flex-col items-center">
            <div className="text-5xl mb-4 animate-in zoom-in duration-300">🎉</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Published Successfully!</h2>
            <p className="text-slate-500 text-sm sm:text-base mb-6 max-w-md">
              Your project is now live. Sellers can start submitting proposals
              right away.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
              <Link href="/briefs/my-briefs" className="py-3 px-6 rounded-lg font-semibold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-all text-center shadow-xs">
                View My Projects
              </Link>
              <Link href="/briefs" className="py-3 px-6 rounded-lg font-semibold text-sm bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all text-center">
                Browse All Projects
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CreateBriefPage() {
  return <CreateBrief />;
}
