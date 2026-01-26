const fs = require('fs')
const path = require('path')

const personasPath = path.join(__dirname, '../../src/data/personas.ts')
const outputDir = path.join(__dirname, '../data/parcours_templates')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const personasContent = fs.readFileSync(personasPath, 'utf-8')

const personasData = [
  {
    id: 'curious-student',
    name: 'curious-student',
    title: 'Curious Student',
    description: 'Discover how to transform your curiosity into valuable skills in the Proof Economy',
    icon: '🎓',
    color: 'from-blue-400 to-cyan-500',
    targetProfile: 'Young people in training or career transition, interested in new technologies',
    motivation: 'Acquire concrete skills, generate passive income and join a DAO',
    passType: 'Web3 Explorer Pass™',
    phases: [
      {
        id: 'student-learn',
        title: 'Learn',
        description: 'Understand the basics of Web3 and the Proof Economy',
        mission: 'Complete the introduction quiz and watch the explanatory videos',
        duration: '1-2 weeks',
        xpReward: 50,
        mfaiReward: 5,
        nftReward: 'Web3 Explorer',
        tools: ['Zyno AI Assistant', 'Interactive quizzes', 'Educational videos'],
        outcomes: ['Understanding of Web3 concepts', 'First NFT badge', '50 XP']
      },
      {
        id: 'student-build',
        title: 'Build',
        description: "Create your first Solana wallet with Zyno's help",
        mission: 'Set up your wallet and make your first transaction',
        duration: '3-5 days',
        xpReward: 75,
        mfaiReward: 7.5,
        nftReward: 'Wallet Master',
        tools: ['Phantom Wallet', 'Solana Testnet', 'Zyno Guidance'],
        outcomes: ['Configured wallet', 'First transaction', 'Dashboard access']
      },
      {
        id: 'student-prove',
        title: 'Prove',
        description: 'Validate your skills and mint your first Proof-of-Skill™ NFT',
        mission: 'Pass the "Web3 Foundations" challenge and get certified',
        duration: '1 week',
        xpReward: 100,
        mfaiReward: 10,
        nftReward: 'Proof-of-Skill™: Web3 Foundations',
        tools: ['Certification Platform', 'Peer Review', 'NFT Minting'],
        outcomes: ['Proof-of-Skill™ NFT', 'Community recognition', 'DAO access']
      },
      {
        id: 'student-activate',
        title: 'Activate',
        description: 'Participate in your first DAO vote and activate your rewards',
        mission: 'Vote on a community proposal and stake your first $MFAI',
        duration: '2-3 days',
        xpReward: 125,
        mfaiReward: 12.5,
        stakingRequired: 25,
        daoVoteRequired: true,
        tools: ['DAO Platform', 'Staking Interface', 'Governance Portal'],
        outcomes: ['First DAO vote', 'Staking activated', 'Zyno XP Boost']
      },
      {
        id: 'student-scale',
        title: 'Scale',
        description: 'Unlock Neuro-Dividends™ and become an active member',
        mission: 'Stake $MFAI and share your transformation testimonial',
        duration: 'Ongoing',
        xpReward: 200,
        mfaiReward: 20,
        stakingRequired: 50,
        tools: ['Cognitive Lock™', 'Revenue Sharing', 'Community Platform'],
        outcomes: ['Neuro-Dividends™ activated', 'Passive income', 'Active member status']
      }
    ]
  },
  {
    id: 'web2-entrepreneur',
    name: 'web2-entrepreneur',
    title: 'Web2 Entrepreneur',
    description: 'Transform your traditional business for the Proof Economy',
    icon: '💼',
    color: 'from-green-400 to-emerald-500',
    targetProfile: 'Professionals already active in the traditional digital economy',
    motivation: 'Tokenize a business idea, create sustainable Web3 revenue',
    passType: 'Proof-of-Vision™ Pass',
    phases: [
      {
        id: 'entrepreneur-learn',
        title: 'Learn',
        description: 'NFTs for loyalty and new economic models',
        mission: 'Study NFT use cases and evaluate your potential',
        duration: '1 week',
        xpReward: 60,
        mfaiReward: 6,
        nftReward: 'Business Visionary',
        tools: ['Case Studies', 'Business Canvas', 'ROI Calculator'],
        outcomes: ['NFT business understanding', 'Self-assessment', 'Defined strategy']
      },
      {
        id: 'entrepreneur-build',
        title: 'Build',
        description: 'Create your premium content model or loyalty NFT',
        mission: 'Develop an MVP with MFAI templates',
        duration: '2-3 weeks',
        xpReward: 100,
        mfaiReward: 10,
        nftReward: 'MVP Creator',
        tools: ['MFAI Templates', 'Smart Contract Builder', 'Design Tools'],
        outcomes: ['Functional MVP', 'Deployed smart contracts', 'First community']
      },
      {
        id: 'entrepreneur-prove',
        title: 'Prove',
        description: 'Pitch your idea to Zyno and the community',
        mission: 'Present your Proof-of-Vision™ and get initial feedback',
        duration: '1-2 weeks',
        xpReward: 150,
        mfaiReward: 15,
        nftReward: 'Proof-of-Vision™',
        daoVoteRequired: true,
        tools: ['Pitch Platform', 'Community Feedback', 'Zyno Analysis'],
        outcomes: ['Proof-of-Vision™ NFT', 'Community feedback', 'Builder Arena access']
      },
      {
        id: 'entrepreneur-activate',
        title: 'Activate',
        description: 'Integrate your Web3 layer into your existing product',
        mission: 'Launch the beta version and collect initial DAO feedback',
        duration: '1 month',
        xpReward: 200,
        mfaiReward: 20,
        stakingRequired: 75,
        daoVoteRequired: true,
        isIncubation: true,
        tools: ['Integration APIs', 'Beta Platform', 'DAO Feedback'],
        outcomes: ['Integrated Web3 product', 'First users', 'Market validation']
      },
      {
        id: 'entrepreneur-scale',
        title: 'Scale',
        description: 'Apply to the Launchpad and raise funds via Synaptic DAO',
        mission: 'Submit your funding application and present to the DAO',
        duration: '2-3 months',
        xpReward: 300,
        mfaiReward: 30,
        stakingRequired: 100,
        daoVoteRequired: true,
        isLaunchpad: true,
        tools: ['Launchpad Platform', 'DAO Funding', 'Mentor Network'],
        outcomes: ['Funding obtained', 'Team formed', 'Validated roadmap']
      }
    ]
  },
  {
    id: 'web3-developer',
    name: 'web3-developer',
    title: 'Web3 Developer',
    description: 'Leverage your technical skills in the Proof Economy',
    icon: '⚡',
    color: 'from-purple-400 to-pink-500',
    targetProfile: 'Developers and technical people familiar with Web3',
    motivation: 'Build serious products, gain recognition, evolve from solo hacker to protocol architect',
    passType: 'Proof-of-Build™ Pass',
    phases: [
      {
        id: 'developer-learn',
        title: 'Learn',
        description: 'Master smart contract fundamentals with Rust and Anchor framework',
        mission: 'Complete Rust/Anchor bootcamp, deploy Hello World, pass technical certification',
        duration: '2-3 weeks',
        xpReward: 75,
        mfaiReward: 12,
        nftReward: 'Code Explorer',
        tools: ['Solana Development Kit', 'Rust programming sandbox', 'Testing framework', 'AI code assistant'],
        outcomes: ['Rust/Anchor proficiency', 'Deployed smart contract', 'Technical foundation']
      },
      {
        id: 'developer-build',
        title: 'Build',
        description: 'Design and implement a functional protocol module',
        mission: 'Build functional DApp using MFAI SDK, contribute to open source, demonstrate excellence',
        duration: '3-4 weeks',
        xpReward: 150,
        mfaiReward: 15,
        nftReward: 'Builder MVP',
        tools: ['MFAI SDK', 'Protocol documentation', 'Development tools', 'GitHub integration'],
        outcomes: ['Production DApp', 'Open source contributions', 'Peer recognition']
      },
      {
        id: 'developer-prove',
        title: 'Prove',
        description: 'Submit your code for comprehensive audit and DAO validation',
        mission: 'Submit code for audit, pass security review, receive DAO validation',
        duration: '1-2 weeks',
        xpReward: 200,
        mfaiReward: 20,
        nftReward: 'Proof-of-Build™',
        daoVoteRequired: true,
        tools: ['Code audit platform', 'Security scanner', 'Peer review', 'Quality metrics'],
        outcomes: ['Security audit passed', 'DAO validation', 'Technical credibility']
      },
      {
        id: 'developer-activate',
        title: 'Activate',
        description: 'Present at Demo Day and join the Builder DAO',
        mission: 'Present at Demo Day, join Builder DAO, influence technical decisions',
        duration: '1 week',
        xpReward: 250,
        mfaiReward: 30,
        nftReward: 'Builder Council',
        daoVoteRequired: true,
        isIncubation: true,
        tools: ['Demo Day platform', 'Builder DAO', 'Technical governance', 'Innovation lab'],
        outcomes: ['Demo Day presentation', 'Builder DAO membership', 'Technical influence']
      },
      {
        id: 'developer-scale',
        title: 'Scale',
        description: 'Join core development team and shape protocol evolution',
        mission: 'Join core development team, lead technical initiatives, shape protocol evolution',
        duration: 'Ongoing',
        xpReward: 300,
        mfaiReward: 40,
        nftReward: 'Protocol Architect',
        stakingRequired: 100,
        daoVoteRequired: true,
        isLaunchpad: true,
        tools: ['Core development access', 'Technical leadership', 'Protocol grants', 'Innovation fund'],
        outcomes: ['Core team membership', 'Technical leadership', 'Protocol influence']
      }
    ]
  },
  {
    id: 'content-creator',
    name: 'content-creator',
    title: 'Content Creator',
    description: 'Transform your creativity into cognitive publications',
    icon: '🎨',
    color: 'from-pink-400 to-purple-500',
    targetProfile: 'Storytellers, designers, prompt engineers and AI-powered creators',
    motivation: 'Formalize creative output as verifiable contributions in the MFAI protocol',
    passType: 'Cognitive Publisher Pass',
    phases: [
      {
        id: 'creator-learn',
        title: 'Learn',
        description: 'Master Web3 visual literacy and understand NFT art economics',
        mission: 'Study NFT art cases, licensing models, and create your first visual asset',
        duration: '1-2 weeks',
        xpReward: 50,
        mfaiReward: 5,
        nftReward: 'Creator Seed',
        tools: ['NFT Art Case Studies', 'CC0 License Guide', 'Royalty Calculator', 'Visual Design Tools'],
        outcomes: ['NFT art understanding', 'First visual creation', 'Licensing knowledge']
      },
      {
        id: 'creator-build',
        title: 'Build',
        description: 'Produce a generative art series using AI and creative tools',
        mission: 'Create and mint a mini collection using AI prompts and generative techniques',
        duration: '2-3 weeks',
        xpReward: 100,
        mfaiReward: 10,
        nftReward: 'Creative Stream',
        tools: ['AI Prompt Engineering', 'Generative Art Tools', 'Collection Builder', 'Metadata Editor'],
        outcomes: ['NFT collection minted', 'AI art mastery', 'Creative workflow']
      },
      {
        id: 'creator-prove',
        title: 'Prove',
        description: 'Submit your work for peer review and mint Proof-of-Creation™',
        mission: 'Submit portfolio for community evaluation and receive Proof-of-Creation™ certification',
        duration: '1-2 weeks',
        xpReward: 150,
        mfaiReward: 15,
        nftReward: 'Proof-of-Creation™',
        daoVoteRequired: true,
        tools: ['Portfolio Platform', 'Peer Review System', 'NFT Certification', 'Quality Metrics'],
        outcomes: ['Proof-of-Creation™ NFT', 'Community recognition', 'Creator Arena access']
      },
      {
        id: 'creator-activate',
        title: 'Activate',
        description: 'Launch your creator brand and build your audience',
        mission: 'Establish your Web3 creator presence and monetize your first collection',
        duration: '2-4 weeks',
        xpReward: 200,
        mfaiReward: 20,
        stakingRequired: 50,
        daoVoteRequired: true,
        isIncubation: true,
        tools: ['Creator Platform', 'Audience Builder', 'Monetization Tools', 'Analytics Dashboard'],
        outcomes: ['Launched creator brand', 'First sales', 'Growing audience']
      },
      {
        id: 'creator-scale',
        title: 'Scale',
        description: 'Join Creator DAO and unlock sustainable creative income',
        mission: 'Become a recognized creator, mentor others, and earn royalties',
        duration: 'Ongoing',
        xpReward: 300,
        mfaiReward: 30,
        stakingRequired: 100,
        daoVoteRequired: true,
        isLaunchpad: true,
        tools: ['Creator DAO', 'Royalty System', 'Mentorship Platform', 'Revenue Dashboard'],
        outcomes: ['Creator DAO membership', 'Sustainable income', 'Creator influence']
      }
    ]
  }
]

personasData.forEach((persona) => {
  const fileName = `${persona.id}.json`
  const filePath = path.join(outputDir, fileName)
  fs.writeFileSync(filePath, JSON.stringify(persona, null, 2), 'utf-8')
  console.log(`✓ Generated: ${fileName}`)
})

console.log(`\nSuccessfully generated ${personasData.length} journey templates in ${outputDir}`)
