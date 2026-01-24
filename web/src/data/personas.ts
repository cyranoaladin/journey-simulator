export interface Persona {
  id: string
  name: string
  description: string
  avatar?: string
  traits: string[]
}

export const personas: Persona[] = [
  {
    id: 'p-1',
    name: 'Technomancer',
    description: 'Master of backend logic and distributed systems.',
    traits: ['Logical', 'Precise', 'Efficient'],
  },
  {
    id: 'p-2',
    name: 'Design Oracle',
    description: 'Visionary of user experience and aesthetics.',
    traits: ['Creative', 'Empathetic', 'Detail-oriented'],
  },
]
