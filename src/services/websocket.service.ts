// src/services/websocket.service.ts
import { supabase } from "../api/client";

type EventCallback = (payload: any) => void;

export class WebSocketService {
  private static instance: WebSocketService;
  private subscriptions: Map<
    string,
    { channel: any; callbacks: EventCallback[] }
  > = new Map();
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      // Supabase realtime subscriptions are handled via the client
      console.log("WebSocket service initialized");
      this.isConnected = true;
    } catch (error) {
      console.error("WebSocket connection error:", error);
      throw error;
    }
  }

  async subscribeToVotes(callback: EventCallback): Promise<void> {
    const channel = supabase.channel("votes-changes");

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
        },
        (payload) => {
          callback(payload);
        },
      )
      .subscribe((status: string) => {
        console.log("Votes subscription status:", status);
      });

    if (!this.subscriptions.has("votes")) {
      this.subscriptions.set("votes", { channel, callbacks: [callback] });
    } else {
      this.subscriptions.get("votes")?.callbacks.push(callback);
    }
  }

  async subscribeToAuditLogs(callback: EventCallback): Promise<void> {
    const channel = supabase.channel("audit-logs-changes");

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_logs",
        },
        (payload) => {
          callback(payload);
        },
      )
      .subscribe((status: string) => {
        console.log("Audit logs subscription status:", status);
      });

    if (!this.subscriptions.has("audit-logs")) {
      this.subscriptions.set("audit-logs", { channel, callbacks: [callback] });
    } else {
      this.subscriptions.get("audit-logs")?.callbacks.push(callback);
    }
  }

  async subscribeToStudents(callback: EventCallback): Promise<void> {
    const channel = supabase.channel("students-changes");

    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "students",
        },
        (payload) => {
          callback(payload);
        },
      )
      .subscribe((status: string) => {
        console.log("Students subscription status:", status);
      });

    if (!this.subscriptions.has("students")) {
      this.subscriptions.set("students", { channel, callbacks: [callback] });
    } else {
      this.subscriptions.get("students")?.callbacks.push(callback);
    }
  }

  async subscribeToSessions(callback: EventCallback): Promise<void> {
    const channel = supabase.channel("sessions-changes");

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
        },
        (payload) => {
          callback(payload);
        },
      )
      .subscribe((status: string) => {
        console.log("Sessions subscription status:", status);
      });

    if (!this.subscriptions.has("sessions")) {
      this.subscriptions.set("sessions", { channel, callbacks: [callback] });
    } else {
      this.subscriptions.get("sessions")?.callbacks.push(callback);
    }
  }

  async subscribeToCandidates(callback: EventCallback): Promise<void> {
    const channel = supabase.channel("candidates-changes");

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "candidates",
        },
        (payload) => {
          callback(payload);
        },
      )
      .subscribe((status: string) => {
        console.log("Candidates subscription status:", status);
      });

    if (!this.subscriptions.has("candidates")) {
      this.subscriptions.set("candidates", { channel, callbacks: [callback] });
    } else {
      this.subscriptions.get("candidates")?.callbacks.push(callback);
    }
  }

  unsubscribe(table: string, callback?: EventCallback): void {
    const subscription = this.subscriptions.get(table);
    if (!subscription) return;

    if (callback) {
      const index = subscription.callbacks.indexOf(callback);
      if (index > -1) {
        subscription.callbacks.splice(index, 1);
      }
    } else {
      subscription.channel.unsubscribe();
      this.subscriptions.delete(table);
    }
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.channel.unsubscribe();
    });
    this.subscriptions.clear();
    console.log("All subscriptions cleared");
  }

  disconnect(): void {
    this.unsubscribeAll();
    this.isConnected = false;
    console.log("WebSocket disconnected");
  }

  isConnectedToServer(): boolean {
    return this.isConnected;
  }
}

export default WebSocketService.getInstance();
