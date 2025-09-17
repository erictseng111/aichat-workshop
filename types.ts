
export interface Participant {
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

export interface FlowStepType {
  id: string;
  actor: FlowStepActor;
  description: string;
}

export type MatrixQuadrant = 'q1' | 'q2' | 'q3' | 'q4';

export interface FlowchartType {
  id: string;
  title: string;
  steps: FlowStepType[];
  matrixPosition: MatrixQuadrant | null;
  votes: number;
}