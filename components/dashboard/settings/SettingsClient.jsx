"use client";

import { useEffect, useState } from "react";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Belize","Benin","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia",
  "Cameroon","Canada","Chile","China","Colombia","Costa Rica","Croatia","Cuba","Cyprus","Czechia",
  "Denmark","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia","Ethiopia","Finland","France",
  "Georgia","Germany","Ghana","Greece","Guatemala","Honduras","Hong Kong","Hungary","Iceland","India",
  "Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya",
  "Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Libya","Liechtenstein","Lithuania",
  "Luxembourg","Madagascar","Malaysia","Maldives","Mali","Malta","Mexico","Moldova","Mongolia",
  "Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand",
  "Nicaragua","Niger","Nigeria","North Macedonia","Norway","Oman","Pakistan","Panama","Paraguay","Peru",
  "Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia",
  "Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sweden",
  "Switzerland","Taiwan","Tajikistan","Tanzania","Thailand","Tunisia","Turkey","Turkmenistan","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela",
  "Vietnam","Zambia","Zimbabwe",
];

export default function SettingsClient() {
  // me
  const [loadingMe, setLoadingMe] = useState(true);
  const [meErr, setMeErr] = useState("");
  const [me, setMe] = useState({ email: "", country: "" });

  // email change
  const [email, setEmail] = useState("");
  const [emailPass, setEmailPass] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");

  // password change
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  // country
  const [country, setCountry] = useState("");
  const [countryBusy, setCountryBusy] = useState(false);
  const [countryMsg, setCountryMsg] = useState("");

  useEffect(() => {
    (async () => {
      setLoadingMe(true); setMeErr("");
      try {
        const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load profile");
        setMe({ email: data.user.email, country: data.user.country || "" });
        setEmail(data.user.email || "");
        setCountry(data.user.country || "");
      } catch (e) {
        setMeErr(e?.message || "Failed to load profile");
      } finally {
        setLoadingMe(false);
      }
    })();
  }, []);

  async function submitEmail(e) {
    e.preventDefault();
    setEmailMsg(""); setEmailBusy(true);
    try {
      const res = await fetch("/api/settings/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, currentPassword: emailPass }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to update email");
      setMe((m) => ({ ...m, email }));
      setEmailPass("");
      setEmailMsg("Email updated.");
    } catch (e) {
      setEmailMsg(e?.message || "Failed to update email");
    } finally {
      setEmailBusy(false);
    }
  }

  async function submitPassword(e) {
    e.preventDefault();
    setPwdMsg(""); setPwdBusy(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to update password");
      setCurrPass(""); setNewPass("");
      setPwdMsg("Password updated.");
    } catch (e) {
      setPwdMsg(e?.message || "Failed to update password");
    } finally {
      setPwdBusy(false);
    }
  }

  async function submitCountry(e) {
    e.preventDefault();
    setCountryMsg(""); setCountryBusy(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ country }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to update country");
      setMe((m) => ({ ...m, country }));
      setCountryMsg("Country saved.");
    } catch (e) {
      setCountryMsg(e?.message || "Failed to update country");
    } finally {
      setCountryBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-orange-800">Settings</h1>

      {meErr && (
        <div className="rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
          {meErr}
        </div>
      )}

      {/* Change Email */}
      <div className="rounded-xl border border-orange-100 bg-white p-4">
        <h2 className="font-semibold text-orange-800 mb-2">Change email</h2>
        <form onSubmit={submitEmail} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm text-orange-900 mb-1">New email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-orange-900 mb-1">Current password</label>
            <input
              type="password"
              value={emailPass}
              onChange={(e) => setEmailPass(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              required
              minLength={6}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={emailBusy}
              className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {emailBusy ? "Saving…" : "Save email"}
            </button>
          </div>
          {emailMsg && <div className="sm:col-span-2 text-sm text-orange-900/80">{emailMsg}</div>}
        </form>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border border-orange-100 bg-white p-4">
        <h2 className="font-semibold text-orange-800 mb-2">Change password</h2>
        <form onSubmit={submitPassword} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-orange-900 mb-1">Current password</label>
            <input
              type="password"
              value={currPass}
              onChange={(e) => setCurrPass(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm text-orange-900 mb-1">New password</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              required
              minLength={6}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={pwdBusy}
              className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {pwdBusy ? "Saving…" : "Save password"}
            </button>
          </div>
          {pwdMsg && <div className="sm:col-span-2 text-sm text-orange-900/80">{pwdMsg}</div>}
        </form>
      </div>

      {/* Country */}
      <div className="rounded-xl border border-orange-100 bg-white p-4">
        <h2 className="font-semibold text-orange-800 mb-2">Country</h2>
        <form onSubmit={submitCountry} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm text-orange-900 mb-1">Select country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-md border border-orange-200 px-3 py-2 outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
              required
            >
              <option value="" disabled>Select…</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={countryBusy}
              className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {countryBusy ? "Saving…" : "Save country"}
            </button>
          </div>
          {countryMsg && <div className="sm:col-span-2 text-sm text-orange-900/80">{countryMsg}</div>}
        </form>
      </div>
    </div>
  );
}
