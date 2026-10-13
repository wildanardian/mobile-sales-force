import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Button from '../components/ui/Button';
import MsfLogo from '../components/MsfLogo';
import DemoRoleCard from '../features/auth/DemoRoleCard';
import IconInput from '../features/auth/IconInput';
import LoginBackdrop from '../features/auth/LoginBackdrop';
import InlineAlert from '../features/shared/InlineAlert';
import { useAuth } from '../context/AuthContext';
import { demoAccounts } from '../mocks/demoAccounts';
import type { DemoAccount } from '../types/msf';
import { parseError } from '../utils/errorMessage';

type FieldErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validasi ringan di klien; aturan lengkap tetap di backend (422)
function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (email === '') errors.email = 'Email wajib diisi.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Format email tidak valid.';
  if (password === '') errors.password = 'Password wajib diisi.';
  return errors;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearErrors = () => {
    setFormError(undefined);
    setFieldErrors({});
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return; // cegah double submit (mis. Enter ditekan berulang)

    const trimmedEmail = email.trim();
    const clientErrors = validate(trimmedEmail, password);
    setFormError(undefined);
    setFieldErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setLoading(true);
    try {
      await login({ email: trimmedEmail, password });
      navigate('/call-list', { replace: true });
    } catch (error) {
      const parsed = parseError(error);
      setFieldErrors(parsed.fieldErrors);
      // 422 ditampilkan di bawah field; selain itu sebagai alert di atas form
      if (Object.keys(parsed.fieldErrors).length === 0) setFormError(parsed.message);
      setLoading(false);
    }
  };

  const fillDemo = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    clearErrors();
  };

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-gradient-to-b from-[#F1FBF9] via-[#F7FDFC] to-[#EEFAF8] px-[33px] md:shadow-sm">
      <LoginBackdrop />

      <header className="relative flex flex-col items-center pt-[127px]">
        <MsfLogo className="h-[76px] w-[76px]" />
        <h1 className="mt-2.5 text-[46px] font-extrabold leading-none tracking-tight text-teal-700">
          MSF
        </h1>
        <p className="mt-1.5 text-[15px] font-semibold text-slate-600">Mobile Sales Force</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="relative mt-9 flex flex-col gap-4">
        {formError != null && <InlineAlert>{formError}</InlineAlert>}
        <IconInput
          id="email"
          name="email"
          label="Email atau nomor handphone"
          icon={<Mail size={19} />}
          type="text"
          inputMode="email"
          autoComplete="username"
          placeholder="Email atau nomor handphone"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearErrors();
          }}
          error={fieldErrors.email}
        />
        <IconInput
          id="password"
          name="password"
          label="Password"
          icon={<Lock size={19} />}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearErrors();
          }}
          error={fieldErrors.password}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              aria-pressed={showPassword}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          }
        />
        <Button type="submit" fullWidth loading={loading} className="mt-0.5 rounded-[10px] text-[15px] font-bold shadow-sm">
          Masuk
          <ArrowRight size={18} strokeWidth={2.5} />
        </Button>
      </form>

      <section aria-labelledby="demo-title" className="relative mt-9">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-300/80" />
          <h2 id="demo-title" className="text-[13px] font-semibold text-slate-600">
            Akun Demo
          </h2>
          <span className="h-px flex-1 bg-slate-300/80" />
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-500">
          Coba masuk dengan akun demo sesuai peran Anda
        </p>
        <div className="mt-3.5 grid grid-cols-4 gap-2">
          {demoAccounts.map((account) => (
            <DemoRoleCard
              key={account.role}
              account={account}
              selected={email === account.email}
              onSelect={fillDemo}
            />
          ))}
        </div>
      </section>

      <footer className="relative mt-auto pb-[76px] pt-12 text-center text-[9px] leading-[1.45] tracking-[0.22em] text-slate-500">
        Bersama Meningkatkan
        <br />
        Kesehatan Masyarakat
      </footer>
    </div>
  );
}
