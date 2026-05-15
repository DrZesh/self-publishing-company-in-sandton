import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 301 redirect: /bookprintingjohannesburgnew → /bookprintingjohannesburg
export default function BookPrintingJohannesburgNew() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/bookprintingjohannesburg', { replace: true });
  }, [navigate]);
  return null;
}