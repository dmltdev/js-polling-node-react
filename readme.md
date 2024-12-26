# Data polling

This is a minimal example of data polling with Node.js and React.js
- Node.js, using Express.js, exposes GET API endpoint `api/polling` that returns a simple interface
```ts
{
  message: "Hello world",
  timestamp: new Date().toISOString(),
}
```
- React.js, using native hooks and a polling manager, polls the endpoint and updates the UI

## How to test it

- Clone a repo
- Run `npm install` in both `packages/server` and `packages/web`
- Run `npm run dev` in `packages/server`
- Run `npm run dev` in `packages/web`
- Open `http://localhost:5173` in your browser

## Polling Manager

```ts
interface PollingManagerOptions<T> {
  interval?: number;
  pollingUrl: string;
  onData: (data: T) => void;
}

export class PollingManager<T> {
  private controller: AbortController;
  private interval: number;
  private pollingUrl: string;
  private onData: (data: T) => void;
  private isPolling: boolean = false;

  constructor(options: PollingManagerOptions<T>) {
    this.controller = new AbortController();
    this.interval = options.interval || 1000;
    this.pollingUrl = options.pollingUrl;
    this.onData = options.onData;
    this.start(); // Auto-start
  }

  async start() {
    if (this.isPolling) return;
    this.isPolling = true;

    while (!this.controller.signal.aborted) {
      const startTime = Date.now();

      try {
        const response = await fetch(this.pollingUrl, {
          signal: this.controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        this.onData(data);

        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, this.interval - elapsed);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Polling stopped");
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : JSON.stringify(error);
        console.error("Polling error:", errorMessage);

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, this.interval));
      }
    }
  }

  stop() {
    this.isPolling = false;
    this.controller.abort();
  }
}
```

## Polling with React.js (native)

```tsx
import { useEffect, useState } from "react";
import { PollingManager } from "../lib/PollingManager";

type PollingData = {
  message: string;
  timestamp: string;
};

export function PollingReader() {
  const [pollData, setPollData] = useState<PollingData | null>(null);

  useEffect(() => {
    const poller = new PollingManager<{ message: string; timestamp: string }>({
      pollingUrl: import.meta.env.VITE_POLLING_URL,
      onData: (data) => {
        setPollData(data);
      },
      interval: 5000,
    });

    return () => {
      poller.stop();
    };
  }, []);

  if (!pollData) {
    return <div>Polling...</div>;
  }

  return (
    <pre>
      <p>Message: {pollData.message}</p>
      <p>Timestamp: {pollData.timestamp}</p>
    </pre>
  );
}
```
