import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../api/endpoints';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSent(true);
      if (res.data.devResetToken) setDevToken(res.data.devResetToken);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a link to reset it">
      {sent ? (
        <div className="text-center">
          <p className="text-sm text-ink-light dark:text-ink-dark">
            If an account exists for <strong>{email}</strong>, a reset link has been sent.
          </p>
          {devToken && (
            <div className="mt-4 rounded-xl bg-amber/10 p-3 text-left text-xs text-ink-light dark:text-ink-dark">
              <p className="mb-1 font-semibold">Dev mode (no SMTP configured):</p>
              <Link to={`/reset-password/${devToken}`} className="break-all text-cobalt underline">
                /reset-password/{devToken}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Button type="submit" loading={loading} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-ink-mutedLight dark:text-ink-mutedDark">
        <Link to="/login" className="font-medium text-lime-dim hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
