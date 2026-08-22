import { useState, useContext } from 'react';
import { AlertTriangle, X, Mail, ShieldCheck } from 'lucide-react';
import { LanguageContext } from '@/lib/LanguageContext';

// Shows a dismissible banner on auth pages when the visitor is detected
// to be in mainland China (language === 'zh' from IP geo-detection).
// Helps Chinese users avoid the Great-Firewall-blocked social login buttons
// and Gmail-based email verification, which are the most common reasons
// they report "login not working".
export default function ChinaAccessNotice() {
  const { language } = useContext(LanguageContext);
  const [dismissed, setDismissed] = useState(false);

  // Only show for Chinese-speaking visitors (CN, TW, HK, SG all map to 'zh')
  if (language !== 'zh' || dismissed) return null;

  return (
    <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2 text-slate-300 text-xs leading-relaxed">
          <p className="font-bold text-amber-400 text-sm">中国大陆用户访问提示</p>
          <p>
            <span className="font-semibold text-white">社交登录不可用：</span>
            Google、Facebook 等社交登录在中国大陆被屏蔽，请使用下方的<strong>邮箱注册/登录</strong>。
          </p>
          <p>
            <span className="font-semibold text-white">邮箱建议：</span>
            Gmail 在中国大陆无法接收邮件。请使用 QQ邮箱、163邮箱、新浪邮箱或 Outlook 等可访问的邮箱注册，以免无法收到验证邮件。
          </p>
          <p>
            <span className="font-semibold text-white">支付：</span>
            推荐使用支付宝或微信支付完成订阅。如遇支付问题，请联系客服。
          </p>
          <div className="flex items-center gap-1.5 pt-1 text-slate-500">
            <ShieldCheck size={12} className="text-cyan-400" />
            <span className="text-[10px]">VoxVPN 在中国大陆可正常访问和使用</span>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-500 hover:text-white flex-shrink-0"
          aria-label="关闭"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}