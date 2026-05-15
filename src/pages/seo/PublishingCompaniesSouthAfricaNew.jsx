import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 301 redirect: /publishingcompaniesinsouthafrica → /publishingcompaniessouthafrica
export default function PublishingCompaniesSouthAfricaNew() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/publishingcompaniessouthafrica', { replace: true });
  }, [navigate]);
  return null;
}