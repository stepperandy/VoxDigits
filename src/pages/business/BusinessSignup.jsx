import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Signup and login are now one unified experience on /business/login.
// This route redirects there so existing links keep working.
export default function BusinessSignup() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/business/login', { replace: true }); }, [navigate]);
  return null;
}