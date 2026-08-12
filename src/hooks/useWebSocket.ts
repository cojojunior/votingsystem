// src/hooks/useWebSocket.ts
import { useState, useEffect, useCallback, useRef } from "react";
import WebSocketService from "../services/websocket.service";

type WebSocketEvent = {
  table: string;
  event: string;
  payload: any;
};

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null);
  const [messages, setMessages] = useState<WebSocketEvent[]>([]);
  const subscriptions = useRef<Map<string, (payload: any) => void>>(new Map());
  const unsubscribeFunctions = useRef<Map<string, () => void>>(new Map());

  // Connect to WebSocket
  const connect = useCallback(async () => {
    try {
      await WebSocketService.connect();
      setIsConnected(WebSocketService.isConnectedToServer());
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    WebSocketService.disconnect();
    setIsConnected(false);
    setMessages([]);
    unsubscribeFunctions.current.clear();
    subscriptions.current.clear();
  }, []);

  // Subscribe to a table and return unsubscribe function
  const subscribe = useCallback(
    (table: string, callback: (payload: any) => void): (() => void) => {
      if (subscriptions.current.has(table)) {
        console.warn(`Already subscribed to ${table}`);
        return () => {};
      }

      subscriptions.current.set(table, callback);

      let unsubscribe: () => void = () => {};

      switch (table) {
        case "votes":
          WebSocketService.subscribeToVotes(callback);
          unsubscribe = () => WebSocketService.unsubscribe("votes", callback);
          break;
        case "audit_logs":
          WebSocketService.subscribeToAuditLogs(callback);
          unsubscribe = () =>
            WebSocketService.unsubscribe("audit_logs", callback);
          break;
        case "students":
          WebSocketService.subscribeToStudents(callback);
          unsubscribe = () =>
            WebSocketService.unsubscribe("students", callback);
          break;
        case "sessions":
          WebSocketService.subscribeToSessions(callback);
          unsubscribe = () =>
            WebSocketService.unsubscribe("sessions", callback);
          break;
        case "candidates":
          WebSocketService.subscribeToCandidates(callback);
          unsubscribe = () =>
            WebSocketService.unsubscribe("candidates", callback);
          break;
        default:
          console.warn(`Unknown table: ${table}`);
          return () => {};
      }

      unsubscribeFunctions.current.set(table, unsubscribe);
      return unsubscribe;
    },
    [],
  );

  // Unsubscribe from a table
  const unsubscribe = useCallback((table: string) => {
    const unsubscribeFn = unsubscribeFunctions.current.get(table);
    if (unsubscribeFn) {
      unsubscribeFn();
      unsubscribeFunctions.current.delete(table);
      subscriptions.current.delete(table);
    }
  }, []);

  // Unsubscribe from all
  const unsubscribeAll = useCallback(() => {
    unsubscribeFunctions.current.forEach((unsubscribeFn) => {
      unsubscribeFn();
    });
    unsubscribeFunctions.current.clear();
    subscriptions.current.clear();
    WebSocketService.unsubscribeAll();
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((payload: any, table: string) => {
    const event: WebSocketEvent = {
      table,
      event: payload.eventType || "unknown",
      payload: payload.new || payload,
    };

    setLastMessage(event);
    setMessages((prev) => [event, ...prev].slice(0, 100));
  }, []);

  // Subscribe to votes - returns unsubscribe function
  const subscribeToVotes = useCallback(
    (callback: (payload: any) => void): (() => void) => {
      const wrappedCallback = (payload: any) => {
        handleMessage(payload, "votes");
        callback(payload);
      };
      return subscribe("votes", wrappedCallback);
    },
    [subscribe, handleMessage],
  );

  // Subscribe to audit logs - returns unsubscribe function
  const subscribeToAuditLogs = useCallback(
    (callback: (payload: any) => void): (() => void) => {
      const wrappedCallback = (payload: any) => {
        handleMessage(payload, "audit_logs");
        callback(payload);
      };
      return subscribe("audit_logs", wrappedCallback);
    },
    [subscribe, handleMessage],
  );

  // Subscribe to students - returns unsubscribe function
  const subscribeToStudents = useCallback(
    (callback: (payload: any) => void): (() => void) => {
      const wrappedCallback = (payload: any) => {
        handleMessage(payload, "students");
        callback(payload);
      };
      return subscribe("students", wrappedCallback);
    },
    [subscribe, handleMessage],
  );

  // Subscribe to sessions - returns unsubscribe function
  const subscribeToSessions = useCallback(
    (callback: (payload: any) => void): (() => void) => {
      const wrappedCallback = (payload: any) => {
        handleMessage(payload, "sessions");
        callback(payload);
      };
      return subscribe("sessions", wrappedCallback);
    },
    [subscribe, handleMessage],
  );

  // Subscribe to candidates - returns unsubscribe function
  const subscribeToCandidates = useCallback(
    (callback: (payload: any) => void): (() => void) => {
      const wrappedCallback = (payload: any) => {
        handleMessage(payload, "candidates");
        callback(payload);
      };
      return subscribe("candidates", wrappedCallback);
    },
    [subscribe, handleMessage],
  );

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    messages,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    unsubscribeAll,
    subscribeToVotes,
    subscribeToAuditLogs,
    subscribeToStudents,
    subscribeToSessions,
    subscribeToCandidates,
  };
};

export default useWebSocket;
