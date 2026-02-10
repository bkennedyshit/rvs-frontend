"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Config = { component_name: string; page_number: number };

const inputClass =
  "w-full bg-white/7 border border-white/15 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

const btnPrimary =
  "w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer";

const btnSecondary =
  "flex-1 border border-white/15 text-slate-300 py-2.5 rounded-lg font-medium hover:bg-white/7 transition-all cursor-pointer";

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [config, setConfig] = useState<Config[]>([]);
  const [aboutMe, setAboutMe] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase
      .from("rvs_onboarding_config")
      .select("component_name, page_number")
      .then(({ data }) => { if (data) setConfig(data); });
  }, []);

  useEffect(() => {
    const savedUserId = localStorage.getItem("rvs_user_id");
    if (!savedUserId) return;
    const uid = Number(savedUserId);
    supabase
      .from("rvs_users")
      .select("id, email, current_step")
      .eq("id", uid)
      .single()
      .then(({ data }) => {
        if (data) {
          setUserId(data.id);
          setEmail(data.email);
          // If user already completed onboarding (step 4+), show done state
          if (data.current_step >= 4) {
            setDone(true);
          } else {
            setStep(data.current_step);
          }
          supabase
            .from("rvs_user_profiles")
            .select("*")
            .eq("user_id", data.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                setAboutMe(profile.about_me || "");
                setStreet(profile.street_address || "");
                setCity(profile.city || "");
                setState(profile.state || "");
                setZip(profile.zip || "");
                setBirthdate(profile.birthdate || "");
              }
            });
        }
      });
  }, []);

  const handleStep1 = async () => {
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }
    setLoading(true);

    const { data: existing } = await supabase
      .from("rvs_users")
      .select("id, current_step")
      .eq("email", email)
      .single();

    if (existing) {
      setUserId(existing.id);
      localStorage.setItem("rvs_user_id", String(existing.id));
      // If user already completed onboarding (step 4+), show done state
      if (existing.current_step >= 4) {
        setDone(true);
      } else {
        setStep(existing.current_step > 1 ? existing.current_step : 2);
      }
      setLoading(false);
      return;
    }

    const { data, error: insertErr } = await supabase
      .from("rvs_users")
      .insert({ email, password_hash: password, current_step: 2 })
      .select("id")
      .single();

    if (insertErr) { setError(insertErr.message); setLoading(false); return; }

    setUserId(data.id);
    localStorage.setItem("rvs_user_id", String(data.id));
    await supabase.from("rvs_user_profiles").insert({ user_id: data.id });
    setStep(2);
    setLoading(false);
  };

  const saveProfile = async (nextStep: number) => {
    if (!userId) return;
    setLoading(true);
    setError("");

    await supabase
      .from("rvs_user_profiles")
      .update({
        about_me: aboutMe || null,
        street_address: street || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        birthdate: birthdate || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await supabase
      .from("rvs_users")
      .update({ current_step: nextStep, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (nextStep > 3) {
      setDone(true);
      localStorage.removeItem("rvs_user_id");
    } else {
      setStep(nextStep);
    }
    setLoading(false);
  };

  const componentsForPage = (page: number) =>
    config.filter((c) => c.page_number === page).map((c) => c.component_name);

  const renderComponent = (name: string) => {
    switch (name) {
      case "about_me":
        return (
          <div key="about_me" className="space-y-2">
            <label htmlFor="about_me" className="block text-sm font-medium text-slate-300">About Me</label>
            <textarea
              id="about_me"
              rows={4}
              className={inputClass + " resize-none"}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>
        );
      case "address":
        return (
          <div key="address" className="space-y-3">
            <p className="text-sm font-medium text-slate-300">Address</p>
            <input type="text" placeholder="Street Address" aria-label="Street Address" className={inputClass} value={street} onChange={(e) => setStreet(e.target.value)} />
            <div className="grid grid-cols-3 gap-3">
              <input type="text" placeholder="City" aria-label="City" className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
              <input type="text" placeholder="State" aria-label="State" className={inputClass} value={state} onChange={(e) => setState(e.target.value)} />
              <input type="text" placeholder="Zip" aria-label="Zip Code" className={inputClass} value={zip} onChange={(e) => setZip(e.target.value)} />
            </div>
          </div>
        );
      case "birthdate":
        return (
          <div key="birthdate" className="space-y-2">
            <label htmlFor="birthdate" className="block text-sm font-medium text-slate-300">Birthdate</label>
            <input id="birthdate" type="date" className={inputClass} value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
          </div>
        );
      default:
        return null;
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-4 py-16">
        <div className="text-5xl">🎉</div>
        <h1 className="text-3xl font-bold text-white">Onboarding Complete!</h1>
        <p className="text-slate-400">Thanks for signing up, {email}.</p>
        <a href="/data" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
          View Data Table →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2" role="navigation" aria-label="Onboarding progress">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                s === step
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : s < step
                  ? "bg-emerald-500 text-white"
                  : "bg-white/10 text-slate-500"
              }`}
              aria-current={s === step ? "step" : undefined}
            >
              {s < step ? "✓" : s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-0.5 rounded-full transition-all ${s < step ? "bg-emerald-500" : "bg-white/10"}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-slate-500">Step {step} of 3</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 space-y-5">
          <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
          <p className="text-slate-400 text-sm">Get started by entering your email and password.</p>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
            <input id="email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
            <input id="password" type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button onClick={handleStep1} disabled={loading} className={btnPrimary}>
            {loading ? "Creating..." : "Get Started"}
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Tell Us More</h2>
            <p className="text-slate-400 text-sm mt-1">Help us get to know you better.</p>
          </div>
          {componentsForPage(2).map(renderComponent)}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)} className={btnSecondary}>Back</button>
            <button onClick={() => saveProfile(3)} disabled={loading} className={"flex-1 " + btnPrimary.replace("w-full ", "")}>
              {loading ? "Saving..." : "Next"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Almost Done</h2>
            <p className="text-slate-400 text-sm mt-1">Just a few more details and you&apos;re all set.</p>
          </div>
          {componentsForPage(3).map(renderComponent)}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setStep(2); supabase.from("rvs_users").update({ current_step: 2 }).eq("id", userId); }}
              className={btnSecondary}
            >
              Back
            </button>
            <button onClick={() => saveProfile(4)} disabled={loading} className={"flex-1 " + btnPrimary.replace("w-full ", "")}>
              {loading ? "Finishing..." : "Complete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
