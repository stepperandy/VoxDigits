import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Loader2, Copy, CheckCircle2 } from 'lucide-react';

export default function TwoFactorAuth() {
  const [setup, setSetup] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSetup = async () => {
    try {
      const res = await base44.functions.invoke('setup2FA', {});
      setSetup(res.data);
    } catch (err) {
      console.error('Failed to setup 2FA:', err);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await base44.functions.invoke('verify2FA', { code });
      setSetup(null);
      setCode('');
      alert('2FA enabled! Save your backup codes in a safe place.');
    } catch (err) {
      console.error('Failed to verify:', err);
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/3">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Shield size={16} /> Two-Factor Authentication
      </h3>

      {!setup ? (
        <div>
          <p className="text-slate-400 text-sm mb-3">
            Add an extra layer of security to your account with 2FA.
          </p>
          <Button
            onClick={handleSetup}
            className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
          >
            Enable 2FA
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-xs mb-2">1. Scan with your authenticator app:</p>
            <div className="p-4 bg-white rounded-lg inline-block">
              {/* QR Code would go here */}
              <p className="text-xs text-slate-500">[QR Code]</p>
            </div>
          </div>

          <div>
            <p className="text-slate-400 text-xs mb-2">2. Or enter manually:</p>
            <div
              onClick={() => copyToClipboard(setup.secret)}
              className="p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 font-mono text-xs text-white break-all"
            >
              {setup.secret}
            </div>
          </div>

          <div>
            <p className="text-slate-400 text-xs mb-2">3. Enter 6-digit code:</p>
            <Input
              type="text"
              maxLength="6"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <div>
            <p className="text-slate-400 text-xs mb-2">Backup Codes (save these!):</p>
            <div className="space-y-1">
              {setup.backup_codes.map((code, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 group cursor-pointer"
                  onClick={() => copyToClipboard(code)}
                >
                  <span className="font-mono text-xs text-slate-400">{code}</span>
                  <Copy size={12} className="text-slate-500 opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleVerify}
            disabled={verifying || code.length !== 6}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
          >
            {verifying ? <Loader2 size={14} className="animate-spin" /> : 'Verify & Enable 2FA'}
          </Button>
        </div>
      )}
    </div>
  );
}