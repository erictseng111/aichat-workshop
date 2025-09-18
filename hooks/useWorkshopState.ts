import { useState, useEffect, useCallback } from 'react';
import type { StickyNoteType, IntentType, FlowchartType, Participant, WorkshopStatus, FlowchartEditorState, Group, FlowchartEditorStepState } from '../types';

const WORKSHOP_STATE_KEY = 'workshop_global_state';

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

const getInitialState = (): WorkshopState => {
  try {
    const item = localStorage.getItem(WORKSHOP_STATE_KEY);
    // Start with a few items for demonstration purposes if storage is empty
    const defaultState: Omit<WorkshopState, 'participants'> & { participants: Omit<Participant, 'groupId'>[] } = { 
        status: 'not_started',
        currentStage: 1,
        participants: [],
        stickyNotes: [
            { id: 'note-1', text: 'How do I check my order status?', intentId: null },
            { id: 'note-2', text: 'What is the return policy?', intentId: null },
            { id: 'note-3', text: 'How can I reset my password?', intentId: null },
        ], 
        intents: [], 
        groups: [],
        flowcharts: [],
        flowchartEditor: {},
        isVoting: false,
    };
    
    const storedState = item ? JSON.parse(item) : {};

    // Ensure all participants have a groupId
    if (storedState.participants) {
      storedState.participants = storedState.participants.map((p: Participant) => ({...p, groupId: p.groupId || null}))
    }

    // Merge stored state with default, ensuring new properties exist
    return { ...defaultState, ...storedState } as WorkshopState;

  } catch (error) {
    console.error("Error reading from localStorage", error);
    return { 
        status: 'not_started',
        currentStage: 1,
        participants: [],
        stickyNotes: [], 
        intents: [], 
        groups: [],
        flowcharts: [],
        flowchartEditor: {},
        isVoting: false,
    };
  }
};

export const useWorkshopState = () => {
  const [state, setState] = useState<WorkshopState>(getInitialState);

  // Write to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(WORKSHOP_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [state]);

  // Listen for changes from other tabs/windows
  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === WORKSHOP_STATE_KEY && event.newValue) {
      try {
        if (event.newValue !== JSON.stringify(state)) {
            setState(JSON.parse(event.newValue));
        }
      } catch (error) {
        console.error("Error parsing new state from localStorage", error);
      }
    }
  }, [state]);

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleStorageChange]);

  const resetWorkshop = () => {
    try {
      localStorage.removeItem(WORKSHOP_STATE_KEY);
      setState(getInitialState());
    } catch (error) {
      console.error("Error resetting workshop state", error);
    }
  };

  // --- Action Dispatchers ---
  const setStickyNotes = (updater: React.SetStateAction<StickyNoteType[]>) => {
    setState(prevState => ({
      ...prevState,
      stickyNotes: typeof updater === 'function' ? updater(prevState.stickyNotes) : updater,
    }));
  };

  const setIntents = (updater: React.SetStateAction<IntentType[]>) => {
     setState(prevState => ({
      ...prevState,
      intents: typeof updater === 'function' ? updater(prevState.intents) : updater,
    }));
  };

  const setGroups = (updater: React.SetStateAction<Group[]>) => {
    setState(prevState => ({
     ...prevState,
     groups: typeof updater === 'function' ? updater(prevState.groups) : updater,
   }));
 };
 
  const assignParticipantToGroup = (participantId: string, groupId: string | null) => {
      setState(prevState => ({
          ...prevState,
          participants: prevState.participants.map(p =>
              p.id === participantId ? { ...p, groupId } : p
          ),
      }));
  };

  const setFlowcharts = (updater: React.SetStateAction<FlowchartType[]>) => {
     setState(prevState => ({
      ...prevState,
      flowcharts: typeof updater === 'function' ? updater(prevState.flowcharts) : updater,
    }));
  };

  const addParticipant = (name: string): Participant => {
    const newParticipant: Participant = { 
      id: `user-${Date.now()}`, 
      name,
      isFacilitator: name.trim() === 'Eric',
      groupId: null,
    };
    setState(prevState => ({
        ...prevState,
        participants: [...prevState.participants, newParticipant],
    }));
    return newParticipant;
  };

  const setWorkshopStatus = (status: WorkshopStatus) => {
      setState(prevState => ({ ...prevState, status }));
  };
  
  const setCurrentStage = (stage: number) => {
      setState(prevState => ({ ...prevState, currentStage: stage }));
  };

  const setFlowchartEditorForGroup = (groupId: string, updater: React.SetStateAction<FlowchartEditorStepState>) => {
    setState(prevState => {
        const currentGroupEditorState = prevState.flowchartEditor[groupId] || { selectedIntentId: '', currentSteps: [] };
        const newGroupEditorState = typeof updater === 'function' ? updater(currentGroupEditorState) : updater;
        return {
            ...prevState,
            flowchartEditor: {
                ...prevState.flowchartEditor,
                [groupId]: newGroupEditorState
            }
        };
    });
  };

  const setIsVoting = (updater: React.SetStateAction<boolean>) => {
    setState(prevState => ({
      ...prevState,
      isVoting: typeof updater === 'function' ? updater(prevState.isVoting) : updater,
    }));
  };


  return {
    state,
    setStickyNotes,
    setIntents,
    setGroups,
    assignParticipantToGroup,
    setFlowcharts,
    addParticipant,
    setWorkshopStatus,
    setCurrentStage,
    setFlowchartEditorForGroup,
    setIsVoting,
    resetWorkshop,
  };
};