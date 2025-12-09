const handlePersonaSelection = async () => {
  try {
    setIsLoading(true);
    setError(null);

    // Set persona in store only if no callback provided
    if (!onSelected) {
      setSelectedPersona(persona);
    }

    // Update user profile with selected persona in backend (add userId as first arg)
    const userId = userProgress?.userId || userProgress?.id || localStorage.getItem('userId') || 'default_user';
    try {
      await api.updateUserProfile(userId, { persona: persona.id });
    } catch (profileError) {
      console.error('Failed to update user profile:', profileError);
      // Non-fatal: continue to reload progress
    }

    // Reload user progress to get latest data
    try {
      await loadUserProgress();
    } catch (progressError) {
      console.error('Failed to reload user progress:', progressError);
    }

    onSelected?.();
  } catch (err) {
    console.error('Failed to select persona:', err);
    setError('Failed to select journey. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

const handleLoadDemo = async (e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent card click

  try {
    setIsLoadingDemo(true);
    setError(null);

    const userId = userProgress?.userId || userProgress?.id || localStorage.getItem('userId') || 'default_user';
    
    // FIX: call backend to fetch demo state, using userId
    const result = await api.loadDemoState(userId, persona.id);

    if (result?.success) {
      setSelectedPersona(persona);

      if (result.progress) {
        const backendProgress = result.progress;

        const completedCount = typeof backendProgress.completed_phases === 'number'
          ? backendProgress.completed_phases
          : 0;

        const completedPhases = Array.from({ length: completedCount }, (_, index) => index);

        const rawCertificates = Array.isArray(backendProgress.nft_certificates)
          ? backendProgress.nft_certificates
          : [];

        const mappedNfts = rawCertificates.map((certificate: any) => {
          return certificate?.title || certificate?.nft_address || `Phase ${certificate?.phase} NFT`;
        });

        const mappedProgress = {
          ...userProgress,
          totalXP: backendProgress.total_xp || 0,
          nfts: mappedNfts,
          mfaiTokens: backendProgress.token_transactions?.mfai_tokens || 0,
          completedPhases,
          currentPersona: persona.id,
          votingPower: Math.floor((backendProgress.total_xp || 0) / 10),
          walletConnected: userProgress.walletConnected,
          walletAddress: userProgress.walletAddress,
        };

        // Update progress (overwriting the reset state from setSelectedPersona)
        setUserProgress(mappedProgress);

        // Update current phase to match progress
        const { setCurrentPhase } = useJourneyStore.getState();
        setCurrentPhase(completedCount);
      } else {
        // Fallback to standard reload if no progress returned
        await loadUserProgress();
      }

      console.log('Demo state loaded:', result.demo_state);
      onSelected?.();
    } else {
      setError('Failed to load demo state');
    }
  } catch (err) {
    console.error('Failed to load demo:', err);
    setError('Failed to load demo. Please try again.');
  } finally {
    setIsLoadingDemo(false);
  }
};
