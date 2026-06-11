import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui";
import { ROUTES } from "../../constants/routes";

export function Login() {
  const { loginWithCredentials } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const nik = formData.get("nik") as string;
    const password = formData.get("password") as string;

    setError("");
    setLoading(true);

    try {
      await loginWithCredentials(nik, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-[420px]">
        <div className="bg-white py-10 px-6 shadow-xl shadow-[#004a99]/5 sm:rounded-2xl sm:px-10 border border-slate-100">
          {/* Bagian Header & Logo (Sekarang di dalam Card) */}
          <div className="text-center mb-8">
            <img
              src="/logo.png"
              alt="Logo Majadigi"
              className="mx-auto h-14 mb-5 w-auto object-contain"
            />
            <h1 className="text-[18px] font-bold text-slate-800 tracking-tight">
              Masuk ke Dashboard
            </h1>
            <p className="text-slate-500 text-[13px] font-medium mt-1.5">
              Gunakan NIK dan password admin Anda
            </p>
          </div>

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="nik"
                className="block text-[12px] font-bold text-slate-700 mb-2 uppercase tracking-wide"
              >
                NIK
              </label>
              <input
                id="nik"
                name="nik"
                type="text"
                placeholder="Masukkan 16 digit NIK"
                className="block w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#004a99] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#004a99]/10 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[12px] font-bold text-slate-700 mb-2 uppercase tracking-wide"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan password"
                className="block w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#004a99] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#004a99]/10 transition-all duration-200"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="pt-3">
              <Button type="submit" className="w-full py-3" loading={loading}>
                Masuk
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 font-medium mt-8">
          &copy; {new Date().getFullYear()} Majadigi. All rights reserved.
        </p>
      </div>
    </div>
  );
}
