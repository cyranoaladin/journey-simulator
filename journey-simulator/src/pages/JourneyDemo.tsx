import { useEffect, useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { personas } from '../data/personas';
import { useJourneyStore } from '../store/journeyStore';
import { isDemoSession } from '../utils/demoSession';
import JourneyWorkspace from '../components/Journey/JourneyWorkspace';

const JourneyDemo = () => {
  const navigate = useNavigate();
  const { loginAsDemo, logout, isLoading } = useAuth();
  const { journeyId } = useParams();
  const { selectedPersona, setSelectedPersona } = useJourneyStore();

  const personaFromUrl = useMemo(() => {
    if (!journeyId) return null;
    return personas.find((p) => p.id === journeyId) ?? null;
  }, [journeyId]);

  useEffect(() => {
    // Ensure demo token is present; this keeps demo fully separated (token + URL).
    if (!isDemoSession()) {
      void loginAsDemo();
    }
  }, [loginAsDemo]);

  useEffect(() => {
    if (!personaFromUrl) {
      setSelectedPersona(null);
      return;
    }

    if (selectedPersona?.id !== personaFromUrl.id) {
      setSelectedPersona(personaFromUrl);
    }
  }, [personaFromUrl, selectedPersona?.id, setSelectedPersona]);

  if (!isDemoSession() && isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-white/70">
        Loading demo session…
      </div>
    );
  }

  // If user navigated to /journeys/demo/:id without a valid persona id, return to demo landing.
  if (journeyId && !personaFromUrl) {
    return <Navigate to="/journeys/demo" replace />;
  }

  if (!selectedPersona) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/20 bg-accent-cyan/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent-cyan">
                Demo Mode
              </div>
              <h1 className="mt-4 text-3xl font-space font-bold text-white">Journey Demo</h1>
              <p className="mt-2 text-white/70 max-w-2xl">
                This is a demo-only workflow. It uses demo credentials and simulated state. To run the real workflow,
                exit demo and launch journeys from the standard dashboard.
              </p>
            </div>
            <button
              onClick={() => void logout()}
              className="rounded-full bg-white text-black px-4 py-2 text-sm font-bold hover:bg-gray-200 transition"
            >
              Exit Demo
            </button>
          </div>

          <div className="grid gap-4">
            {personas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => navigate(`/journeys/demo/${persona.id}`)}
                className="text-left rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-white/60">{persona.passType}</div>
                    <div className="mt-2 text-xl font-semibold text-white">{persona.title}</div>
                    <div className="mt-1 text-sm text-white/70">{persona.description}</div>
                  </div>
                  <div className="shrink-0 rounded-full bg-gradient-accent px-4 py-2 text-sm font-semibold text-white">
                    Launch Demo →
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <JourneyWorkspace onBack={() => navigate('/journeys/demo')} />;
};

export default JourneyDemo;


