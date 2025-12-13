import { useState } from 'react';
import { togglePasswordVisibility } from '../utils/auth'; // keep only this
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CreateAccount({ onBackToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const navigate = useNavigate();

  const handleCreateAccount = (e) => {
    e.preventDefault();

    if (!name || !email || !password || !dob) {
      triggerToast('Please fill out all fields.', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      triggerToast('Account created! (Mock Mode)', 'success');

      // After mock success, go back to login
      setTimeout(() => {
        if (typeof onBackToLogin === 'function') onBackToLogin();
      }, 900);

      setIsLoading(false);
    }, 1200);
  };

  const triggerToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <form onSubmit={handleCreateAccount} className="space-y-5 w-full max-w-md">
      {isLoading && <LoadingSpinner overlay size={50} color="white" />}

      {/* Name */}
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isLoading}
        className="w-full p-4 rounded-md bg-zinc-800 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-500"
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        className="w-full p-4 rounded-md bg-zinc-800 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-500"
      />

      {/* Password */}
      <div className="relative">
        <input
          id="newPassword"
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="w-full p-4 pr-20 rounded-md bg-zinc-800 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility('newPassword')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-violet-300 hover:text-violet-400"
        >
          Show
        </button>
      </div>

      {/* DOB */}
      <select
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        disabled={isLoading}
        className="w-full p-4 rounded-md bg-zinc-800 text-white text-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-500"
      >
        <option value="">Select Date of Birth</option>
        <option value="1990-2000">1990 - 2000</option>
        <option value="2001-2005">2001 - 2005</option>
        <option value="2006-2010">2006 - 2010</option>
      </select>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-violet-600 hover:bg-violet-700 transition p-4 rounded-md text-white font-semibold"
      >
        {isLoading ? 'Creating...' : 'Sign Up'}
      </button>

      {/* Back to Login */}
      <p className="text-center text-sm text-violet-400 mt-2">
        <a
          href="#"
          className="hover:underline"
          onClick={(e) => {
            e.preventDefault();
            if (typeof onBackToLogin === 'function') onBackToLogin();
          }}
        >
          Already Registered? Login
        </a>
      </p>

      {showToast && <Toast message={toastMessage} type={toastType} />}
    </form>
  );
}

