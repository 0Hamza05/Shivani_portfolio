import Home from '../pages/Home';

export default function Work() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect /work to the home page since home serves as the primary portfolio grid
    // This line removed to allow the /work page to render content
  }, [navigate]);

  return <Home />;
}
