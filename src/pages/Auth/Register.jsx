import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { Mail, Lock, Eye, EyeOff, Video, User, Languages, Sun, Moon } from 'lucide-react'
import Button from '../../components/UI/Button.jsx'
import Input from '../../components/UI/Input.jsx'

const Register = () => {
  const { t } = useTranslation()
  const { register: registerUser } = useAuth() // rename to avoid conflict with react-hook-form's register
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [userRole, setUserRole] = useState('student')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return savedTheme === 'dark' || (!savedTheme && systemPrefersDark)
  })

  const { 
    register: formRegister, 
    handleSubmit, 
    formState: { errors }, 
    watch 
  } = useForm()

  const password = watch('password')

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    document.documentElement.classList.toggle('dark', newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
  }

  const getFirebaseErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return t('auth.emailInUse', 'This email is already registered. Please use a different email or sign in.')
      case 'auth/invalid-email':
        return t('auth.invalidEmail', 'The email address is not valid.')
      case 'auth/operation-not-allowed':
        return t('auth.operationNotAllowed', 'Email/password accounts are not enabled. Please contact support.')
      case 'auth/weak-password':
        return t('auth.weakPassword', 'The password is too weak. Please use a stronger password.')
      case 'auth/network-request-failed':
        return t('auth.networkError', 'Network error. Please check your connection and try again.')
      default:
        return error.message || t('auth.registrationFailed', 'Registration failed. Please try again.')
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    setSuccessMessage('')
    
    try {
      console.log('🔄 Starting registration...', { email: data.email, role: userRole })
      
      const result = await registerUser(
        data.email, 
        data.password, 
        {
          firstName: data.firstName,
          lastName: data.lastName,
          role: userRole
        }
      )

      console.log('📝 Registration result:', result)

      if (result.success) {
        if (result.requiresApproval) {
          setSuccessMessage(result.message || t('auth.registrationSuccess', 'Registration successful! Please wait for admin approval before logging in.'))
          // Don't navigate immediately - show success message
        } else {
          setSuccessMessage(t('auth.registrationSuccessAuto', 'Registration successful! Redirecting to dashboard...'))
          setTimeout(() => navigate('/dashboard'), 2000)
        }
      } else {
        setError(result.error || t('auth.registrationFailed', 'Registration failed. Please try again.'))
      }
    } catch (error) {
      console.error('❌ Registration error:', error)
      const errorMessage = getFirebaseErrorMessage(error)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - links to homepage */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Languages className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Zolain
              </span>
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-gray-700 dark:text-gray-200" /> : <Moon className="h-5 w-5 text-gray-700 dark:text-gray-200" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Registration Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('auth.register', 'Create your account')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('auth.registerSubtitle', 'Create your account to get started.')}
            </p>
          </div>

          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Role selection */}
          <div className="flex space-x-4 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => setUserRole('teacher')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                userRole === 'teacher'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {t('auth.registerAsTeacher', 'Teacher')}
            </button>
            <button
              type="button"
              onClick={() => setUserRole('student')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                userRole === 'student'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {t('auth.registerAsStudent', 'Student')}
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('auth.firstName', 'First Name')}
                  type="text"
                  autoComplete="given-name"
                  placeholder="John"
                  icon={<User size={18} className="text-gray-400" />}
                  {...formRegister('firstName', {
                    required: t('validation.required', { field: 'First Name' }),
                    minLength: {
                      value: 2,
                      message: t('validation.minLength', { field: 'First Name', min: 2 })
                    }
                  })}
                  error={errors.firstName?.message}
                />

                <Input
                  label={t('auth.lastName', 'Last Name')}
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  {...formRegister('lastName', {
                    required: t('validation.required', { field: 'Last Name' }),
                    minLength: {
                      value: 2,
                      message: t('validation.minLength', { field: 'Last Name', min: 2 })
                    }
                  })}
                  error={errors.lastName?.message}
                />
              </div>

              <Input
                label={t('auth.email', 'Email address')}
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                icon={<Mail size={18} className="text-gray-400" />}
                {...formRegister('email', {
                  required: t('validation.required', { field: 'Email' }),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('validation.invalidEmail', 'Invalid email address')
                  }
                })}
                error={errors.email?.message}
              />

              <Input
                label={t('auth.password', 'Password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                icon={<Lock size={18} className="text-gray-400" />}
                trailingIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                {...formRegister('password', {
                  required: t('validation.required', { field: 'Password' }),
                  minLength: {
                    value: 6,
                    message: t('validation.minLength', { field: 'Password', min: 6 })
                  }
                })}
                error={errors.password?.message}
              />

              <Input
                label={t('auth.confirmPassword', 'Confirm Password')}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                icon={<Lock size={18} className="text-gray-400" />}
                trailingIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                {...formRegister('confirmPassword', {
                  required: t('validation.required', { field: 'Confirm Password' }),
                  validate: value => value === password || t('validation.passwordsMatch', 'Passwords must match')
                })}
                error={errors.confirmPassword?.message}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? t('auth.creatingAccount', 'Creating account...') : t('auth.register', 'Create account')}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.hasAccount', 'Already have an account?')}{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {t('auth.login', 'Sign in')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register