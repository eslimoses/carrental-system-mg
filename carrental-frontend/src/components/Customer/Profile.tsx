import React, { useState, useRef, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiCamera, FiUpload, FiCheck, FiX, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/api/auth';
import '../../styles/Profile.css';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  city: string;
  address: string;
  avatar: string | null;
  licensePhotoFront: string | null;
  licensePhotoBack: string | null;
}

const Profile: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const licenseFrontRef = useRef<HTMLInputElement>(null);
  const licenseBackRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    city: user?.city || '',
    address: user?.address || '',
    avatar: user?.profilePhoto || null,
    licensePhotoFront: user?.licensePhotoFront || null,
    licensePhotoBack: user?.licensePhotoBack || null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load profile data on mount
  useEffect(() => {
    if (user?.id) {
      loadProfileData();
    }
  }, [user?.id]);

  const loadProfileData = async () => {
    try {
      const response = await authAPI.getProfile(user?.id);
      if (response.data) {
        setProfileData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phone: response.data.phoneNumber || '',
          dateOfBirth: response.data.dateOfBirth || '',
          city: response.data.city || '',
          address: response.data.address || '',
          avatar: response.data.profilePhoto || null,
          licensePhotoFront: response.data.licensePhotoFront || null,
          licensePhotoBack: response.data.licensePhotoBack || null
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, licensePhotoFront: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, licensePhotoBack: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        city: profileData.city,
        address: profileData.address,
        profilePhoto: profileData.avatar,
        licensePhotoFront: profileData.licensePhotoFront,
        licensePhotoBack: profileData.licensePhotoBack
      };

      await authAPI.updateProfile(user?.id, updateData);
      // Update user in context and localStorage
      updateUserProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        city: profileData.city,
        address: profileData.address,
        profilePhoto: profileData.avatar,
        licensePhotoFront: profileData.licensePhotoFront,
        licensePhotoBack: profileData.licensePhotoBack
      });
      setSaveStatus('saved');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="profile-title">My Profile</h1>
        
        {/* Profile Header with Avatar */}
        <div className="profile-header-card">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  <FiUser size={48} />
                </div>
              )}
              <button 
                className="avatar-edit-btn"
                onClick={() => avatarInputRef.current?.click()}
              >
                <FiCamera size={16} />
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-name-section">
              <h2>{profileData.firstName} {profileData.lastName}</h2>
              <p className="profile-email">{profileData.email}</p>
              <span className="profile-badge">Verified Customer</span>
            </div>
          </div>
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            <FiEdit2 size={18} />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Account Information */}
        <div className="profile-section">
          <h3 className="section-title">Account Information</h3>
          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FiUser className="label-icon" />
                  First Name
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="form-group">
                <label>
                  <FiUser className="label-icon" />
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <FiMail className="label-icon" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>
                  <FiPhone className="label-icon" />
                  Phone Number
                </label>
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <FiCalendar className="label-icon" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>
                  <FiUpload className="label-icon" />
                  City
                </label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your city"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>
                  <FiUpload className="label-icon" />
                  Full Address
                </label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your complete address"
                  className="address-textarea"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Driving License Section */}
        <div className="profile-section">
          <h3 className="section-title">Driving License</h3>
          <p className="section-description">
            Upload clear images of your driving license for verification. This is required for booking vehicles.
          </p>
          
          <div className="license-upload-grid">
            {/* Front Side */}
            <div className="license-upload-card">
              <h4>Front Side</h4>
              <div 
                className={`license-upload-area ${profileData.licensePhotoFront ? 'has-image' : ''}`}
                onClick={() => licenseFrontRef.current?.click()}
              >
                {profileData.licensePhotoFront ? (
                  <div className="license-preview">
                    <img src={profileData.licensePhotoFront} alt="License Front" />
                    <div className="license-overlay">
                      <FiCamera size={24} />
                      <span>Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">
                      <FiUpload size={32} />
                    </div>
                    <p>Click here to upload the front side of your driving license</p>
                    <span className="upload-hint">JPG, PNG or PDF (Max 5MB)</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={licenseFrontRef}
                onChange={handleLicenseFrontChange}
                accept="image/*,.pdf"
                style={{ display: 'none' }}
              />
            </div>

            {/* Back Side */}
            <div className="license-upload-card">
              <h4>Back Side</h4>
              <div 
                className={`license-upload-area ${profileData.licensePhotoBack ? 'has-image' : ''}`}
                onClick={() => licenseBackRef.current?.click()}
              >
                {profileData.licensePhotoBack ? (
                  <div className="license-preview">
                    <img src={profileData.licensePhotoBack} alt="License Back" />
                    <div className="license-overlay">
                      <FiCamera size={24} />
                      <span>Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">
                      <FiUpload size={32} />
                    </div>
                    <p>Click here to upload the back side of your driving license</p>
                    <span className="upload-hint">JPG, PNG or PDF (Max 5MB)</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={licenseBackRef}
                onChange={handleLicenseBackChange}
                accept="image/*,.pdf"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="license-status">
            <div className="status-item pending">
              <FiCheck className="status-icon" />
              <span>License verification pending</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button 
          className={`save-profile-btn ${saveStatus}`}
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' && (
            <>
              <div className="spinner"></div>
              Saving Changes...
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <FiCheck size={20} />
              Changes Saved!
            </>
          )}
          {(saveStatus === 'idle' || saveStatus === 'error') && (
            <>
              <FiCheck size={20} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Profile;
