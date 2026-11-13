import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement }) {
  const { isAuthenticated, isLoadingAuth, authError } = useAuth();

  if (isLoadingAuth) {
    return fallback;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    return unauthenticatedElement;
  }

  if (!isAuthenticated) {
    // Inside the builder preview, let the builder browse without logging in.
    // Signals: a `preview_token` URL param, an embedded frame, or the dev
    // build the preview runs on (the published app is a production build, so
    // real visitors never hit this and get the gate).
    const isBuilderPreview =
      typeof window !== 'undefined' &&
      (new URLSearchParams(window.location.search).has('preview_token') ||
        window.self !== window.top ||
        !!import.meta.env.DEV);
    if (isBuilderPreview) {
      return <Outlet />;
    }
    return unauthenticatedElement;
  }

  return <Outlet />;
}