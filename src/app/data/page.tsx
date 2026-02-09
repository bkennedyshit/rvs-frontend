"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type UserRow = {
  id: number;
  email: string;
  current_step: number;
  created_at: string;
  rvs_user_profiles: {
    about_me: string | null;
    street_address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    birthdate: string | null;
  }[];
};

export default function DataPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("rvs_users")
      .select("id, email, current_step, created_at, rvs_user_profiles(about_me, street_address, city, state, zip, birthdate)")
      .order("created_at", { ascending: false });
    if (data) setUsers(data as UserRow[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Data</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} user{users.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button
          onClick={fetchData}
          className="text-sm bg-white/[0.07] hover:bg-white/[0.12] text-slate-300 px-4 py-2 rounded-lg transition-all border border-white/10 cursor-pointer"
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500">No users yet. Complete the onboarding to see data here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.05] border-b border-white/10">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">ID</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Step</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">About Me</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Address</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Birthdate</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const p = u.rvs_user_profiles?.[0];
                const addr = p
                  ? [p.street_address, p.city, p.state, p.zip].filter(Boolean).join(", ")
                  : "";
                return (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 text-slate-300">{u.id}</td>
                    <td className="px-4 py-3 text-slate-200">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        u.current_step > 3
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {u.current_step > 3 ? "Done" : `${u.current_step}/3`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">{p?.about_me || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">{addr || "—"}</td>
                    <td className="px-4 py-3 text-slate-400">{p?.birthdate || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
