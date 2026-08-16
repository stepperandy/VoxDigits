import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/**
 * MobileBackButton — reusable back button for child mobile screens.
 * Shows '< Back' with a left arrow, uses navigate(-1).
 * Only visible on non-root screens (rootPath default '/').
 */
export default function MobileBackButton({ rootPath = '/', label = 'Back', className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname === rootPath;
  if (isRoot) return null;

  return (
    <button
      onClick={() => navigate(-1)}
      aria-label={label}
      className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-white text-sm font-semibold touch-target hover:bg-white/5 transition-colors ${className}`}
    >
      <ChevronLeft size={18} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}