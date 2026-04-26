import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";

export const PORT = 8000;

export async function startServer({ port = PORT } = {}) {
  const app = await createApp();

  console.log(`Server is running on port ${port}`);
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
  startServer();
}
