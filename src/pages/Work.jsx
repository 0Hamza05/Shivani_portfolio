import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Work() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect /work to the home page since home serves as the primary portfolio grid
    navigate('/');
  }, [navigate]);

  return null;
}
