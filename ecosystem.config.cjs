const FRONTEND_PORT = process.env.FRONTEND_PORT || '5173'
const NEXT_PORT = process.env.NEXT_PORT || '3001'
const BACKEND_PORT = process.env.BACKEND_PORT || '3000'

module.exports = {
  apps: [
    {
      name: 'mf-backend',
      cwd: './mf-back',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: BACKEND_PORT,
      },
      max_restarts: 5,
      restart_delay: 4000,
    },
    {
      name: 'mf-next',
      cwd: './web',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: NEXT_PORT,
      },
      max_restarts: 5,
      restart_delay: 4000,
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'mf-journey-preview',
      cwd: './journey-simulator',
      script: 'npm',
      args: ['run', 'preview', '--', '--host', '0.0.0.0', '--port', FRONTEND_PORT],
      env: {
        NODE_ENV: 'production',
      },
      max_restarts: 5,
      restart_delay: 4000,
    },
  ],
}
