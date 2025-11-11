import { Persona } from "../types/journey";

export const personas: Persona[] = [
  {
    id: "curious-student",
    name: "curious-student",
    title: "Curious Student",
    description:
      "Discover how to transform your curiosity into valuable skills in the Proof Economy",
    icon: "🎓",
    color: "from-blue-400 to-cyan-500",
    targetProfile:
      "Young people in training or career transition, interested in new technologies",
    motivation:
      "Acquire concrete skills, generate passive income and join a DAO",
    passType: "Web3 Explorer Pass™",
    phases: [
      {
        id: "student-learn",
        title: "Learn",
        description: "Understand the basics of Web3 and the Proof Economy",
        mission:
          "Complete the introduction quiz and watch the explanatory videos",
        duration: "1-2 weeks",
        xpReward: 50,
        mfaiReward: 5,
        nftReward: "Web3 Explorer",
        tools: [
          "Zyno AI Assistant",
          "Interactive quizzes",
          "Educational videos",
        ],
        outcomes: [
          "Understanding of Web3 concepts",
          "First NFT badge",
          "50 XP",
        ],
        zynoTip:
          "You're not just learning. You're mining skills into capital. Each mastered concept becomes a tokenized asset.",
      },
      {
        id: "student-build",
        title: "Build",
        description: "Create your first Solana wallet with Zyno's help",
        mission: "Set up your wallet and make your first transaction",
        duration: "3-5 days",
        xpReward: 75,
        mfaiReward: 7.5,
        nftReward: "Wallet Master",
        tools: ["Phantom Wallet", "Solana Testnet", "Zyno Guidance"],
        outcomes: [
          "Configured wallet",
          "First transaction",
          "Dashboard access",
        ],
        zynoTip:
          "Your wallet isn't just a tool, it's your sovereign identity. Each transaction proves your evolution.",
      },
      {
        id: "student-prove",
        title: "Prove",
        description:
          "Validate your skills and mint your first Proof-of-Skill™ NFT",
        mission: 'Pass the "Web3 Foundations" challenge and get certified',
        duration: "1 week",
        xpReward: 100,
        mfaiReward: 10,
        nftReward: "Proof-of-Skill™: Web3 Foundations",
        tools: ["Certification Platform", "Peer Review", "NFT Minting"],
        outcomes: [
          "Proof-of-Skill™ NFT",
          "Community recognition",
          "DAO access",
        ],
        zynoTip:
          "This NFT isn't decorative. It's cryptographic proof of your transformation. It opens doors.",
      },
      {
        id: "student-activate",
        title: "Activate",
        description:
          "Participate in your first DAO vote and activate your rewards",
        mission: "Vote on a community proposal and stake your first $MFAI",
        duration: "2-3 days",
        xpReward: 125,
        mfaiReward: 12.5,
        stakingRequired: 25,
        daoVoteRequired: true,
        tools: ["DAO Platform", "Staking Interface", "Governance Portal"],
        outcomes: ["First DAO vote", "Staking activated", "Zyno XP Boost"],
        zynoTip:
          "You're not voting, you're co-creating the future. Each decision shapes the ecosystem you own.",
      },
      {
        id: "student-scale",
        title: "Scale",
        description: "Unlock Neuro-Dividends™ and become an active member",
        mission: "Stake $MFAI and share your transformation testimonial",
        duration: "Ongoing",
        xpReward: 200,
        mfaiReward: 20,
        stakingRequired: 50,
        tools: ["Cognitive Lock™", "Revenue Sharing", "Community Platform"],
        outcomes: [
          "Neuro-Dividends™ activated",
          "Passive income",
          "Active member status",
        ],
        zynoTip:
          "Congratulations! You've gone from consumer to owner. Your skills now generate dividends.",
      },
    ],
  },
  {
    id: "web2-entrepreneur",
    name: "web2-entrepreneur",
    title: "Web2 Entrepreneur",
    description: "Transform your traditional business for the Proof Economy",
    icon: "💼",
    color: "from-green-400 to-emerald-500",
    targetProfile:
      "Professionals already active in the traditional digital economy",
    motivation: "Tokenize a business idea, create sustainable Web3 revenue",
    passType: "Proof-of-Vision™ Pass",
    phases: [
      {
        id: "entrepreneur-learn",
        title: "Learn",
        description: "NFTs for loyalty and new economic models",
        mission: "Study NFT use cases and evaluate your potential",
        duration: "1 week",
        xpReward: 60,
        mfaiReward: 6,
        nftReward: "Business Visionary",
        tools: ["Case Studies", "Business Canvas", "ROI Calculator"],
        outcomes: [
          "NFT business understanding",
          "Self-assessment",
          "Defined strategy",
        ],
        zynoTip:
          "Your clients are no longer consumers, they become stakeholders. Transform audience into owners.",
      },
      {
        id: "entrepreneur-build",
        title: "Build",
        description: "Create your premium content model or loyalty NFT",
        mission: "Develop an MVP with MFAI templates",
        duration: "2-3 weeks",
        xpReward: 100,
        mfaiReward: 10,
        nftReward: "MVP Creator",
        tools: ["MFAI Templates", "Smart Contract Builder", "Design Tools"],
        outcomes: [
          "Functional MVP",
          "Deployed smart contracts",
          "First community",
        ],
        zynoTip:
          "Your MVP isn't a product, it's an ecosystem. Each user becomes a co-creator of value.",
      },
      {
        id: "entrepreneur-prove",
        title: "Prove",
        description: "Pitch your idea to Zyno and the community",
        mission: "Present your Proof-of-Vision™ and get initial feedback",
        duration: "1-2 weeks",
        xpReward: 150,
        mfaiReward: 15,
        nftReward: "Proof-of-Vision™",
        daoVoteRequired: true,
        tools: ["Pitch Platform", "Community Feedback", "Zyno Analysis"],
        outcomes: [
          "Proof-of-Vision™ NFT",
          "Community feedback",
          "Builder Arena access",
        ],
        zynoTip:
          "Your vision becomes reality when it resonates with the community. Collective intelligence validates innovation.",
      },
      {
        id: "entrepreneur-activate",
        title: "Activate",
        description: "Integrate your Web3 layer into your existing product",
        mission: "Launch the beta version and collect initial DAO feedback",
        duration: "1 month",
        xpReward: 200,
        mfaiReward: 20,
        stakingRequired: 75,
        daoVoteRequired: true,
        isIncubation: true,
        tools: ["Integration APIs", "Beta Platform", "DAO Feedback"],
        outcomes: [
          "Integrated Web3 product",
          "First users",
          "Market validation",
        ],
        zynoTip:
          "Adoption begins with utility. Your Web3 product must solve a real problem before being revolutionary.",
      },
      {
        id: "entrepreneur-scale",
        title: "Scale",
        description: "Apply to the Launchpad and raise funds via Synaptic DAO",
        mission: "Submit your funding application and present to the DAO",
        duration: "2-3 months",
        xpReward: 300,
        mfaiReward: 30,
        stakingRequired: 100,
        daoVoteRequired: true,
        isLaunchpad: true,
        tools: ["Launchpad Platform", "DAO Funding", "Mentor Network"],
        outcomes: ["Funding obtained", "Team formed", "Validated roadmap"],
        zynoTip:
          "DAO funding isn't just an investment, it's adoption. Your funders become your first ambassadors.",
      },
    ],
  },
  {
    id: "web3-developer",
    name: "web3-developer",
    title: "Web3 Developer",
    description: "Leverage your technical skills in the Proof Economy",
    icon: "⚡",
    color: "from-purple-400 to-pink-500",
    targetProfile: "Developers and technical people familiar with Web3",
    motivation:
      "Build serious products, gain recognition, evolve from solo hacker to protocol architect",
    passType: "Proof-of-Build™ Pass",
    phases: [
      {
        id: "developer-learn",
        title: "Learn",
        description:
          "Master smart contract fundamentals with Rust and Anchor framework",
        mission:
          "Complete Rust/Anchor bootcamp, deploy Hello World, pass technical certification",
        duration: "2-3 weeks",
        xpReward: 75,
        mfaiReward: 12,
        nftReward: "Code Explorer",
        tools: [
          "Solana Development Kit",
          "Rust programming sandbox",
          "Testing framework",
          "AI code assistant",
        ],
        outcomes: [
          "Rust/Anchor proficiency",
          "Deployed smart contract",
          "Technical foundation",
        ],
        zynoTip:
          "Your code isn't just functionality—it's your identity and reputation in the ecosystem.",
        modules: [
          {
            title: "Rust Fundamentals",
            description:
              "Learn Rust programming language basics and memory management",
            deliverable: "Complete Rust exercises and build a simple CLI tool",
            reward: "25 XP",
          },
          {
            title: "Anchor Framework",
            description: "Master Solana smart contract development with Anchor",
            deliverable: "Deploy a Hello World program on Solana testnet",
            reward: "30 XP",
          },
          {
            title: "Testing & Security",
            description: "Learn testing patterns and security best practices",
            deliverable: "Write comprehensive tests for your smart contract",
            reward: "20 XP",
          },
        ],
      },
      {
        id: "developer-build",
        title: "Build",
        description: "Design and implement a functional protocol module",
        mission:
          "Build functional DApp using MFAI SDK, contribute to open source, demonstrate excellence",
        duration: "3-4 weeks",
        xpReward: 150,
        mfaiReward: 15,
        nftReward: "Builder MVP",
        tools: [
          "MFAI SDK",
          "Protocol documentation",
          "Development tools",
          "GitHub integration",
        ],
        outcomes: [
          "Production DApp",
          "Open source contributions",
          "Peer recognition",
        ],
        zynoTip:
          "Great developers write code that works—architects create systems that evolve.",
        modules: [
          {
            title: "Protocol Integration",
            description:
              "Integrate with MFAI protocol and implement core functionality",
            deliverable: "Working DApp with protocol integration",
            reward: "50 XP",
          },
          {
            title: "Frontend Development",
            description:
              "Build user interface with React and Web3 wallet integration",
            deliverable: "Complete frontend with wallet connectivity",
            reward: "50 XP",
          },
          {
            title: "Open Source Contribution",
            description: "Contribute improvements or features to MFAI codebase",
            deliverable: "Merged pull request to MFAI repository",
            reward: "50 XP",
          },
        ],
      },
      {
        id: "developer-prove",
        title: "Prove",
        description:
          "Submit your code for comprehensive audit and DAO validation",
        mission:
          "Submit code for audit, pass security review, receive DAO validation",
        duration: "1-2 weeks",
        xpReward: 200,
        mfaiReward: 20,
        nftReward: "Proof-of-Build™",
        daoVoteRequired: true,
        tools: [
          "Code audit platform",
          "Security scanner",
          "Peer review",
          "Quality metrics",
        ],
        outcomes: [
          "Security audit passed",
          "DAO validation",
          "Technical credibility",
        ],
        zynoTip:
          "An audit isn't judgment—it's validation that transforms your code into a trusted asset.",
        requirements: [
          "Completed DApp from Build phase",
          "Open source repository",
          "Documentation",
        ],
      },
      {
        id: "developer-activate",
        title: "Activate",
        description: "Present at Demo Day and join the Builder DAO",
        mission:
          "Present at Demo Day, join Builder DAO, influence technical decisions",
        duration: "1 week",
        xpReward: 250,
        mfaiReward: 30,
        nftReward: "Builder Council",
        daoVoteRequired: true,
        isIncubation: true,
        tools: [
          "Demo Day platform",
          "Builder DAO",
          "Technical governance",
          "Innovation lab",
        ],
        outcomes: [
          "Demo Day presentation",
          "Builder DAO membership",
          "Technical influence",
        ],
        zynoTip:
          "Demo Day isn't competition—it's celebration of how you're evolving the ecosystem.",
        requirements: [
          "Proof-of-Build™ NFT",
          "Audited code",
          "Community endorsement",
        ],
      },
      {
        id: "developer-scale",
        title: "Scale",
        description: "Join core development team and shape protocol evolution",
        mission:
          "Join core development team, lead technical initiatives, shape protocol evolution",
        duration: "Ongoing",
        xpReward: 300,
        mfaiReward: 40,
        nftReward: "Protocol Architect",
        stakingRequired: 100,
        daoVoteRequired: true,
        isLaunchpad: true,
        tools: [
          "Core development access",
          "Technical leadership",
          "Protocol grants",
          "Innovation fund",
        ],
        outcomes: [
          "Core team membership",
          "Technical leadership",
          "Protocol influence",
        ],
        zynoTip:
          "You no longer build on the protocol—you build the protocol itself.",
        requirements: [
          "Builder Council NFT",
          "Technical leadership demonstration",
          "Community trust",
        ],
      },
    ],
  },
  {
    id: "content-creator",
    name: "content-creator",
    title: "Content Creator",
    description: "Transform your creativity into cognitive publications",
    icon: "🎨",
    color: "from-pink-400 to-purple-500",
    targetProfile:
      "Storytellers, designers, prompt engineers and AI-powered creators",
    motivation:
      "Formalize creative output as verifiable contributions in the MFAI protocol",
    passType: "Cognitive Publisher Pass",
    phases: [
      {
        id: "creator-learn",
        title: "Learn",
        description:
          "Master Web3 visual literacy and understand NFT art economics",
        mission:
          "Study NFT art cases, licensing models, and create your first visual asset",
        duration: "1-2 weeks",
        xpReward: 50,
        mfaiReward: 5,
        nftReward: "Creator Seed",
        tools: [
          "NFT Art Case Studies",
          "CC0 License Guide",
          "Royalty Calculator",
          "Visual Design Tools",
        ],
        outcomes: [
          "NFT art understanding",
          "First visual creation",
          "Licensing knowledge",
        ],
        zynoTip:
          "Your creativity is more than content—it's cognitive capital. Every visual becomes a vector of value.",
        modules: [
          {
            title: "NFT Art Economics",
            description:
              "Understand how NFT art creates value and generates revenue",
            deliverable: "Complete analysis of successful NFT art projects",
            reward: "20 XP",
          },
          {
            title: "Creative Commons & Licensing",
            description:
              "Learn about CC0, commercial licensing, and royalty structures",
            deliverable: "Choose licensing strategy for your creative work",
            reward: "15 XP",
          },
          {
            title: "First Visual Creation",
            description: "Create your first digital asset using design tools",
            deliverable: "Original visual asset ready for tokenization",
            reward: "15 XP",
          },
        ],
      },
      {
        id: "creator-build",
        title: "Build",
        description:
          "Produce a generative art series using AI and creative tools",
        mission:
          "Create and mint a mini collection using AI prompts and generative techniques",
        duration: "2-3 weeks",
        xpReward: 100,
        mfaiReward: 10,
        nftReward: "Creative Stream",
        tools: [
          "AI Prompt Engineering",
          "Generative Art Tools",
          "Collection Builder",
          "Metadata Editor",
        ],
        outcomes: [
          "NFT collection minted",
          "AI art mastery",
          "Creative workflow",
        ],
        zynoTip:
          "In the protocol, every visual is a vector of value. Your generative art becomes infrastructure for creativity.",
        modules: [
          {
            title: "AI Prompt Mastery",
            description:
              "Learn advanced prompt engineering for consistent visual style",
            deliverable: "Master prompt template for your artistic style",
            reward: "30 XP",
          },
          {
            title: "Generative Collection",
            description:
              "Create a cohesive collection of 10 generative art pieces",
            deliverable: "Complete NFT collection with consistent theme",
            reward: "40 XP",
          },
          {
            title: "Metadata & Rarity",
            description: "Design metadata structure and rarity distribution",
            deliverable: "Professional metadata for entire collection",
            reward: "30 XP",
          },
        ],
      },
      {
        id: "creator-prove",
        title: "Prove",
        description:
          "Submit your creative work for DAO validation and mint Proof-of-Creation™",
        mission:
          "Submit portfolio for community review and receive DAO validation",
        duration: "1-2 weeks",
        xpReward: 150,
        mfaiReward: 15,
        nftReward: "Proof-of-Creation™",
        daoVoteRequired: true,
        tools: [
          "Portfolio Submission",
          "DAO Review Process",
          "Creative Validation",
          "Peer Feedback",
        ],
        outcomes: [
          "DAO validation",
          "Proof-of-Creation™ NFT",
          "Creative credibility",
        ],
        zynoTip:
          "Your Proof-of-Creation™ isn't just recognition—it's your creative license in the cognitive economy.",
        requirements: [
          "Creative Stream NFT",
          "Portfolio submission",
          "Community engagement",
        ],
      },
      {
        id: "creator-activate",
        title: "Activate",
        description:
          "Launch community airdrop and build your creative audience",
        mission:
          "Distribute NFTs to community members and activate your creative network",
        duration: "1 week",
        xpReward: 200,
        mfaiReward: 20,
        nftReward: "Cognitive Publisher",
        tools: [
          "Airdrop Platform",
          "Community Builder",
          "Social Distribution",
          "Engagement Analytics",
        ],
        outcomes: [
          "Community airdrop completed",
          "Creative network activated",
          "Publisher status",
        ],
        zynoTip:
          "Distribution is creation. Every airdrop builds the community that values your cognitive capital.",
        requirements: [
          "Proof-of-Creation™ NFT",
          "Community list",
          "Distribution strategy",
        ],
      },
      {
        id: "creator-scale",
        title: "Scale",
        description:
          "Activate passive revenue streams and become a Neuro-Publisher",
        mission:
          "Enable NFT staking, activate royalty streams, and scale creative business",
        duration: "Ongoing",
        xpReward: 250,
        mfaiReward: 25,
        nftReward: "Neuro-Publisher",
        stakingRequired: 50,
        tools: [
          "Revenue Dashboard",
          "NFT Staking",
          "Royalty Streams",
          "Creative Analytics",
        ],
        outcomes: [
          "Passive revenue activated",
          "Neuro-Publisher status",
          "Sustainable creative business",
        ],
        zynoTip:
          "Your creativity now generates autonomous value. Welcome to the cognitive economy where art creates capital.",
        requirements: [
          "Cognitive Publisher NFT",
          "Active community",
          "Revenue model",
        ],
      },
    ],
  },
  {
    id: "community-communicator",
    name: "community-communicator",
    title: "Community Communicator",
    description: "Evolve from community voice to synaptic strategist",
    icon: "🗣️",
    color: "from-orange-400 to-red-500",
    targetProfile: "Natural communicators, educators, or community builders",
    motivation:
      "Move from supporting conversations to orchestrating protocol evolution",
    passType: "The Connector Protocol™",
    phases: [
      {
        id: "communicator-learn",
        title: "Learn",
        description: "Master coordination psychology and protocol narratives",
        mission:
          "Complete communication training and understand governance frameworks",
        duration: "1-2 weeks",
        xpReward: 60,
        mfaiReward: 6,
        nftReward: "Voice Amplifier",
        tools: [
          "Communication Training",
          "Governance Frameworks",
          "Psychology Modules",
        ],
        outcomes: [
          "Communication mastery",
          "Governance understanding",
          "Strategic clarity",
        ],
        zynoTip:
          "Coordination is not management. It's strategy made relational.",
      },
      {
        id: "communicator-build",
        title: "Build",
        description: "Design and coordinate community missions",
        mission:
          "Create and lead community initiatives using coordination tools",
        duration: "2-3 weeks",
        xpReward: 120,
        mfaiReward: 12,
        nftReward: "Mission Curator",
        tools: [
          "Mission Design Tools",
          "Community Coordination",
          "Event Planning",
        ],
        outcomes: [
          "Mission coordination",
          "Community leadership",
          "Strategic influence",
        ],
        zynoTip:
          "Your missions become the paths others will follow. Design with intention.",
      },
      {
        id: "communicator-prove",
        title: "Prove",
        description:
          "Demonstrate strategic coordination and earn community validation",
        mission:
          "Lead successful community initiatives and receive peer recognition",
        duration: "2-3 weeks",
        xpReward: 180,
        mfaiReward: 18,
        nftReward: "Synaptic Coordinator",
        daoVoteRequired: true,
        tools: [
          "Leadership Platform",
          "Community Validation",
          "Impact Metrics",
        ],
        outcomes: [
          "Leadership validation",
          "Community impact",
          "Strategic recognition",
        ],
        zynoTip:
          "Leadership in Web3 is earned through contribution, not appointment.",
      },
      {
        id: "communicator-activate",
        title: "Activate",
        description: "Join governance council and shape protocol communication",
        mission:
          "Participate in protocol governance and influence strategic decisions",
        duration: "1 month",
        xpReward: 240,
        mfaiReward: 24,
        stakingRequired: 75,
        daoVoteRequired: true,
        tools: [
          "Governance Council",
          "Strategic Planning",
          "Protocol Communication",
        ],
        outcomes: [
          "Governance participation",
          "Strategic influence",
          "Protocol voice",
        ],
        zynoTip:
          "Your voice now shapes the collective intelligence of the ecosystem.",
      },
      {
        id: "communicator-scale",
        title: "Scale",
        description: "Become a Synaptic Strategist and protocol mind-shaper",
        mission:
          "Lead protocol evolution and coordinate ecosystem-wide initiatives",
        duration: "Ongoing",
        xpReward: 300,
        mfaiReward: 30,
        stakingRequired: 100,
        tools: [
          "Protocol Leadership",
          "Ecosystem Coordination",
          "Strategic Vision",
        ],
        outcomes: [
          "Protocol leadership",
          "Ecosystem influence",
          "Strategic authority",
        ],
        zynoTip:
          "You now orchestrate the protocol's evolution. Your coordination becomes the ecosystem's nervous system.",
      },
    ],
  },
  {
    id: "project-manager",
    name: "project-manager",
    title: "Project Manager",
    description: "Evolve from project manager to Mission Commander™",
    icon: "🎯",
    color: "from-indigo-400 to-blue-500",
    targetProfile:
      "Mission orchestrators, system thinkers, PMs, product strategists",
    motivation:
      "Transform operational fluency into protocol-native mission design power",
    passType: "The Operator Protocol™",
    phases: [
      {
        id: "manager-learn",
        title: "Learn",
        description: "Map your operational DNA and understand mission design",
        mission:
          "Complete AEPO™ assessment and learn mission orchestration principles",
        duration: "1-2 weeks",
        xpReward: 70,
        mfaiReward: 7,
        nftReward: "Ops Catalyst",
        tools: [
          "AEPO™ Assessment",
          "Mission Design Framework",
          "Operational Psychology",
        ],
        outcomes: [
          "Operational DNA mapped",
          "Mission design understanding",
          "Strategic clarity",
        ],
        zynoTip:
          "You don't just manage tasks. You activate systems that deliver real outcomes.",
      },
      {
        id: "manager-build",
        title: "Build",
        description: "Design and implement your first mission flow",
        mission: "Create a multi-phase mission and coordinate team execution",
        duration: "2-3 weeks",
        xpReward: 140,
        mfaiReward: 14,
        nftReward: "Mission Designer",
        tools: [
          "Mission Flow Builder",
          "Team Coordination",
          "Execution Tracking",
        ],
        outcomes: [
          "Mission flow designed",
          "Team coordination",
          "Execution mastery",
        ],
        zynoTip:
          "Your mission design becomes the infrastructure others use to create value.",
      },
      {
        id: "manager-prove",
        title: "Prove",
        description:
          "Demonstrate orchestration mastery and earn Proof-of-Orchestration™",
        mission: "Successfully coordinate complex multi-team initiatives",
        duration: "3-4 weeks",
        xpReward: 210,
        mfaiReward: 21,
        nftReward: "Proof-of-Orchestration™",
        daoVoteRequired: true,
        tools: [
          "Multi-team Coordination",
          "Performance Analytics",
          "Impact Measurement",
        ],
        outcomes: [
          "Orchestration mastery",
          "Multi-team success",
          "Proven impact",
        ],
        zynoTip:
          "Proof-of-Orchestration™ validates your ability to turn chaos into coordinated value creation.",
      },
      {
        id: "manager-activate",
        title: "Activate",
        description:
          "Launch Meta-Mission protocols and coordinate ecosystem operations",
        mission: "Design and execute ecosystem-wide operational initiatives",
        duration: "1-2 months",
        xpReward: 280,
        mfaiReward: 28,
        stakingRequired: 100,
        isIncubation: true,
        tools: [
          "Meta-Mission Platform",
          "Ecosystem Coordination",
          "Operational Intelligence",
        ],
        outcomes: [
          "Meta-mission launched",
          "Ecosystem coordination",
          "Operational leadership",
        ],
        zynoTip:
          "Meta-missions coordinate the coordination. You're now orchestrating the orchestrators.",
      },
      {
        id: "manager-scale",
        title: "Scale",
        description:
          "Join Mission Design Council and shape protocol operations",
        mission:
          "Influence protocol operational evolution and design future missions",
        duration: "Ongoing",
        xpReward: 350,
        mfaiReward: 35,
        stakingRequired: 150,
        isLaunchpad: true,
        tools: [
          "Mission Design Council",
          "Protocol Operations",
          "Strategic Architecture",
        ],
        outcomes: [
          "Council membership",
          "Protocol influence",
          "Operational authority",
        ],
        zynoTip:
          "In a decentralized world, operations isn't back office. It's the engine of collective sovereignty.",
      },
    ],
  },
  {
    id: "defi-explorer",
    name: "defi-explorer",
    title: "DeFi Explorer",
    description: "Master decentralized finance and become a yield strategist",
    icon: "📊",
    color: "from-cyan-400 to-blue-500",
    targetProfile:
      "Investors, traders, and finance enthusiasts curious about DeFi protocols",
    motivation:
      "Understand yield farming, manage risk, and earn Proof-of-Yield™ certification",
    passType: "DeFi Validator Pass",
    phases: [
      {
        id: "defi-learn",
        title: "Learn",
        description:
          "Understand DeFi fundamentals, yield farming, and liquidity pools",
        mission:
          "Complete DeFi 101 course, understand yield mechanics, activate testnet faucet",
        duration: "1-2 weeks",
        xpReward: 50,
        mfaiReward: 5,
        nftReward: "DeFi Learner",
        tools: [
          "DeFi Academy",
          "Yield Calculator",
          "Risk Assessment",
          "Zyno DeFi Guide",
        ],
        outcomes: [
          "DeFi protocol understanding",
          "Yield farming basics",
          "Risk awareness",
        ],
        zynoTip:
          "You don't just hold crypto. You validate, stake, and compound your knowledge into on-chain returns — the DeFi way.",
      },
      {
        id: "defi-build",
        title: "Build",
        description: "Provide liquidity and participate in yield farming",
        mission:
          "Add liquidity to pools, stake tokens, experience DeFi protocols firsthand",
        duration: "2-3 weeks",
        xpReward: 100,
        mfaiReward: 10,
        nftReward: "Liquidity Pilot",
        tools: [
          "Liquidity Pool Simulator",
          "Staking Platform",
          "Yield Tracker",
          "Impermanent Loss Calculator",
        ],
        outcomes: ["Liquidity provided", "Staking experience", "Yield earned"],
        zynoTip:
          "Liquidity providing isn't just parking tokens—you're becoming the infrastructure that powers DeFi.",
      },
      {
        id: "defi-prove",
        title: "Prove",
        description:
          "Demonstrate yield optimization and risk management skills",
        mission:
          "Optimize yield strategies, manage portfolio risk, earn Proof-of-Yield™",
        duration: "2-3 weeks",
        xpReward: 150,
        mfaiReward: 15,
        nftReward: "Proof-of-Yield™",
        tools: [
          "Portfolio Optimizer",
          "Risk Management",
          "Yield Strategies",
          "Performance Analytics",
        ],
        outcomes: [
          "Optimized portfolio",
          "Risk management",
          "Yield certification",
        ],
        zynoTip:
          "Your Proof-of-Yield™ demonstrates mastery over the complex dance of risk and reward in DeFi.",
      },
      {
        id: "defi-activate",
        title: "Activate",
        description: "Participate in DeFi governance and protocol decisions",
        mission:
          "Vote on yield proposals, participate in protocol governance, influence DeFi evolution",
        duration: "1 month",
        xpReward: 200,
        mfaiReward: 20,
        stakingRequired: 50,
        daoVoteRequired: true,
        tools: [
          "Governance Platform",
          "Proposal System",
          "Voting Interface",
          "Protocol Analytics",
        ],
        outcomes: [
          "Governance participation",
          "Protocol influence",
          "DeFi leadership",
        ],
        zynoTip:
          "Your vote shapes the future of DeFi. You're not just using protocols—you're governing them.",
      },
      {
        id: "defi-scale",
        title: "Scale",
        description:
          "Master advanced DeFi strategies and achieve compounding mastery",
        mission:
          "Implement auto-compounding, share strategies, become a DeFi Validator",
        duration: "Ongoing",
        xpReward: 250,
        mfaiReward: 25,
        stakingRequired: 100,
        tools: [
          "Auto-Compound Engine",
          "Strategy Sharing",
          "DeFi Analytics",
          "Validator Dashboard",
        ],
        outcomes: [
          "Compounding mastery",
          "Strategy expertise",
          "DeFi Validator status",
        ],
        zynoTip:
          "Compounding isn't just about returns—it's about building sustainable wealth through disciplined DeFi mastery.",
      },
    ],
  },
  {
    id: "nft-creator",
    name: "nft-creator",
    title: "NFT Creator",
    description: "Master NFT creation, minting and collection management",
    icon: "🖼️",
    color: "from-pink-400 to-orange-500",
    targetProfile:
      "Artists, designers, and creators looking to tokenize their work",
    motivation:
      "Create, mint, and commercialize NFT collections with royalties and community",
    passType: "NFT Pioneer Pass",
    phases: [
      {
        id: "nft-learn",
        title: "Learn",
        description:
          "Master the NFT ecosystem fundamentals and market dynamics",
        mission:
          "Study successful NFT projects, understand marketplaces, and create your first mintable visual",
        duration: "1-2 weeks",
        xpReward: 50,
        mfaiReward: 5,
        nftReward: "Design Starter",
        tools: [
          "NFT Case Studies",
          "Marketplace Analysis",
          "Design Tools",
          "Metaverse Exploration",
        ],
        outcomes: [
          "NFT ecosystem understanding",
          "First mintable design",
          "Market knowledge",
        ],
        zynoTip:
          "Your designs become immutable proofs of your creativity — tokenised, licensed, rewarded, and unstoppable.",
        modules: [
          {
            title: "NFT Fundamentals",
            description:
              "Understand NFT technology, standards, and marketplaces",
            deliverable: "Complete NFT ecosystem analysis",
            reward: "15 XP",
          },
          {
            title: "Digital Art Foundations",
            description: "Learn digital art creation for NFT collections",
            deliverable: "Create your first mintable visual",
            reward: "20 XP",
          },
          {
            title: "Marketplace Strategy",
            description: "Analyze successful NFT projects and market dynamics",
            deliverable: "Market analysis report",
            reward: "15 XP",
          },
        ],
      },
      {
        id: "nft-build",
        title: "Build",
        description: "Create a cohesive NFT collection with proper metadata",
        mission:
          "Design a mini-series of NFTs with consistent theme and mint on testnet",
        duration: "2-3 weeks",
        xpReward: 100,
        mfaiReward: 10,
        nftReward: "Drop Ready",
        tools: [
          "Collection Builder",
          "Metadata Editor",
          "Rarity Tools",
          "Minting Interface",
        ],
        outcomes: [
          "Complete NFT collection",
          "Proper metadata",
          "Testnet minting",
        ],
        zynoTip:
          "A collection isn't just multiple pieces—it's a cohesive narrative that builds value through scarcity and community.",
        modules: [
          {
            title: "Collection Design",
            description:
              "Create a cohesive series with consistent theme and style",
            deliverable: "Complete NFT collection (5-10 pieces)",
            reward: "35 XP",
          },
          {
            title: "Metadata & Rarity",
            description: "Structure metadata and implement rarity distribution",
            deliverable: "Complete metadata for collection",
            reward: "30 XP",
          },
          {
            title: "Testnet Minting",
            description: "Mint your collection on Solana testnet",
            deliverable: "Minted NFT collection",
            reward: "35 XP",
          },
        ],
      },
      {
        id: "nft-prove",
        title: "Prove",
        description:
          "Receive community validation and mint your Proof-of-Design™ NFT",
        mission:
          "Submit your collection for DAO review and receive feedback on licensing and commercialization",
        duration: "1-2 weeks",
        xpReward: 150,
        mfaiReward: 15,
        nftReward: "Proof-of-Design™",
        daoVoteRequired: true,
        tools: [
          "DAO Review Board",
          "Licensing Framework",
          "Community Feedback",
          "Validation Metrics",
        ],
        outcomes: [
          "Community validation",
          "Proof-of-Design™ NFT",
          "Licensing strategy",
        ],
        zynoTip:
          "Validation transforms your art from personal expression to community-recognized value.",
        requirements: [
          "Complete NFT collection",
          "Proper metadata",
          "Testnet deployment",
        ],
      },
      {
        id: "nft-activate",
        title: "Activate",
        description: "Launch community mint and build your collector base",
        mission: "Distribute NFTs to early supporters and build your community",
        duration: "1-2 weeks",
        xpReward: 200,
        mfaiReward: 20,
        nftReward: "NFT Pioneer",
        tools: [
          "Airdrop Tool",
          "Community Builder",
          "Marketing Templates",
          "Engagement Tracker",
        ],
        outcomes: [
          "Successful distribution",
          "Community growth",
          "Market presence",
        ],
        zynoTip:
          "Your collectors aren't just buyers—they're stakeholders in your creative journey.",
        requirements: [
          "Proof-of-Design™ NFT",
          "Marketing strategy",
          "Community plan",
        ],
      },
      {
        id: "nft-scale",
        title: "Scale",
        description:
          "Establish sustainable royalty streams and scale your NFT business",
        mission:
          "Implement royalty system, track revenue, and develop sustainable NFT business",
        duration: "Ongoing",
        xpReward: 250,
        mfaiReward: 25,
        stakingRequired: 50,
        tools: [
          "Royalty Dashboard",
          "Analytics Platform",
          "Secondary Market Tracker",
          "Business Planning",
        ],
        outcomes: [
          "Royalty system",
          "Sustainable revenue",
          "Scaled NFT business",
        ],
        zynoTip:
          "Royalties aren't just passive income—they're proof that your creativity generates perpetual value.",
        requirements: [
          "Active collection",
          "Community engagement",
          "Business model",
        ],
      },
    ],
  },
  {
    id: "investor",
    name: "investor",
    title: "Investor",
    description:
      "Master capital allocation and earn Proof-of-Invest™ certification",
    icon: "💰",
    color: "from-green-400 to-gold-500",
    targetProfile: "Investors, capital allocators, and financial strategists",
    motivation:
      "Evaluate projects, participate in governance, and generate sustainable returns",
    passType: "Proof-of-Invest™ Pass",
    phases: [
      {
        id: "investor-learn",
        title: "Learn",
        description: "Master due diligence and project evaluation frameworks",
        mission:
          "Study pitch decks, complete scorecard analysis, and understand investment criteria",
        duration: "1-2 weeks",
        xpReward: 50,
        mfaiReward: 5,
        nftReward: "Investor Learner",
        tools: [
          "Zyno Analysis Template",
          "Investment Scorecard",
          "Risk Assessment Framework",
          "Project Evaluation Guide",
        ],
        outcomes: [
          "Due diligence mastery",
          "Evaluation framework",
          "Risk assessment skills",
        ],
        zynoTip:
          "Capital works harder when it works together. Your stake is your voice — your conviction creates collective value.",
        modules: [
          {
            title: "Due Diligence Fundamentals",
            description: "Learn systematic project evaluation techniques",
            deliverable: "Complete investment analysis framework",
            reward: "20 XP",
          },
          {
            title: "Risk Assessment",
            description: "Master risk evaluation and mitigation strategies",
            deliverable: "Risk assessment scorecard",
            reward: "15 XP",
          },
          {
            title: "Web3 Investment Criteria",
            description: "Understand unique aspects of Web3 project evaluation",
            deliverable: "Web3 investment criteria checklist",
            reward: "15 XP",
          },
        ],
      },
      {
        id: "investor-build",
        title: "Build",
        description:
          "Participate in pitch evaluations and validate project potential",
        mission:
          "Review and vote on project pitches, provide constructive feedback",
        duration: "2-3 weeks",
        xpReward: 100,
        mfaiReward: 10,
        nftReward: "Pitch Validator",
        tools: [
          "DAO Board Simulator",
          "Pitch Evaluation Platform",
          "Feedback System",
          "Voting Mechanism",
        ],
        outcomes: [
          "Pitch validation experience",
          "Feedback expertise",
          "Evaluation credibility",
        ],
        zynoTip:
          "Your evaluation isn't just an opinion—it's a signal that shapes collective intelligence about value.",
        modules: [
          {
            title: "Pitch Analysis",
            description:
              "Evaluate real project pitches using structured framework",
            deliverable: "Complete pitch evaluations with feedback",
            reward: "35 XP",
          },
          {
            title: "Constructive Feedback",
            description: "Provide valuable feedback to project founders",
            deliverable: "Detailed feedback reports",
            reward: "30 XP",
          },
          {
            title: "Collective Intelligence",
            description:
              "Participate in group evaluation and consensus building",
            deliverable: "Collaborative decision-making",
            reward: "35 XP",
          },
        ],
      },
      {
        id: "investor-prove",
        title: "Prove",
        description:
          "Demonstrate investment acumen through staking and portfolio management",
        mission:
          "Stake tokens, manage simulated portfolio, and earn Proof-of-Invest™ certification",
        duration: "2-3 weeks",
        xpReward: 150,
        mfaiReward: 15,
        nftReward: "Proof-of-Invest™",
        stakingRequired: 50,
        tools: [
          "Staking Dashboard",
          "Portfolio Simulator",
          "ROI Calculator",
          "Risk Management Tools",
        ],
        outcomes: [
          "Staking experience",
          "Portfolio management",
          "Investment certification",
        ],
        zynoTip:
          "Your Proof-of-Invest™ isn't just a badge—it's validation of your capital allocation wisdom.",
        requirements: [
          "Completed pitch evaluations",
          "Staking minimum",
          "Investment strategy",
        ],
      },
      {
        id: "investor-activate",
        title: "Activate",
        description:
          "Join the Investment Council and influence protocol funding decisions",
        mission:
          "Participate in investment committee, vote on funding allocations, shape investment strategy",
        duration: "1 month",
        xpReward: 200,
        mfaiReward: 20,
        stakingRequired: 75,
        daoVoteRequired: true,
        tools: [
          "Investment Committee Platform",
          "Governance Voting",
          "Treasury Management",
          "Strategic Planning",
        ],
        outcomes: [
          "Council membership",
          "Funding influence",
          "Strategic impact",
        ],
        zynoTip:
          "Your capital allocation decisions now shape the protocol's future. You're not just investing—you're architecting.",
        requirements: [
          "Proof-of-Invest™ NFT",
          "Active participation",
          "Investment expertise",
        ],
      },
      {
        id: "investor-scale",
        title: "Scale",
        description:
          "Unlock Neuro-Dividends™ and become a strategic capital partner",
        mission:
          "Optimize staking strategy, earn passive income, and guide protocol investment strategy",
        duration: "Ongoing",
        xpReward: 250,
        mfaiReward: 25,
        stakingRequired: 100,
        tools: [
          "Neuro-Dividends™ Dashboard",
          "Advanced Staking",
          "Strategic Advisory",
          "Investment Analytics",
        ],
        outcomes: [
          "Passive income streams",
          "Strategic influence",
          "Capital partner status",
        ],
        zynoTip:
          "Your conviction now generates dividends. Welcome to the cognitive economy where aligned capital creates compounding value.",
        requirements: [
          "Investment Council membership",
          "Significant stake",
          "Strategic contributions",
        ],
      },
    ],
  },
];
