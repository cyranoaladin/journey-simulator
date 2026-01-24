export interface Proof {
  id: string
  title: string
  description: string
  date: string
  verified: boolean
}

export const proofsData: Proof[] = [
  {
    id: 'pr-1',
    title: 'Zero Knowledge Auth',
    description: 'Demonstrated ZK-SNARKs login flow.',
    date: '2024-03-10',
    verified: true,
  },
  {
    id: 'pr-2',
    title: 'Optimistic Rollup',
    description: 'Implemented layer 2 scaling solution.',
    date: '2024-04-05',
    verified: false,
  },
]
