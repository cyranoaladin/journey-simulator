/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import type { Meta, StoryObj } from '@storybook/react';
import MissionFeedbackSummary, { MissionSummary } from './MissionFeedbackSummary';

const meta: Meta<typeof MissionFeedbackSummary> = {
  title: 'Zyno/MissionFeedbackSummary',
  component: MissionFeedbackSummary,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

type Story = StoryObj<typeof MissionFeedbackSummary>;

const baseSummary: MissionSummary = {
  userId: 'demo_user',
  timestamp: new Date('2025-05-01T10:00:00Z').toISOString(),
  aepoScore: 82,
  aecoPhase: 'launch_dao',
  agents: ['DAOArchitect', 'ComplianceExpert', 'GrowthNavigator'],
  generatedText: ' DAOArchitect  Governance validated\n ComplianceExpert  Checklist ready\n GrowthNavigator  Launch strategy in progress',
  title: 'Mission Launch DAO',
  actions: ['Publier le whitepaper', 'Programmer le vote communautaire']
};

export const Default: Story = {
  args: {
    summary: baseSummary
  }
};

export const MissingSummary: Story = {
  args: {
    summary: null
  }
};
