# Money Factory AI Journey Simulator - Platform Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [User Experience](#user-experience)
4. [Business Logic](#business-logic)
5. [AI Integration](#ai-integration)
6. [Web3 Features](#web3-features)
7. [User Workflow](#user-workflow)
8. [Technical Implementation](#technical-implementation)

## Overview

Money Factory AI Journey Simulator is a comprehensive Web3 education and skill validation platform that combines AI-powered learning with blockchain-based credentialing. The platform enables users to progress through specialized learning paths, earn verifiable credentials, and participate in decentralized governance while building real-world blockchain applications.

### Core Components
- **Frontend**: React/Vite journey simulator application with interactive UI components
- **Backend**: Express.js API with MongoDB database for user management and progress tracking
- **Web Portal**: Next.js companion portal with Solana minting, admin tooling, and server-rendered flows
- **AI Orchestration**: Zyno cognitive orchestrator with specialized agents

## Architecture

### Frontend Stack (`journey-simulator/`)
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand for journey and user progress
- **Wallet Integration**: Solana wallet-adapter with Phantom/Solflare support
- **UI Library**: Custom components with Framer Motion animations
- **Routing**: React Router for navigation

### Backend Stack (`mf-back/`)
- **Framework**: Express.js with Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with refresh tokens
- **AI Integration**: OpenAI GPT-5.1 integration for agent orchestration
- **API**: RESTful endpoints with proper authentication

### Web Portal Stack (`web/`)
- **Framework**: Next.js 14 with TypeScript
- **Database**: Prisma ORM with SQLite
- **Solana Integration**: Metaplex SDK for NFT minting
- **API**: App Router with route handlers

## User Experience

### Personas & Tracks
The platform offers six strategic personas, each with specialized learning paths:

1. **Cognitive Activation Hub**: Foundations of Web3 and Solana
2. **Capital Foundry**: Solana DeFi infrastructure and protocols
3. **System Architect**: Decentralized infrastructure and DePIN networks
4. **Experience Studio**: NFT economies and user experience design
5. **Impact Engine**: DAO governance and social impact protocols
6. **Resilience Master**: Security and system resiliency

### Phase Structure
Each persona follows the five-phase methodology:
- **Learn**: Establish foundational knowledge and mindset
- **Build**: Develop practical skills and create outputs
- **Prove**: Validate knowledge through practical application
- **Activate**: Deploy and activate community participation
- **Scale**: Scale solutions and expand governance

### UI Blocks System
The platform uses a dynamic UI block system orchestrated by Zyno:
- **Text Blocks**: Educational content and explanations
- **Quiz Blocks**: Knowledge validation with immediate feedback
- **Mission Blocks**: Practical tasks with XP rewards
- **Resource Blocks**: Educational materials and tools
- **Evaluation Blocks**: Multi-axis scoring and feedback
- **Action Suggestions**: Next step recommendations
- **XP Blocks**: Progress tracking and achievement display
- **DAO Blocks**: Governance simulation and voting

## Business Logic

### XP and Token Economy
- **XP Calculation**: Global score (0-10) * 10 = XP reward (e.g., 8.5/10 = 85 XP)
- **NFT Eligibility**: Score ≥ 8.0/10 grants eligibility for Proof-of-Skill™ NFT
- **$MFAI Tokens**: Earned through phase completion and mission success
- **Staking Mechanics**: $MFAI staking increases voting power (Voting Power Delta = amount * 2)

### Progress Tracking
- **User Progress**: XP, completed phases, NFT certificates, token transactions
- **Phase Completion**: Tracked through multi-axis evaluation
- **Persona Management**: Switch between different learning tracks
- **Subscription Tiers**: Free → Gold → Platinum → Diamond access levels

### Validation System
- **Multi-Axis Evaluation**: Each submission evaluated across multiple criteria
- **Score Thresholds**: Minimum scores required for NFT eligibility
- **Real-time Feedback**: Immediate evaluation after mission completion

## AI Integration

### Zyno Orchestrator
- **Role**: Cognitive orchestrator that coordinates specialized agents
- **Function**: Analyzes user journey state and decides UI blocks to display
- **Integration**: Uses GPT-5.1 Responses API with structured outputs
- **Personalization**: Adapts content to user's persona, track, phase, and level

### Specialized Agents
- **Tokenomics Agent**: Evaluates token economy designs
- **Governance Agent**: Handles DAO structure evaluations
- **Security Agent**: Assesses system security and vulnerabilities
- **Design Agent**: Reviews user experience and interface designs
- **Protocol Agent**: Evaluates technical architecture and implementation
- **Guide Agent**: Provides orientation and journey guidance
- **Onboarding Agent**: Manages user setup and wallet connection
- **Builder Agent**: Mentors on technical implementation and coding
- **Dev Agent**: Assists with general Web3 development tasks
- **Product Agent**: Advises on product strategy and roadmap
- **NFT Agent**: Specializes in NFT collection design and minting
- **Token Agent**: Guides SPL token creation and management
- **DAO Agent**: Architect for decentralized organizations
- **Community Agent**: Strategizes community growth and engagement
- **Pitch Agent**: Coaches on fundraising and pitch decks
- **Investor Agent**: Simulates VC/Angel investor feedback
- **Web3 Legal Agent**: Navigates regulatory compliance
- **Audit Agent**: Performs smart contract security audits
- **Coach Agent**: Supports personal development and leadership
- **Reflection Agent**: Facilitates retrospectives and learning consolidation
- **Launchpad Agent**: Manages go-to-market and launch strategies

### AI Interaction Flow
1. User sends input (mission submission, question, etc.)
2. Zyno orchestrator analyzes context and current state
3. Appropriate specialized agent is selected and invoked
4. Agent generates structured response with UI blocks
5. Response is validated and rendered in frontend
6. User progress and XP are updated accordingly

## Web3 Features

### Wallet Integration
- **Supported Wallets**: Phantom, Solflare, Torus
- **Network**: Solana devnet for test interactions
- **Connection**: SIWS (Sign-In With Solana) authentication
- **Balance Tracking**: Real-time SOL balance display

### NFT Minting
- **Proof-of-Skill™ System**: Achievement-based NFTs for completed phases
- **Minting Process**: Solana devnet transactions with simulation
- **Metadata**: Dynamic metadata generation based on achievement
- **Verification**: Blockchain verification of minted NFTs

### Staking & DAO
- **Staking Simulation**: $MFAI token staking with voting power calculation
- **DAO Governance**: Proposal creation, voting, and execution simulation
- **Voting Power**: Calculated based on staked tokens and participation
- **Neuro-Dividends™**: Staking rewards system

### Solana Devnet
- **Transaction Simulation**: Dry-run for minting and governance actions
- **Explorer Integration**: Direct links to Solana Explorer for transaction verification
- **Account Management**: Wallet address storage and transaction history

## User Workflow

### Onboarding Process
1. **Landing**: User visits the platform and connects their Solana wallet
2. **Authentication**: Register or login with email/wallet combination
3. **Persona Selection**: Choose from six specialized learning tracks
4. **Dashboard Access**: Personalized dashboard with progress tracking
5. **First Phase**: Begin with track-specific Learn phase

### Learning Journey
1. **Phase Introduction**: Overview of current phase objectives and deliverables
2. **Interactive Content**: UI blocks provide educational content and activities
3. **Mission Completion**: Submit assignments for AI evaluation
4. **Evaluation**: Receive score, feedback, and multi-axis analysis
5. **Rewards**: Earn XP and potentially NFT certificates
6. **Progression**: Advance to next phase with cumulative rewards

### Advanced Features
1. **Staking**: Participate in $MFAI token staking for increased voting power
2. **DAO Participation**: Vote on governance proposals and community decisions
3. **NFT Collection**: Collect and showcase Proof-of-Skill™ certificates
4. **Community Interaction**: Share achievements and engage with other users

### Completion Flow
1. **Phase Completion**: Complete all 5 phases in chosen persona track
2. **Certificate Achievement**: Receive completion certificate for the track
3. **Advanced Access**: Gain access to incubation and launchpad features
4. **Higher Tiers**: Unlock Gold/Platinum/Diamond access levels
5. **Ongoing Engagement**: Continue participating in DAO governance and earning rewards

## Technical Implementation

### API Architecture
- **RESTful Endpoints**: Standard HTTP methods with proper authentication
- **Authentication**: JWT tokens with refresh token rotation
- **Rate Limiting**: Protection against abuse and excessive requests
- **Error Handling**: Comprehensive error responses with correlation IDs

### Database Schema
- **User Model**: Profile, wallet address, persona, progress, tokens
- **Journey Model**: User progress, completed phases, current state
- **Mission Submission Model**: Mission results, scores, XP rewards, NFT eligibility
- **NFT Certificate Model**: Minted NFTs and associated metadata

### Security Features
- **Input Validation**: All user inputs validated and sanitized
- **Rate Limiting**: Protection against API abuse
- **CORS Policy**: Restrictive cross-origin policies
- **JWT Implementation**: Secure token generation and validation
- **Wallet Verification**: Solana transaction verification

### Frontend Implementation
- **Component Architecture**: Modular, reusable UI components
- **State Management**: Zustand stores for user progress and journey state
- **Animation**: Framer Motion for smooth transitions and interactions
- **Responsive Design**: Mobile-first approach with responsive layouts

This comprehensive platform combines cutting-edge AI technology with Web3 infrastructure to create an immersive, gamified learning experience that validates real-world skills through blockchain credentials and decentralized governance participation.