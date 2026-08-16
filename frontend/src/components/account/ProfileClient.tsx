'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { apiFetch, ApiError } from '@/lib/api-client';
import type { User } from '@/lib/types';

export function ProfileClient() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await apiFetch<User>('/users/me', {
        method: 'PATCH',
        body: { name, phone },
      });
      setUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: { currentPassword: current, newPassword: next },
      });
      setCurrent('');
      setNext('');
      toast.success('Password updated');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update password.');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl text-cocoa">My Profile</h1>

      <form onSubmit={saveProfile} className="card space-y-4 p-6">
        <h2 className="font-serif text-xl text-cocoa">Personal details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input value={user?.email ?? ''} className="input bg-cream/50" disabled />
          </div>
          <div>
            <label className="label">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
          </div>
        </div>
        <button className="btn-primary" disabled={savingProfile}>
          {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </button>
      </form>

      <form onSubmit={changePassword} className="card space-y-4 p-6">
        <h2 className="font-serif text-xl text-cocoa">Change password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Current password</label>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">New password</label>
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="input" required />
          </div>
        </div>
        <button className="btn-outline" disabled={savingPw}>
          {savingPw && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </button>
      </form>
    </div>
  );
}
