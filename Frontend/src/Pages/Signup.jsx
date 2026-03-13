import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
    const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(name, email, password);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 border border-white/50 relative overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1447E6] to-[#3C53E8]" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
          <p className="text-gray-500 mt-2.5 font-medium">Join us for better health</p>
        </div>

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-xl mb-6 text-sm font-semibold border border-red-100 flex items-center gap-3">
             <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 ml-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-[#1447E6] focus:border-transparent outline-none transition-all placeholder:text-gray-400 shadow-sm"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-[#1447E6] focus:border-transparent outline-none transition-all placeholder:text-gray-400 shadow-sm"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-[#1447E6] focus:border-transparent outline-none transition-all placeholder:text-gray-400 shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-blue-200 transition-all transform hover:-translate-y-1 active:translate-y-0 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#1447E6] to-[#3C53E8] hover:brightness-110"
            }`}
          >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                </span>
            ) : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-[#1447E6] font-bold hover:text-[#3C53E8] transition-colors">
                Login
            </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
