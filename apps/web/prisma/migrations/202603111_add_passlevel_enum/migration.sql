-- Migration: Standardisation des PassLevel
-- Date: 2026-03-11
-- Description: Conversion de passLevel String vers Enum cohérent

-- Étape 1: Créer le nouvel enum
CREATE TYPE "PassLevel" AS ENUM (
  'STARTER',      -- Niveau initial (anciennement 'Free')
  'INTERMEDIATE', -- Niveau intermédiaire (anciennement 'Gold')  
  'ADVANCED',     -- Niveau avancé (anciennement 'Platinum')
  'ELITE'         -- Niveau élite (anciennement 'Diamond')
);

-- Étape 2: Ajouter une nouvelle colonne avec l'enum
ALTER TABLE "JourneyProgress" 
ADD COLUMN "passLevelNew" "PassLevel" DEFAULT 'STARTER';

-- Étape 3: Migrer les données existantes
UPDATE "JourneyProgress" 
SET "passLevelNew" = CASE 
  WHEN "passLevel" = 'Free' THEN 'STARTER'::"PassLevel"
  WHEN "passLevel" = 'Gold' THEN 'INTERMEDIATE'::"PassLevel"
  WHEN "passLevel" = 'Platinum' THEN 'ADVANCED'::"PassLevel"
  WHEN "passLevel" = 'Diamond' THEN 'ELITE'::"PassLevel"
  ELSE 'STARTER'::"PassLevel"
END;

-- Étape 4: Supprimer l'ancienne colonne
ALTER TABLE "JourneyProgress" DROP COLUMN "passLevel";

-- Étape 5: Renommer la nouvelle colonne
ALTER TABLE "JourneyProgress" RENAME COLUMN "passLevelNew" TO "passLevel";

-- Étape 6: Rendre la colonne non nullable
ALTER TABLE "JourneyProgress" ALTER COLUMN "passLevel" SET NOT NULL;

-- Note: Après migration, exécuter:
-- npx prisma generate
-- npx prisma db pull (pour mettre à jour le schéma)
