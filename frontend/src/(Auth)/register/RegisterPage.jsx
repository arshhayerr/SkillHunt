import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await authAPI.register({ name, email, password, role });
      if (res.status === 201) {
        navigate("/login");
      }
    } catch (error) {
      console.error('Registration error: ', error);
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Join thousands of students and recruiters
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <input
                id="name"
                onChange={(e) => setName(e.target.value)}
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={name}
                required
                className={inputClass}
              />
            </div>

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
                placeholder="Create a strong password"
                value={password}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center justify-center p-3.5 border rounded-xl cursor-pointer transition-all duration-200 text-sm font-medium ${role === 'student'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === 'student'}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  Student
                </label>

                <label
                  className={`flex items-center justify-center p-3.5 border rounded-xl cursor-pointer transition-all duration-200 text-sm font-medium ${role === 'recruiter'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="recruiter"
                    checked={role === 'recruiter'}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  Recruiter
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200 text-sm font-semibold"
            >
              Create account
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-gray-900 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;