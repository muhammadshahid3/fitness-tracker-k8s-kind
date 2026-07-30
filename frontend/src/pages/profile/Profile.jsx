import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { userApi, authApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const genderOptions = [
  { value: '', label: 'Prefer not to say' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const fitnessGoalOptions = [
  { value: '', label: 'Not set' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'weight_gain', label: 'Weight Gain' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintain_weight', label: 'Maintain Weight' },
];

const activityOptions = [
  { value: '', label: 'Not set' },
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Lightly Active' },
  { value: 'moderate', label: 'Moderately Active' },
  { value: 'active', label: 'Active' },
  { value: 'very_active', label: 'Very Active' },
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    height: user?.height || '',
    weight: user?.weight || '',
    goalWeight: user?.goalWeight || '',
    fitnessGoal: user?.fitnessGoal || '',
    activityLevel: user?.activityLevel || '',
    dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        goalWeight: form.goalWeight ? Number(form.goalWeight) : undefined,
        dailyCalorieGoal: Number(form.dailyCalorieGoal),
      };
      const res = await userApi.updateProfile(payload);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const res = await userApi.updateProfilePicture(formData);
      updateUser(res.data.user);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    setPwSaving(true);
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.profilePicture ? (
              <img
                src={`${import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000'}${user.profilePicture}`}
                alt={user.name}
                className="h-20 w-20 rounded-full object-cover border border-border-light dark:border-border-dark"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cobalt/15 font-display text-2xl font-semibold text-cobalt">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="focus-ring absolute -bottom-1 -right-1 rounded-full bg-lime p-1.5 text-ink-light shadow-card"
              aria-label="Change profile picture"
            >
              <Camera size={13} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink-light dark:text-ink-dark">{user?.name}</p>
            <p className="text-sm text-ink-mutedLight dark:text-ink-mutedDark">{user?.email}</p>
            {uploading && <p className="text-xs text-lime-dim">Uploading...</p>}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">Profile Details</h3>
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Age" type="number" min="0" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            <Select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} options={genderOptions} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Height (cm)" type="number" min="0" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
            <Input label="Weight (kg)" type="number" min="0" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            <Input label="Goal Weight (kg)" type="number" min="0" value={form.goalWeight} onChange={(e) => setForm({ ...form, goalWeight: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Fitness Goal" value={form.fitnessGoal} onChange={(e) => setForm({ ...form, fitnessGoal: e.target.value })} options={fitnessGoalOptions} />
            <Select label="Activity Level" value={form.activityLevel} onChange={(e) => setForm({ ...form, activityLevel: e.target.value })} options={activityOptions} />
          </div>
          <Input
            label="Daily Calorie Goal"
            type="number"
            min="0"
            value={form.dailyCalorieGoal}
            onChange={(e) => setForm({ ...form, dailyCalorieGoal: e.target.value })}
          />
          <div>
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">Change Password</h3>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <Input
            label="Current Password"
            type="password"
            required
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              required
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            />
          </div>
          <div>
            <Button type="submit" variant="secondary" loading={pwSaving}>
              Change Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
