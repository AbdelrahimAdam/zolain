import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { userService } from '../../services'
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import {
  User,
  Mail,
  Phone,
  Bell,
  Globe,
  Moon,
  Sun,
  Lock,
  Eye,
  EyeOff,
  Crown,
  CheckCircle,
  AlertCircle,
  Save
} from 'lucide-react'

const Profile = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Editable fields state
  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    phone: '',
    preferences: {
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sessionReminders: true,
        recordingAvailable: true,
        monthlyReports: true
      },
      theme: 'system'
    }
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user?.uid) return
    try {
      setLoading(true)
      const userProfile = await userService.getUserProfile(user.uid)
      setProfile(userProfile)
      // Populate form with existing data
      setFormData({
        displayName: userProfile.displayName || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
        preferences: userProfile.preferences || {
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sessionReminders: true,
            recordingAvailable: true,
            monthlyReports: true
          },
          theme: 'system'
        }
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePreferenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }))
  }

  const handleNotificationChange = (key, checked) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [key]: checked
        }
      }
    }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await userService.updateUserProfile(user.uid, {
        displayName: formData.displayName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        preferences: formData.preferences
      })
      setSuccess(t('profile.updateSuccess', 'Profile updated successfully'))
      setEditMode(false)
      // Refresh profile
      await loadProfile()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = passwordData

    if (newPassword !== confirmPassword) {
      setError(t('profile.passwordsDoNotMatch', 'New passwords do not match'))
      return
    }
    if (newPassword.length < 6) {
      setError(t('profile.passwordTooShort', 'Password must be at least 6 characters'))
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const auth = getAuth()
      const currentUser = auth.currentUser

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
      await reauthenticateWithCredential(currentUser, credential)

      // Update password
      await updatePassword(currentUser, newPassword)

      setSuccess(t('profile.passwordUpdateSuccess', 'Password changed successfully'))
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setError(t('profile.wrongPassword', 'Current password is incorrect'))
      } else {
        setError(err.message)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('profile.notFound', 'Profile not found')}
          </h3>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {t('profile.title', 'My Profile')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('profile.subtitle', 'Manage your personal information and account settings')}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50/80 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50/80 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/50 rounded-2xl p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-300 text-sm flex-1">{success}</p>
          </div>
        )}

        {/* Profile Overview Card */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {profile.displayName?.charAt(0) || profile.email?.charAt(0) || 'U'}
              </div>
              {profile.subscription?.plan === 'premium' && (
                <div className="absolute -top-2 -right-2">
                  <Crown className="h-6 w-6 text-yellow-500 fill-current" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.displayName || profile.email}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                  {profile.role}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {profile.isActive ? 'Active' : 'Inactive'}
                </span>
                {profile.subscription?.plan === 'premium' && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    Premium
                  </span>
                )}
              </div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>Member since: {new Date(profile.createdAt).toLocaleDateString()}</p>
                <p>Last login: {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('profile.personalInfo', 'Personal Information')}
            </h3>
            {!editMode ? (
              <Button size="sm" onClick={() => setEditMode(true)}>
                {t('profile.edit', 'Edit')}
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button size="sm" onClick={handleSaveProfile} loading={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('common.save', 'Save')}
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t('profile.displayName', 'Display Name')}
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              disabled={!editMode}
              icon={<User className="h-4 w-4 text-gray-400" />}
            />
            <Input
              label={t('profile.firstName', 'First Name')}
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!editMode}
            />
            <Input
              label={t('profile.lastName', 'Last Name')}
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!editMode}
            />
            <Input
              label={t('profile.phone', 'Phone')}
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!editMode}
              icon={<Phone className="h-4 w-4 text-gray-400" />}
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
          <h3 className="text-xl font-bold mb-6">{t('profile.preferences', 'Preferences')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('profile.language', 'Language')}</label>
              <select
                value={formData.preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                disabled={!editMode}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
              </select>
            </div>
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('profile.theme', 'Theme')}</label>
              <select
                value={formData.preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                disabled={!editMode}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">{t('profile.notifications', 'Notifications')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'email', label: 'Email notifications' },
                { key: 'push', label: 'Push notifications' },
                { key: 'sessionReminders', label: 'Session reminders' },
                { key: 'recordingAvailable', label: 'Recording available' },
                { key: 'monthlyReports', label: 'Monthly reports' }
              ].map(item => (
                <label key={item.key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.preferences.notifications[item.key]}
                    onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                    disabled={!editMode}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
          <h3 className="text-xl font-bold mb-6">{t('profile.changePassword', 'Change Password')}</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              type={showCurrentPassword ? 'text' : 'password'}
              label={t('profile.currentPassword', 'Current Password')}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
              icon={<Lock className="h-4 w-4 text-gray-400" />}
              trailingIcon={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            <Input
              type={showNewPassword ? 'text' : 'password'}
              label={t('profile.newPassword', 'New Password')}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
              icon={<Lock className="h-4 w-4 text-gray-400" />}
              trailingIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              label={t('profile.confirmPassword', 'Confirm New Password')}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
              icon={<Lock className="h-4 w-4 text-gray-400" />}
              trailingIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={saving} loading={saving}>
                {t('profile.updatePassword', 'Update Password')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile