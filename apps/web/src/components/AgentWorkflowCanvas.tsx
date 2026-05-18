'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@aibh/state';
import { GitBranch, CheckCircle2, Loader2, AlertCircle, Clock, Play, ArrowRight, RefreshCw, Cpu } from 'lucide-react';

export default function AgentWorkflowCanvas() {
  const executionGraph = useAppStore((state) => state.executionGraph);
  const activeStepId = useAppStore((state) => state.activeStepId);
  const updateStepStatus = useAppStore((state) => state.updateStepStatus);

  // Simulate LangGraph Agent Step Execution progression
  const simulateNextStep = () => {
    if (!activeStepId) return;
    const currentStep = executionGraph.find((s) => s.id === activeStepId);
    if (!currentStep) return;

    if (currentStep.status === 'pending') {
      updateStepStatus(activeStepId, 'running');
      setTimeout(() => {
        updateStepStatus(activeStepId, 'success', `Execution completed successfully at ${new Date().toLocaleTimeString()}`);
      }, 2500);
    } else if (currentStep.status === 'running') {
      updateStepStatus(activeStepId, 'success', `Execution completed successfully at ${new Date().toLocaleTimeString()}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-navy-900 border-l border-navy-700 z-10 relative overflow-hidden">
      {/* Top Header */}
      <header className="px-6 py-4 bg-navy-800 border-b border-navy-700 flex items-center justify-between flex-shrink-0 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-md">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center space-x-2">
              <span>LangGraph Execution Engine</span>
              <span className="px-2 py-0.5 bg-navy-900 border border-navy-700 rounded text-emerald-400 text-[10px] font-mono uppercase">Cyclic Graph</span>
            </h3>
            <p className="text-[10px] text-sand-400">Autonomous Planner, Executor & Reflection Loops</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={simulateNextStep}
            disabled={!activeStepId}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Step Execution</span>
          </button>
        </div>
      </header>

      {/* Main Graph Visualization Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-navy-900 via-navy-800/50 to-navy-900 flex flex-col justify-center items-center">
        {executionGraph.length === 0 ? (
          <div className="text-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 bg-navy-800 border border-navy-700 rounded-2xl flex items-center justify-center text-sand-400 mb-6 mx-auto shadow-2xl">
              <Cpu className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Active Agent Workflow</h3>
            <p className="text-xs text-sand-400 leading-relaxed mb-6">
              Submit a prompt in the chat requiring research, multi-step reasoning, or autonomous tool execution to instantiate a LangGraph workflow.
            </p>
            <button
              onClick={() => {
                useAppStore.getState().setExecutionGraph([
                  { id: 'step_1', action: 'Decomposing objective into task DAG', status: 'success', result: 'Identified 3 sub-tasks: Web Search, Data Extraction, Sandbox Charting.' },
                  { id: 'step_2', action: 'Executing MCP Tool: DuckDuckGo Web Search', status: 'success', result: 'Retrieved top 10 relevant industry reports.' },
                  { id: 'step_3', action: 'Executing Firecracker Sandbox: Python Data Aggregation', status: 'running' },
                  { id: 'step_4', action: 'LLM Reflection & Self-Correction Critique', status: 'pending' },
                ]);
              }}
              className="px-6 py-3 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-sand-200 hover:text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Instantiate Sample Workflow</span>
            </button>
          </div>
        ) : (
          <div className="max-w-2xl w-full space-y-6 my-auto py-8">
            {executionGraph.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 bg-navy-800/80 border rounded-2xl shadow-xl backdrop-blur-sm flex flex-col relative group transition-all ${step.id === activeStepId ? 'border-emerald-500 shadow-emerald-500/10 shadow-2xl scale-[1.02]' : 'border-navy-700'}`}
              >
                {/* Connecting Arrow between nodes */}
                {index < executionGraph.length - 1 && (
                  <div className="absolute left-1/2 -bottom-6 transform -translate-x-1/2 flex flex-col items-center z-0">
                    <div className="w-0.5 h-6 bg-navy-700 group-hover:bg-sand-500 transition-colors" />
                    <ArrowRight className="w-3.5 h-3.5 text-navy-700 group-hover:text-sand-500 transition-colors transform rotate-90 -mt-1.5" />
                  </div>
                )}

                <div className="flex items-start justify-between mb-3 z-10">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${step.status === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : step.status === 'running' ? 'bg-warm-500/20 border border-warm-500/30 text-warm-400 animate-pulse' : step.status === 'failed' ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-navy-900 border border-navy-700 text-sand-500'}`}>
                      {step.status === 'success' && <CheckCircle2 className="w-4 h-4" />}
                      {step.status === 'running' && <Loader2 className="w-4 h-4 animate-spin" />}
                      {step.status === 'failed' && <AlertCircle className="w-4 h-4" />}
                      {step.status === 'pending' && <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                        <span>Step {index + 1}: {step.action}</span>
                      </h4>
                      <p className="text-[10px] text-sand-400 uppercase font-mono mt-0.5">Status: <span className={step.status === 'success' ? 'text-emerald-400 font-bold' : step.status === 'running' ? 'text-warm-400 font-bold' : step.status === 'failed' ? 'text-red-400 font-bold' : 'text-sand-500'}>{step.status}</span></p>
                    </div>
                  </div>

                  {step.id === activeStepId && (
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-mono font-bold animate-pulse">
                      Active Execution Node
                    </span>
                  )}
                </div>

                {/* Step Result Critique Box */}
                {step.result && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-3 bg-navy-900 border border-navy-700 rounded-xl text-xs text-sand-300 font-mono shadow-inner z-10 border-l-2 border-l-emerald-500">
                    {step.result}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
