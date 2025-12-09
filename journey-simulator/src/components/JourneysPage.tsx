import React, { useEffect, useState, useCallback } from 'react';
import JourneyCard from './Journey/JourneyCard';
import { Loader2 } from 'lucide-react';

// Placeholders for types
type PersonaType = { id: string; title: string; description: string; };
type UserProgressType = { userId?: string; id?: string;[key: string]: any };

const DUMMY_PERSONAS: PersonaType[] = [
    { id: 'builder', title: 'Builder', description: 'Focus on smart contract development.' },
    { id: 'trader', title: 'Trader', description: 'Focus on market dynamics.' },
];

const JourneysPage: React.FC = () => {
    const [personas] = useState<PersonaType[]>(DUMMY_PERSONAS);
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

    const handlePersonaSelected = useCallback(() => {
        // Handle navigation or state updates after selection
        console.log("Persona selected, navigating...");
    }, []);

    // Rendu des JourneyCards avec les props complètes
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Choose Your Journey</h2>
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
