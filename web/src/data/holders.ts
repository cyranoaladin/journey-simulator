export interface Holder {
    id: string;
    name: string;
    role: string;
    since: string;
    avatar?: string;
    status: 'active' | 'inactive';
}

export const holders: Holder[] = [
    {
        id: 'h-1',
        name: 'Alice Validator',
        role: 'Validator',
        since: '2024-01-15',
        status: 'active'
    },
    {
        id: 'h-2',
        name: 'Bob Builder',
        role: 'Developer',
        since: '2024-02-01',
        status: 'active'
    }
];
