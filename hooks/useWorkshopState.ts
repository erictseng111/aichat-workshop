import type { StickyNoteType, IntentType, FlowchartType, Participant, WorkshopStatus, FlowchartEditorState, Group, FlowchartEditorStepState } from '../types';

// This hook is deprecated and has been replaced by useFirebaseWorkshopState.
// Its contents have been stubbed out to prevent a "circular structure to JSON"
// error caused by this hook's `JSON.stringify` conflicting with live Firebase objects in the application state.

interface WorkshopState {
  status: WorkshopStatus;
  currentStage: number;
  participants: Participant[];
  stickyNotes: StickyNoteType[];
  intents: IntentType[];
  groups: Group[];
  flowcharts: FlowchartType[];
  flowchartEditor: FlowchartEditorState;
  isVoting: boolean;
}

const getInitialState = (): WorkshopState => ({
    status: 'not_started',
    currentStage: 1,
    participants: [],
    stickyNotes: [],
    intents: [],
    groups: [],
    flowcharts: [],
    flowchartEditor: {},
    isVoting: false,
});

const noOp = () => {};

// A dummy addParticipant is needed because App.tsx expects a return value.
const returnNewParticipant = (name: string): Participant => ({
    id: `user-${Date.now()}`,
    name,
    isFacilitator: name.trim() === 'Eric',
    groupId: null,
});

export const useWorkshopState = () => {
  return {
    state: getInitialState(),
    setStickyNotes: noOp,
    setIntents: noOp,
    setGroups: noOp,
    assignParticipantToGroup: noOp,
    setFlowcharts: noOp,
    addParticipant: returnNewParticipant,
    setWorkshopStatus: noOp,
    setCurrentStage: noOp,
    setFlowchartEditorForGroup: noOp,
    setIsVoting: noOp,
    resetWorkshop: noOp,
  };
};
