import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 301 redirect: /bookpublishersinsouthafrica → /bookpublisherssouthafrica
export default function BookPublishersSouthAfricaNew() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/bookpublisherssouthafrica', { replace: true });
  }, [navigate]);
  return null;
}