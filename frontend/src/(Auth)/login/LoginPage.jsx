import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await authAPI.login({ email, password });
      if (res.status === 200) {
        login(res.data.user);
        navigate("/");
      }
    } catch (error) {
      console.error('Login error: ', error);
    }
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400 bg-gray-50 text-sm';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
            SkillHunt
          </Link>
          <h1 className="mt-8 text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                required
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200 text-sm font-semibold"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-gray-900 hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;