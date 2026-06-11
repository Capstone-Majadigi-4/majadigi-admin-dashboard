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
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#004a99] rounded-2xl mb-4 shadow-lg shadow-[#004a99]/20">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Majadigi Admin
        </h1>
        <p className="text-slate-500 text-[13px] font-medium mt-1">
          Platform Layanan Publik
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <h2 className="text-[17px] font-bold text-slate-800 mb-6 text-center">
            Masuk ke Dashboard
          </h2>

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

            <div className="pt-2">
              <Button type="submit" className="w-full py-3" loading={loading}>
                Masuk
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 font-medium mt-6">
          &copy; {new Date().getFullYear()} Majadigi. All rights reserved.
        </p>
      </div>
    </div>
  );
}
