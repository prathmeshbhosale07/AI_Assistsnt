import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { register } from "../store/slices/authSlice";
import { loadFromUser } from "../store/slices/preferencesSlice";

export default function RegisterPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(register({ name, email, password }));
    if (register.fulfilled.match(res)) {
      dispatch(loadFromUser(res.payload));
      navigate("/");
    }
  };

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
          <div className="mb-6">
            <div className="text-sm text-slate-400">{t("appTitle")}</div>
            <h1 className="text-2xl font-semibold">{t("register")}</h1>
          </div>

          <form className="space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm text-slate-300">{t("name")}</label>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 outline-none ring-indigo-500/30 focus:ring"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">{t("email")}</label>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 outline-none ring-indigo-500/30 focus:ring"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">
                {t("password")}
              </label>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 outline-none ring-indigo-500/30 focus:ring"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-medium hover:bg-indigo-500 disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? "…" : t("register")}
            </button>
          </form>

          <div className="mt-5 text-sm text-slate-300">
            {t("login")}?
            <Link className="ml-2 text-indigo-300 hover:text-indigo-200" to="/login">
              {t("login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

