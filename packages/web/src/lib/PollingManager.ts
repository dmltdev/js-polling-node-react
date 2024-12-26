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
