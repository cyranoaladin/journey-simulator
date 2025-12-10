import React, { useEffect, useState, useCallback } from 'react';
import JourneyCard from './Journey/JourneyCard';
import { Loader2 } from 'lucide-react';
import { personas as initialPersonas } from '@/data/personas';

// Placeholders for types
type PersonaType = { id: string; title: string; description: string;[key: string]: any };
type UserProgressType = { userId?: string; id?: string;[key: string]: any };

interface JourneysPageProps {
    onPersonaSelect?: (persona: PersonaType) => void;
}

const JourneysPage: React.FC<JourneysPageProps> = ({ onPersonaSelect }) => {
    const [personas] = useState<PersonaType[]>(initialPersonas);
    const [userProgress, setUserProgress] = useState<UserProgressType>({});
    const [loading, setLoading] = useState(true);

    const loadUserProgress = useCallback(async () => {
        // Implement logic to fetch user progress if necessary, otherwise use local state
        // This is a required prop for JourneyCard
        setLoading(false);
    }, []);

    useEffect(() => {
        loadUserProgress();
    }, [loadUserProgress]);

    const handlePersonaSelected = useCallback((persona: any) => {
        if (onPersonaSelect) {
            onPersonaSelect(persona);
        }
        console.log("Persona selected:", persona.title);
    }, [onPersonaSelect]);

    // Rendu des JourneyCards avec les props complètes
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Choose Your Path to Sovereignty</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 size={20} className="animate-spin" /> Loading journeys...
                    </div>
                ) : (
                    personas.map((persona) => (
                        <JourneyCard
                            key={persona.id}
                            persona={persona}
                            onSelected={handlePersonaSelected}
                            loadUserProgress={loadUserProgress} // Required prop
                            userProgress={userProgress}       // Required prop
                            setUserProgress={setUserProgress} // Required prop
                            demoMode={true}                   // Example prop
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default JourneysPage;
