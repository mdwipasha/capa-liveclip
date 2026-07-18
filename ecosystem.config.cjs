module.exports = {
  apps: [
    {
      name: "liveclip-web",
      script: "npm",
      args: "run start:web",
      env: {
        PORT: "3000",
        NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:4000"
      }
    },
    {
      name: "liveclip-api",
      script: "npm",
      args: "run dev:api",
      env: {
        API_HOST: "127.0.0.1",
        API_PORT: "4000",
        DATABASE_URL: "file:local.db"
      }
    },
    {
      name: "liveclip-worker",
      script: "npm",
      args: "run dev:worker",
      env: {
        DATABASE_URL: "file:local.db",
        QUEUE_ADAPTER: "inline"
      }
    }
  ]
};
