/**
 * Test Local RAG Stack - Ollama + ChromaDB
 * Project: Money Factory AI (MFAI)
 * 
 * Tests:
 * 1. Ollama embedding generation (nomic-embed-text)
 * 2. Ollama chat completion (qwen2.5:32b)
 * 3. End-to-end RAG flow validation
 */

import { Ollama } from 'ollama';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const CHAT_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:32b';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

const ollama = new Ollama({ host: OLLAMA_HOST });

async function testEmbedding() {
  console.log('\n🔹 Test 1: Génération d\'embedding avec', EMBEDDING_MODEL);
  console.log('━'.repeat(60));
  
  try {
    const testText = "MFAI est une plateforme Web3 pour créer des projets blockchain avec l'IA";
    
    const startTime = Date.now();
    const response = await ollama.embeddings({
      model: EMBEDDING_MODEL,
      prompt: testText,
    });
    const duration = Date.now() - startTime;
    
    console.log('✅ Embedding généré avec succès');
    console.log(`   Dimension: ${response.embedding.length}d`);
    console.log(`   Premier vecteur: [${response.embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log(`   Durée: ${duration}ms`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Erreur embedding:', error.message);
    if (error.message?.includes('not found')) {
      console.error(`   ⚠️  Modèle manquant. Installez avec: ollama pull ${EMBEDDING_MODEL}`);
    }
    return false;
  }
}

async function testChatCompletion() {
  console.log('\n🔹 Test 2: Génération de réponse avec', CHAT_MODEL);
  console.log('━'.repeat(60));
  
  try {
    const query = "Qu'est-ce que MFAI ?";
    console.log(`   Question: "${query}"`);
    
    const startTime = Date.now();
    const response = await ollama.chat({
      model: CHAT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant IA expert en Web3 et blockchain. Réponds de manière concise et précise.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      options: {
        temperature: 0.4,
        num_predict: 150,
      },
    });
    const duration = Date.now() - startTime;
    
    console.log('✅ Réponse générée avec succès');
    console.log(`   Tokens prompt: ${response.prompt_eval_count || 0}`);
    console.log(`   Tokens réponse: ${response.eval_count || 0}`);
    console.log(`   Durée: ${duration}ms`);
    console.log('\n   📝 Réponse:');
    console.log('   ' + '-'.repeat(58));
    console.log('   ' + response.message.content.split('\n').join('\n   '));
    console.log('   ' + '-'.repeat(58));
    
    return true;
  } catch (error: any) {
    console.error('❌ Erreur chat:', error.message);
    if (error.message?.includes('not found')) {
      console.error(`   ⚠️  Modèle manquant. Installez avec: ollama pull ${CHAT_MODEL}`);
    }
    return false;
  }
}

async function testRAGFlow() {
  console.log('\n🔹 Test 3: Flux RAG complet (Embedding → Retrieval → Generation)');
  console.log('━'.repeat(60));
  
  try {
    const query = "Comment créer un projet DeFi sur Solana ?";
    console.log(`   Question: "${query}"`);
    
    // 1. Generate embedding for query
    const embeddingStart = Date.now();
    const embeddingResponse = await ollama.embeddings({
      model: EMBEDDING_MODEL,
      prompt: query,
    });
    const embeddingDuration = Date.now() - embeddingStart;
    
    console.log(`\n   ✓ Embedding généré (${embeddingDuration}ms)`);
    console.log(`     Dimension: ${embeddingResponse.embedding.length}d`);
    
    // 2. Simulate context retrieval (in real scenario, search ChromaDB)
    const mockContext = `
MFAI Neural Nexus - Guide DeFi Solana:
- Utiliser Anchor framework pour les smart contracts
- Configurer un wallet Phantom ou Solflare
- Déployer sur Devnet avant Mainnet
- Implémenter des pools de liquidité AMM
- Auditer la sécurité avec Soteria ou Sec3
    `.trim();
    
    console.log(`\n   ✓ Contexte récupéré (simulé)`);
    console.log(`     Longueur: ${mockContext.length} caractères`);
    
    // 3. Generate response with context
    const chatStart = Date.now();
    const chatResponse = await ollama.chat({
      model: CHAT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert DeFi sur Solana. Utilise le contexte fourni pour répondre de manière précise.',
        },
        {
          role: 'user',
          content: `Contexte:\n${mockContext}\n\nQuestion: ${query}`,
        },
      ],
      options: {
        temperature: 0.3,
        num_predict: 200,
      },
    });
    const chatDuration = Date.now() - chatStart;
    
    console.log(`\n   ✓ Réponse augmentée générée (${chatDuration}ms)`);
    console.log(`     Tokens: ${chatResponse.eval_count || 0}`);
    console.log('\n   📝 Réponse augmentée (RAG):');
    console.log('   ' + '-'.repeat(58));
    console.log('   ' + chatResponse.message.content.split('\n').join('\n   '));
    console.log('   ' + '-'.repeat(58));
    
    const totalDuration = embeddingDuration + chatDuration;
    console.log(`\n   ⚡ Latence totale RAG: ${totalDuration}ms`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Erreur flux RAG:', error.message);
    return false;
  }
}

async function checkOllamaStatus() {
  console.log('\n🔍 Vérification de l\'infrastructure Ollama...');
  console.log('━'.repeat(60));
  
  try {
    const models = await ollama.list();
    console.log(`✅ Ollama actif sur ${OLLAMA_HOST}`);
    console.log(`   Modèles installés: ${models.models.length}`);
    
    const requiredModels = [CHAT_MODEL, EMBEDDING_MODEL];
    const installedModels = models.models.map((m: any) => m.name);
    
    for (const model of requiredModels) {
      const installed = installedModels.includes(model);
      const status = installed ? '✓' : '✗';
      console.log(`   ${status} ${model}: ${installed ? 'Installé' : 'MANQUANT'}`);
    }
    
    const allInstalled = requiredModels.every(m => installedModels.includes(m));
    
    if (!allInstalled) {
      console.log('\n   ⚠️  Modèles manquants. Installez avec:');
      for (const model of requiredModels) {
        if (!installedModels.includes(model)) {
          console.log(`      ollama pull ${model}`);
        }
      }
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Ollama non accessible:', error.message);
    console.error(`   URL: ${OLLAMA_HOST}`);
    console.error('\n   💡 Démarrez Ollama avec: ollama serve');
    return false;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     TEST LOCAL RAG - OLLAMA + CHROMADB                    ║');
  console.log('║     MFAI Neural Nexus - Stack Souveraine                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const statusOk = await checkOllamaStatus();
  
  if (!statusOk) {
    console.log('\n❌ Infrastructure non prête. Arrêt des tests.');
    process.exit(1);
  }
  
  const results = {
    embedding: await testEmbedding(),
    chat: await testChatCompletion(),
    rag: await testRAGFlow(),
  };
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     RÉSUMÉ DES TESTS                                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`   Embedding (nomic-embed-text)  : ${results.embedding ? '✅ OK' : '❌ ÉCHEC'}`);
  console.log(`   Chat (qwen2.5:32b)            : ${results.chat ? '✅ OK' : '❌ ÉCHEC'}`);
  console.log(`   Flux RAG complet              : ${results.rag ? '✅ OK' : '❌ ÉCHEC'}`);
  console.log('');
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('🎉 SUCCÈS: La stack locale Ollama est opérationnelle!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Démarrer ChromaDB: docker run -p 8000:8000 chromadb/chroma');
    console.log('  2. Configurer .env: USE_OLLAMA=true, USE_CHROMADB=true');
    console.log('  3. Lancer le backend: npm run dev');
    console.log('');
    process.exit(0);
  } else {
    console.log('❌ ÉCHEC: Certains tests ont échoué. Vérifiez les logs ci-dessus.');
    console.log('');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n💥 Erreur fatale:', error);
  process.exit(1);
});
