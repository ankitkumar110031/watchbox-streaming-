import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Play, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

interface AuthFormValues {
  username?: string;
  email: string;
  password: string;
}

interface AuthFormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

export const LoginPage: React.FC = () => {
  const { login, authState } = useAuth();
  const [formValues, setFormValues] = useState<AuthFormValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  if (authState.isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const validateForm = (): boolean => {
    const newErrors: AuthFormErrors = {};
    let isValid = true;

    if (!formValues.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formValues.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name as keyof AuthFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      await login(formValues.email, formValues.password);
    } catch (error) {
      setErrors({
        general: 'Failed to login. Please check your credentials and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-xl shadow-xl">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center">
            <Play className="h-10 w-10 text-purple-500" />
            <span className="text-2xl font-bold ml-2">WatchBox</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Or{' '}
            <Link to="/signup" className="text-purple-500 hover:text-purple-400 font-medium">
              create an account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-md p-3 text-sm">
              {errors.general}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              value={formValues.email}
              onChange={handleChange}
              error={errors.email}
              fullWidth
              placeholder="Enter your email"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />
            
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formValues.password}
                onChange={handleChange}
                error={errors.password}
                fullWidth
                placeholder="Enter your password"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded bg-gray-800"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="text-purple-500 hover:text-purple-400 font-medium">
                Forgot your password?
              </a>
            </div>
          </div>
          
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};

export const SignupPage: React.FC = () => {
  const { signup, authState } = useAuth();
  const [formValues, setFormValues] = useState<AuthFormValues>({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  if (authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validateForm = (): boolean => {
    const newErrors: AuthFormErrors = {};
    let isValid = true;

    if (!formValues.username) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formValues.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formValues.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formValues.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name as keyof AuthFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      await signup(formValues.username!, formValues.email, formValues.password);
    } catch (error) {
      setErrors({
        general: 'Failed to create account. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-xl shadow-xl">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center">
            <Play className="h-10 w-10 text-purple-500" />
            <span className="text-2xl font-bold ml-2">WatchBox</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold">Create your account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Or{' '}
            <Link to="/login" className="text-purple-500 hover:text-purple-400 font-medium">
              sign in to existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-md p-3 text-sm">
              {errors.general}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label="Username"
              name="username"
              type="text"
              autoComplete="username"
              value={formValues.username}
              onChange={handleChange}
              error={errors.username}
              fullWidth
              placeholder="Choose a username"
              icon={<User className="h-5 w-5 text-gray-400" />}
            />
            
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              value={formValues.email}
              onChange={handleChange}
              error={errors.email}
              fullWidth
              placeholder="Enter your email"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />
            
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formValues.password}
                onChange={handleChange}
                error={errors.password}
                fullWidth
                placeholder="Create a password"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded bg-gray-800"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
              I agree to the{' '}
              <a href="#" className="text-purple-500 hover:text-purple-400 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-500 hover:text-purple-400 font-medium">
                Privacy Policy
              </a>
            </label>
          </div>
          
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Create account
          </Button>
        </form>
      </div>
    </div>
  );
};