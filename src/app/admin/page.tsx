"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const COMPONENTS = ["about_me", "address", "birthdate"];
const LABELS: Record<string, string> = {
  about_me: "📝 About Me",
  address: "📍 Address",
  birthdate: "🎂 Birthdate",
};

type Config = { component_name: string; page_number: number };

export default function AdminPage() {
  const [config, setConfig] = useState<Config[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("rvs_onboarding_config")
      .select("component_name, page_number")
      .then(({ data }) => { if (data) setConfig(data); });
  }, []);

  const getPage = (name: string) =>
    config.find((c) => c.component_name === name)?.page_number ?? 2;

  const setPage = (name: string, page: number) => {
    setConfig((prev) => {
      const updated = prev.map((c) =>
        c.component_name === name ? { ...c, page_number: page } : c
      );
      const page2Count = updated.filter((c) => c.page_number === 2).length;
      const page3Count = updated.filter((c) => c.page_number === 3).length;
      if (page2Count === 0 || page3Count === 0) return prev;
      return updated;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    for (const c of config) {
      await supabase
        .from("rvs_onboarding_config")
        .update({ page_number: c.page_number, updated_at: new Date().toISOString() })
        .eq("component_name", c.component_name);
    }
    setSaving(false);
    setSaved(true);
  };

  const page2 = config.filter((c) => c.page_number === 2);
  const page3 = config.filter((c) => c.page_number === 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin — Onboarding Config</h1>
        <p className="text-slate-400 text-sm mt-1">
          Assign components to page 2 or page 3. Each page must have at least one.
        </p>
      </div>

      <div className="bg-white/[0.05] backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-4">
        {COMPONENTS.map((name) => (
          <div key={name} className="flex items-center justify-between py-2">
            <span className="font-medium text-slate-200">{LABELS[name]}</span>
            <div className="flex gap-2">
              {[2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(name, p)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    getPage(name) === p
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-white/[0.07] text-slate-400 hover:bg-white/[0.12] hover:text-slate-200"
                  }`}
                >
                  Page {p}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/[0.03] rounded-xl p-5 border border-white/10">
          <h3 className="font-semibold text-sm text-indigo-400 mb-3">Page 2</h3>
          <ul className="text-sm text-slate-400 space-y-1.5">
            {page2.map((c) => (
              <li key={c.component_name}>{LABELS[c.component_name]}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-5 border border-white/10">
          <h3 className="font-semibold text-sm text-indigo-400 mb-3">Page 3</h3>
          <ul className="text-sm text-slate-400 space-y-1.5">
            {page3.map((c) => (
              <li key={c.component_name}>{LABELS[c.component_name]}</li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
      >
        {saving ? "Saving..." : "Save Configuration"}
      </button>

      {saved && (
        <p className="text-emerald-400 text-sm text-center">✓ Configuration saved!</p>
      )}
    </div>
  );
}
