export interface Participant {
  id: string;
  name: string;
  isFacilitator: boolean;
  groupId: string | null;
}

export interface Group {
  id: string;
  name: string;
}

export type WorkshopStatus = 'not_started' | 'in_progress' | 'completed';

export interface StickyNoteType {
  id: string;
  text: string;
  intentId: string | null;
}

export interface IntentType {
  id: string;
  name: string;
}

export enum FlowStepActor {
  User = 'User',
  Bot = 'Bot',
}

export enum BotResponseType {
  TEXT = 'TEXT',
  BUTTONS = 'BUTTONS',
  FREE_TEXT_INPUT = 'FREE_TEXT_INPUT'
}

export interface FlowStepType {
  id: string;
  actor: FlowStepActor;
  description: string;
  responseType?: BotResponseType;
  options?: string[];
}

export type MatrixQuadrant = 'q1' | 'q2' | 'q3' | 'q4';

export interface FlowchartType {
  id: string;
  title: string;
  intentId: string;
  steps: FlowStepType[];
  matrixPosition: MatrixQuadrant | null;
  votes: number;
  groupId: string;
}

export interface FlowchartEditorStepState {
  selectedIntentId: string;
  currentSteps: FlowStepType[];
}

export type FlowchartEditorState = Record<string, FlowchartEditorStepState>;