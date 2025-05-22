import { Project as DbProject } from "@workspace/db";

export interface AnalyzedContent {
  totalElem: number;
  totalEmpty: number;
}

export interface Variable {
  id: string;
  key: string;
  value: string;
  isPublic: boolean;
  isVisible: boolean;
  isEditing: boolean;
  status: "valid" | "missing" | "invalid";
  requiredBy: string[];
}

export interface Project
  extends Omit<DbProject, "updatedAt" | "createdAt" | "content"> {
  updatedAt: string;
  createdAt: string;
  status: "valid" | "missing" | "invalid";
  envCount: number;
  description: string;
  slug: string;
  content: AnalyzedContent;
}
