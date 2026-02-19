'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotorStore } from '../../lib/motor/store';
import { getMotorStep } from '../../lib/motor/scripts';
import { MotorJourneyState } from '../../lib/motor/types';
import ChatMessage, { TypingIndicator } from '../ChatMessage';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import {
  MotorSelectionCards,
  VehicleRegInput,
  ProgressiveLoader,
  VehicleDetailsCard,
  BrandSelector,
  ModelSelector,
  VariantSelector,
  YearSelector,
  NcbSelector,
  NcbReward,
  InsurerSelector,
  EditableSummary,
  RejectionScreen,
  PlanCalculator,
  PlanSelector,
  OutOfPocketAddons,
  ProtectEveryoneAddons,
  MotorTextInput,
  DocumentUploadWidget,
} from './MotorWidgets';
import { PremiumBreakdown, DashboardCTA } from './MotorFinalWidgets';

// Add MotorCelebration locally since it needs to be inline
function MotorCelebration({ onContinue }: { onContinue?: () => void }) {
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance after celebration
  useEffect(() => {
    if (onContinue) {
      const advanceTimer = setTimeout(() => {
        onContinue();
      }, 3500); // Advance after confetti ends
      return () => clearTimeout(advanceTimer);
    }
  }, [onContinue]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative py-8">
      {confetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * 300, opacity: 1 }}
              animate={{ y: 600, opacity: 0, rotate: Math.random() * 720 }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: 'linear' }}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6'][Math.floor(Math.random() * 5)] }}
            />
          ))}
        </div>
      )}

      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30"
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-[22px] font-bold text-white mb-3">
          Payment Successful! 🎉
        </motion.h2>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-[14px] text-white/70 mb-6 leading-relaxed">
          Your motor insurance is now active.<br />Welcome to ACKO!
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-[12px] text-white/50 mb-2">Policy Number</p>
          <p className="text-[16px] font-bold text-white">ACKO/MOT/{Math.floor(Math.random() * 9000000 + 1000000)}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function MotorChatContainer() {
  const {
    currentStepId,
    conversationHistory,
    isTyping,
    addMessage,
    updateState,
    trimAndUpdateFromStep,
  } = useMotorStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef<Set<string>>(new Set());
  const [showWidget, setShowWidget] = useState(false);
  const [editModal, setEditModal] = useState<{ stepId: string; visible: boolean }>({ stepId: '', visible: false });
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  // Scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  }, [conversationHistory, isTyping, showWidget]);

  // Process current step
  useEffect(() => {
    const step = getMotorStep(currentStepId);
    if (!step) return;

    const currentState = useMotorStore.getState() as MotorJourneyState;

    // Skip if condition not met
    if (step.condition && !step.condition(currentState)) {
      const nextStepId = step.getNextStep(null, currentState);
      const nextStep = getMotorStep(nextStepId);
      updateState({
        currentStepId: nextStepId,
        currentModule: nextStep?.module || currentState.currentModule,
      } as Partial<MotorJourneyState>);
      return;
    }

    const key = `${currentStepId}-${currentState.conversationHistory.length}`;
    if (processedRef.current.has(key)) return;
    processedRef.current.add(key);

    const script = step.getScript(currentState);

    const addBotMessage = async () => {
      setShowWidget(false);
      updateState({ isTyping: true } as Partial<MotorJourneyState>);

      const mergedContent = script.botMessages.join('\n\n');
      const delay = 400 + Math.min(mergedContent.length * 8, 1800);
      await new Promise(r => setTimeout(r, delay));

      addMessage({
        type: 'bot',
        content: mergedContent,
        stepId: currentStepId,
        module: step.module,
      });
      updateState({ isTyping: false } as Partial<MotorJourneyState>);

      if (step.widgetType === 'none') {
        await new Promise(r => setTimeout(r, 400));
        const freshState = useMotorStore.getState() as MotorJourneyState;
        const nextStepId = step.getNextStep(null, freshState);
        if (nextStepId === currentStepId) return;
        const nextStep = getMotorStep(nextStepId);
        updateState({
          currentStepId: nextStepId,
          currentModule: nextStep?.module || freshState.currentModule,
        } as Partial<MotorJourneyState>);
        return;
      }

      setShowWidget(true);
    };

    addBotMessage();
  }, [currentStepId]);

  // Handle edit
  const handleEditRequest = (stepId: string) => {
    setEditModal({ stepId, visible: true });
  };

  const confirmEdit = () => {
    const { stepId } = editModal;
    setEditModal({ stepId: '', visible: false });
    setEditingStepId(stepId);
  };

  // Handle response from the inline edit widget
  const handleEditResponse = useCallback((response: any) => {
    if (!editingStepId) return;
    const step = getMotorStep(editingStepId);
    if (!step) return;

    const currentState = useMotorStore.getState() as MotorJourneyState;
    const script = step.getScript(currentState);

    let userLabel = String(response);
    if (script.options) {
      const opt = script.options.find(o => o.id === response);
      if (opt) userLabel = opt.label;
    }

    // Special labels for motor widgets
    if (step.widgetType === 'plan_selector') {
      userLabel = `Selected: ${response.plan?.name || 'plan'}`;
    }

    // Trim all messages after this step's user message, then re-route
    trimAndUpdateFromStep(editingStepId, userLabel);

    // Apply the state update from the new response
    const stateUpdate = step.processResponse(response, currentState);
    const mergedState = { ...currentState, ...stateUpdate } as MotorJourneyState;
    updateState(stateUpdate as Partial<MotorJourneyState>);

    setEditingStepId(null);
    setShowWidget(false);

    // Clear processedRef so new steps can be processed fresh
    processedRef.current.clear();

    // Navigate to the correct next step based on new response
    const nextStepId = step.getNextStep(response, mergedState);
    const nextStep = getMotorStep(nextStepId);
    setTimeout(() => {
      updateState({
        currentStepId: nextStepId,
        currentModule: nextStep?.module || mergedState.currentModule,
      } as Partial<MotorJourneyState>);
    }, 300);
  }, [editingStepId, trimAndUpdateFromStep]);

  // Render edit widget (for in-place editing)
  const renderEditWidget = () => {
    if (!editingStepId) return null;
    const step = getMotorStep(editingStepId);
    if (!step) return null;

    const currentState = useMotorStore.getState() as MotorJourneyState;
    const script = step.getScript(currentState);

    switch (step.widgetType) {
      case 'selection_cards':
        return <MotorSelectionCards options={script.options || []} onSelect={handleEditResponse} />;
      case 'vehicle_reg_input':
        return <VehicleRegInput placeholder={script.placeholder} onSubmit={handleEditResponse} />;
      case 'text_input':
        return <MotorTextInput placeholder={script.placeholder} inputType={script.inputType as 'text' | 'number' | 'tel' || 'text'} onSubmit={handleEditResponse} />;
      case 'number_input':
        return <MotorTextInput placeholder={script.placeholder} inputType="number" onSubmit={handleEditResponse} />;
      case 'brand_selector':
        return <BrandSelector onSelect={handleEditResponse} />;
      case 'model_selector':
        return <ModelSelector onSelect={handleEditResponse} />;
      case 'variant_selector':
        return <VariantSelector onSelect={handleEditResponse} />;
      case 'year_selector':
        return <YearSelector onSelect={handleEditResponse} />;
      case 'ncb_selector':
        return <NcbSelector onSelect={handleEditResponse} />;
      case 'insurer_selector':
        return <InsurerSelector onSelect={handleEditResponse} />;
      case 'plan_selector':
        return <PlanSelector onSelect={handleEditResponse} />;
      case 'out_of_pocket_addons':
        return <OutOfPocketAddons onContinue={(addons) => handleEditResponse({ addons })} />;
      case 'protect_everyone_addons':
        return <ProtectEveryoneAddons onContinue={(addons) => handleEditResponse({ addons })} />;
      default:
        return null;
    }
  };

  // Check if the edit widget requires a full-size overlay (not bottom sheet)
  const isLargeEditWidget = () => {
    if (!editingStepId) return false;
    const step = getMotorStep(editingStepId);
    return ['brand_selector', 'model_selector', 'variant_selector', 'year_selector', 'ncb_selector', 'insurer_selector', 'plan_selector', 'out_of_pocket_addons', 'protect_everyone_addons'].includes(step?.widgetType || '');
  };

  // Handle response
  const handleResponse = useCallback((response: any) => {
    const step = getMotorStep(currentStepId);
    if (!step) return;

    const currentState = useMotorStore.getState() as MotorJourneyState;
    const script = step.getScript(currentState);

    let userLabel = String(response);
    if (script.options) {
      const opt = script.options.find(o => o.id === response);
      if (opt) userLabel = opt.label;
    }

    // Special labels
    if (step.widgetType === 'progressive_loader') {
      userLabel = response === 'success' ? 'Vehicle found!' : 'Details not found';
    } else if (step.widgetType === 'vehicle_details_card') {
      userLabel = 'Confirmed vehicle details';
    } else if (step.widgetType === 'ncb_reward') {
      userLabel = 'NCB reward applied!';
    } else if (step.widgetType === 'editable_summary') {
      userLabel = 'Confirmed — view prices';
    } else if (step.widgetType === 'plan_calculator') {
      // Plan calculator is a loading state - don't show user message
      userLabel = '';
    } else if (step.widgetType === 'plan_selector') {
      const planName = response.plan?.name || 'plan';
      userLabel = `Selected: ${planName}`;
    } else if (step.widgetType === 'out_of_pocket_addons') {
      const count = response.addons?.length || 0;
      userLabel = count > 0 ? `Added ${count} add-on${count > 1 ? 's' : ''}` : 'Continue without add-ons';
    } else if (step.widgetType === 'protect_everyone_addons') {
      const count = response.addons?.length || 0;
      userLabel = count > 0 ? `Added ${count} protection cover${count > 1 ? 's' : ''}` : 'Continue without add-ons';
    } else if (step.widgetType === 'premium_breakdown') {
      userLabel = 'Proceed to payment';
    } else if (step.widgetType === 'motor_celebration') {
      userLabel = '';
    } else if (step.widgetType === 'dashboard_cta') {
      userLabel = response.choice === 'dashboard' ? 'Go to Dashboard' : 'Download Policy';
    } else if (step.widgetType === 'document_upload') {
      const docsUploaded = [
        response?.rcUploaded && 'RC',
        response?.dlUploaded && 'DL',
        response?.prevPolicyUploaded && 'Previous Policy',
      ].filter(Boolean).join(', ');
      userLabel = `Documents uploaded: ${docsUploaded}`;
    }

    // Add user message (skip for loading states)
    if (userLabel) {
      addMessage({
        type: 'user',
        content: userLabel,
        stepId: currentStepId,
        module: step.module,
        editable: true,
      });
    }

    const stateUpdate = step.processResponse(response, useMotorStore.getState() as MotorJourneyState);
    const mergedState = { ...useMotorStore.getState(), ...stateUpdate } as MotorJourneyState;
    updateState(stateUpdate as Partial<MotorJourneyState>);

    setShowWidget(false);
    const nextStepId = step.getNextStep(response, mergedState);
    const nextStep = getMotorStep(nextStepId);
    setTimeout(() => {
      updateState({
        currentStepId: nextStepId,
        currentModule: nextStep?.module || mergedState.currentModule,
      } as Partial<MotorJourneyState>);
    }, 300);
  }, [currentStepId]);

  // Render widget
  const renderWidget = () => {
    const step = getMotorStep(currentStepId);
    if (!step || !showWidget) return null;

    const currentState = useMotorStore.getState() as MotorJourneyState;
    const script = step.getScript(currentState);

    switch (step.widgetType) {
      case 'selection_cards':
        return <MotorSelectionCards options={script.options || []} onSelect={handleResponse} />;
      case 'vehicle_reg_input':
        return <VehicleRegInput placeholder={script.placeholder} onSubmit={handleResponse} />;
      case 'text_input':
        return <MotorTextInput placeholder={script.placeholder} inputType={script.inputType as 'text' | 'number' | 'tel' || 'text'} onSubmit={handleResponse} />;
      case 'number_input':
        return <MotorTextInput placeholder={script.placeholder} inputType="number" onSubmit={handleResponse} />;
      case 'progressive_loader':
        return <ProgressiveLoader onComplete={handleResponse} />;
      case 'vehicle_details_card':
        return <VehicleDetailsCard onConfirm={() => handleResponse('confirmed')} />;
      case 'brand_selector':
        return <BrandSelector onSelect={handleResponse} />;
      case 'model_selector':
        return <ModelSelector onSelect={handleResponse} />;
      case 'variant_selector':
        return <VariantSelector onSelect={handleResponse} />;
      case 'year_selector':
        return <YearSelector onSelect={handleResponse} />;
      case 'ncb_selector':
        return <NcbSelector onSelect={handleResponse} />;
      case 'ncb_reward':
        return <NcbReward onContinue={() => handleResponse('continue')} />;
      case 'insurer_selector':
        return <InsurerSelector onSelect={handleResponse} />;
      case 'editable_summary':
        return <EditableSummary onConfirm={() => handleResponse('confirmed')} />;
      case 'rejection_screen':
        return <RejectionScreen />;
      case 'plan_calculator':
        return <PlanCalculator onComplete={handleResponse} />;
      case 'plan_selector':
        return <PlanSelector onSelect={handleResponse} />;
      case 'out_of_pocket_addons':
        return <OutOfPocketAddons onContinue={(addons) => handleResponse({ addons })} />;
      case 'protect_everyone_addons':
        return <ProtectEveryoneAddons onContinue={(addons) => handleResponse({ addons })} />;
      case 'premium_breakdown':
        return <PremiumBreakdown onContinue={() => handleResponse({})} />;
      case 'motor_celebration':
        return <MotorCelebration onContinue={() => handleResponse({})} />;
      case 'dashboard_cta':
        return <DashboardCTA onSelect={(choice) => handleResponse({ choice })} />;
      case 'document_upload':
        return <DocumentUploadWidget onContinue={(result) => handleResponse(result)} />;
      default:
        return null;
    }
  };

  // Large widgets render inline in chat
  const isLargeWidget = () => {
    const step = getMotorStep(currentStepId);
    if (!step) return false;
    return [
      'progressive_loader', 'vehicle_details_card', 'brand_selector',
      'model_selector', 'variant_selector', 'year_selector',
      'ncb_selector', 'ncb_reward', 'insurer_selector',
      'editable_summary', 'rejection_screen', 'plan_calculator',
      'plan_selector', 'out_of_pocket_addons', 'protect_everyone_addons',
      'premium_breakdown', 'motor_celebration', 'dashboard_cta', 'document_upload',
    ].includes(step.widgetType);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 chat-bg-dark">
      {/* Scrollable chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto">
          <AnimatePresence initial={false}>
            {conversationHistory.map((msg) => (
              <ChatMessage key={msg.id} message={msg as ChatMessageType} onEdit={handleEditRequest} />
            ))}
          </AnimatePresence>

          {isTyping && (
            <div className="mb-4">
              <TypingIndicator />
            </div>
          )}

          {/* Large widgets render inline */}
          <AnimatePresence>
            {showWidget && isLargeWidget() && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-2 mb-4 ml-11"
              >
                {renderWidget()}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-4" />
        </div>
      </div>

      {/* Sticky bottom widget for input-type widgets */}
      <AnimatePresence>
        {showWidget && !isLargeWidget() && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="shrink-0 widget-glass-dark shadow-[0_-4px_40px_rgba(0,0,0,0.3)] max-h-[45vh] overflow-y-auto"
          >
            <div className="max-w-lg mx-auto px-5 py-5 pb-8">
              {renderWidget()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Confirmation Modal */}
      <AnimatePresence>
        {editModal.visible && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setEditModal({ stepId: '', visible: false })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-[#2A1463] border border-white/15 rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-[16px] font-semibold text-white mb-2">Edit this answer?</h3>
                <p className="text-[13px] text-white/50 mb-6">
                  The conversation will continue from this point with your updated answer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditModal({ stepId: '', visible: false })}
                    className="flex-1 py-2.5 border border-white/20 text-white/70 rounded-xl text-[14px] font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmEdit}
                    className="flex-1 py-2.5 bg-white text-[#1C0B47] rounded-xl text-[14px] font-medium hover:bg-white/90 transition-colors"
                  >
                    Edit answer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Widget Bottom Sheet / Full Overlay */}
      <AnimatePresence>
        {editingStepId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setEditingStepId(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed inset-x-0 z-50 bg-[#1E0F46] border-t border-white/10 shadow-2xl px-5 py-6 max-w-lg mx-auto ${
                isLargeEditWidget()
                  ? 'bottom-0 top-16 rounded-t-2xl overflow-y-auto pb-10'
                  : 'bottom-0 rounded-t-2xl pb-10 max-h-[45vh] overflow-y-auto'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[14px] font-semibold text-white/80">Update your answer</h4>
                <button onClick={() => setEditingStepId(null)} className="text-white/40 hover:text-white/70 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {renderEditWidget()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
