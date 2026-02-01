// Client-side message API service
import { api } from "../config/api";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: string;
  editedAt?: string | null;
  isDeleted?: boolean;
  createdAt: string;
  sender: {
    id: string;
    email: string;
    username: string | null;
  };
}

export type EditMessageResponse = {
  success: boolean;
  message: Message;
};

export type DeleteMessageResponse = {
  success: boolean;
  message: Message;
};

export async function editMessage(messageId: string, content: string): Promise<EditMessageResponse> {
  const res = await api.put<EditMessageResponse>(`/messages/${messageId}`, { content });
  return res.data;
}

export async function deleteMessage(messageId: string): Promise<DeleteMessageResponse> {
  const res = await api.delete<DeleteMessageResponse>(`/messages/${messageId}`);
  return res.data;
}