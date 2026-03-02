import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { savePreferences } from "../store/slices/preferencesSlice";

const AVATARS = ["robot", "boy", "girl", "cat", "dog", "alien", "ninja", "unicorn"];

const AVATAR_MAP = {
  "default-1": "robot",
  "default-2": "boy",
  "default-3": "girl",
  "default-4": "cat",
};

const resolveAvatar = (name) => AVATAR_MAP[name] || name;

export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const prefs = useAppSelector((s) => s.preferences);

  const [assistantName, setAssistantName] = useState(prefs.assistantName);
  const [avatar, setAvatar] = useState(resolveAvatar(prefs.avatar));
  const [voiceProfile, setVoiceProfile] = useState(prefs.voiceProfile || "default");
  
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setAvailableVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    setAssistantName(prefs.assistantName);
    setAvatar(resolveAvatar(prefs.avatar));
    setVoiceProfile(prefs.voiceProfile || "default");
  }, [prefs.assistantName, prefs.avatar, prefs.voiceProfile]);

  const onSave = async () => {
    const res = await dispatch(savePreferences({ avatar, assistantName, language: "en", voiceProfile }));
    if (savePreferences.fulfilled.match(res)) {
      navigate("/");
    }
  };

  return (
    <Layout>
      <div className="grid gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-5 shadow-sm dark:shadow-none transition-colors duration-300">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t("settings")}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Customize the avatar, language, and assistant name here.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">{t("assistantName")}</label>
              <input
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 px-3 py-2 outline-none ring-indigo-500/30 focus:ring transition-colors"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-300">Voice Profile</label>
              <select
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring ring-indigo-500/30 transition-colors"
                value={voiceProfile}
                onChange={(e) => setVoiceProfile(e.target.value)}
              >
                <option value="default">Default</option>
                {availableVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 text-sm text-slate-600 dark:text-slate-300">{t("avatar")}</div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-4">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={[
                    "flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all",
                    avatar === a
                      ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/40 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-800/40",
                  ].join(" ")}
                >
                  <img
                    src={`/avatars/${a}.png`}
                    alt={a}
                    className="size-16 rounded-full object-cover"
                  />
                  <span className="text-xs capitalize text-slate-600 dark:text-slate-300">{a}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
              disabled={prefs.saving}
            >
              {prefs.saving ? "…" : t("save")}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

