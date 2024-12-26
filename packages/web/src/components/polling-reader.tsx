import { useEffect, useState } from "react";
import { PollingManager } from "../lib/PollingManager";
import styles from "./polling-reader.module.css";

type PollingData = {
  message: string;
  timestamp: string;
};

export function PollingReader() {
  const [pollingHistory, setPollingHistory] = useState<PollingData[]>([]);
  const [pollData, setPollData] = useState<PollingData | null>(null);

  useEffect(() => {
    const poller = new PollingManager<{ message: string; timestamp: string }>({
      pollingUrl: "http://localhost:3000/api/polling", // import.meta.env.VITE_POLLING_URL
      onData: (data) => {
        setPollData(data);
        setPollingHistory((prev) => [...prev, data]);
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
    <div className={styles.pollingReader}>
      <h1>Polling Reader</h1>
      <div className={styles.pollingReaderMessage}>
        <>The most recent message</>
        <pre>
          <p>Message: {pollData.message}</p>
          <p>Timestamp: {pollData.timestamp}</p>
        </pre>
      </div>

      <div>
        <h2>Polling History</h2>
        <ul className={styles.pollingReaderHistory}>
          {pollingHistory.map((item, index) => (
            <li key={item.timestamp}>
              <p>Message: {item.message}</p>
              <p>Timestamp: {item.timestamp}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
