export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified?: string;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  isLoading?: boolean;
}
