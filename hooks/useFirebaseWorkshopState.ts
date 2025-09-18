// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebaseConfig';
import type { StickyNoteType, IntentType, FlowchartType, Participant, WorkshopStatus, FlowchartEditorState, Group, FlowchartEditorStepState } from '../types';

// This is a global variable from index.html
const { doc, onSnapshot, setDoc, updateDoc } = window.firebase.firestore;

const WORKSHOP_DOC_ID = 'main_workshop_state'; // Using a single document for the entire workshop state

const getInitialState = (): WorkshopState => ({
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
});

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

export const useFirebaseWorkshopState = () => {
  const [state, setState] = useState<WorkshopState>(getInitialState());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "workshops", WORKSHOP_DOC_ID);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setState(docSnap.data() as WorkshopState);
      } else {
        // Document doesn't exist, so we create it with the initial state
        const initialState = getInitialState();
        setDoc(docRef, initialState).then(() => {
            setState(initialState);
        });
      }
      setIsLoading(false);
    }, (error) => {
        console.error("Error listening to workshop state:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStateInFirestore = useCallback(async (updates: Partial<WorkshopState>) => {
    const docRef = doc(db, "workshops", WORKSHOP_DOC_ID);
    try {
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  }, []);

  const resetWorkshop = async () => {
    const docRef = doc(db, "workshops", WORKSHOP_DOC_ID);
    try {
        await setDoc(docRef, getInitialState());
    } catch (error) {
        console.error("Error resetting workshop state", error);
    }
  };

  // --- Action Dispatchers ---
  const setStickyNotes = (updater: React.SetStateAction<StickyNoteType[]>) => {
    const newStickyNotes = typeof updater === 'function' ? updater(state.stickyNotes) : updater;
    updateStateInFirestore({ stickyNotes: newStickyNotes });
  };

  const setIntents = (updater: React.SetStateAction<IntentType[]>) => {
    const newIntents = typeof updater === 'function' ? updater(state.intents) : updater;
    updateStateInFirestore({ intents: newIntents });
  };
  
  const setGroups = (updater: React.SetStateAction<Group[]>) => {
    const newGroups = typeof updater === 'function' ? updater(state.groups) : updater;
    updateStateInFirestore({ groups: newGroups });
  };
 
  const assignParticipantToGroup = (participantId: string, groupId: string | null) => {
    const newParticipants = state.participants.map(p =>
      p.id === participantId ? { ...p, groupId } : p
    );
    updateStateInFirestore({ participants: newParticipants });
  };

  const setFlowcharts = (updater: React.SetStateAction<FlowchartType[]>) => {
    const newFlowcharts = typeof updater === 'function' ? updater(state.flowcharts) : updater;
    updateStateInFirestore({ flowcharts: newFlowcharts });
  };

  const addParticipant = (name: string): Participant => {
    const newParticipant: Participant = { 
      id: `user-${Date.now()}`, 
      name,
      isFacilitator: name.trim() === 'Eric',
      groupId: null,
    };
    updateStateInFirestore({ participants: [...state.participants, newParticipant] });
    return newParticipant;
  };

  const setWorkshopStatus = (status: WorkshopStatus) => {
    updateStateInFirestore({ status });
  };
  
  const setCurrentStage = (stage: number) => {
    updateStateInFirestore({ currentStage: stage });
  };

  const setFlowchartEditorForGroup = (groupId: string, updater: React.SetStateAction<FlowchartEditorStepState>) => {
    const currentGroupEditorState = state.flowchartEditor[groupId] || { selectedIntentId: '', currentSteps: [] };
    const newGroupEditorState = typeof updater === 'function' ? updater(currentGroupEditorState) : updater;
    const newFlowchartEditor = {
      ...state.flowchartEditor,
      [groupId]: newGroupEditorState
    };
    updateStateInFirestore({ flowchartEditor: newFlowchartEditor });
  };
  
  const setIsVoting = (updater: React.SetStateAction<boolean>) => {
    const newIsVoting = typeof updater === 'function' ? updater(state.isVoting) : updater;
    updateStateInFirestore({ isVoting: newIsVoting });
  };

  return {
    state: isLoading ? getInitialState() : state, // Return initial state while loading to prevent errors
    isLoading,
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
