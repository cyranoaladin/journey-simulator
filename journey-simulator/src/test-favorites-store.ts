// Test simple pour vérifier que le store fonctionne
import { useFavoritesStore } from './store/favoritesStore';

console.log('FavoritesStore loaded successfully');

// Test d'initialisation
const testStore = useFavoritesStore.getState();
console.log('Initial favorites:', testStore.favorites);
console.log('Store test passed!');
