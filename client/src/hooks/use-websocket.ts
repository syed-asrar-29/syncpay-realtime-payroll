import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

type WebSocketMessage = 
  | { type: 'LEAVE_UPDATED'; data: any }
  | { type: 'SALARY_UPDATED'; data: any }
  | { type: 'EMPLOYEE_UPDATED'; data: any };

export function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('Connected to WebSocket');
    };

    socketRef.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'LEAVE_UPDATED':
            queryClient.invalidateQueries({ queryKey: [api.leaves.list.path] });
            toast({
              title: "Update Received",
              description: "Leave requests have been updated.",
            });
            break;
          case 'SALARY_UPDATED':
            queryClient.invalidateQueries({ queryKey: [api.salary.list.path] });
            toast({
              title: "Payroll Processed",
              description: "New salary records are available.",
            });
            break;
          case 'EMPLOYEE_UPDATED':
            queryClient.invalidateQueries({ queryKey: [api.employees.list.path] });
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message', error);
      }
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [queryClient, toast]);
}
