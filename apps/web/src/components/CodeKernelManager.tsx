'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu, HardDrive, ShieldAlert, Play, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';

interface KernelSession {
  id: string;
  vmId: string;
  language: string;
  status: 'idle' | 'busy' | 'terminating';
  cpuUsage: number;
  memoryUsage: string;
  uptime: string;
}

export default function CodeKernelManager() {
  const [sessions, setSessions] = useState<KernelSession[]>([
    { id: 'sess_py_01', vmId: 'fc_vm_9942', language: 'python', status: 'idle', cpuUsage: 1.2, memoryUsage: '42 / 512 MB', uptime: '14m 22s' },
    { id: 'sess_js_02', vmId: 'fc_vm_1042', language: 'node', status: 'busy', cpuUsage: 84.5, memoryUsage: '128 / 512 MB', uptime: '3m 05s' },
    { id: 'sess_sh_03', vmId: 'fc_vm_8821', language: 'bash', status: 'idle', cpuUsage: 0.1, memoryUsage: '12 / 256 MB', uptime: '42m 10s' },
  ]);

  const [isSpawning, setIsSpawning] = useState(false);

  const spawnKernel = () => {
    setIsSpawning(true);
    setTimeout(() => {
      const newSess: KernelSession = {
        id: `sess_py_${Date.now().toString().substr(-2)}`,
        vmId: `fc_vm_${Math.floor(Math.random() * 9000 + 1000)}`,
        language: 'python',
        status: 'idle',
        cpuUsage: 0.5,
        memoryUsage: '32 / 512 MB',
        uptime: '0m 01s',
      };
      setSessions([...sessions, newSess]);
      setIsSpawning(false);
    }, 1500);
  };

  const terminateKernel = (id: string) => {
    setSessions(sessions.map((s) => (s.id === id ? { ...s, status: 'terminating' } : s)));
    setTimeout(() => {
      setSessions(sessions.filter((s) => s.id !== id));
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-navy-900 border-l border-navy-700 z-10 relative overflow-hidden">
      {/* Top Header */}
      <header className="px-6 py-4 bg-navy-800 border-b border-navy-700 flex items-center justify-between flex-shrink-0 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-warm-500/20 border border-warm-500/30 rounded-xl flex items-center justify-center text-warm-400 flex-shrink-0 shadow-md">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center space-x-2">
              <span>Firecracker microVM Kernel Pool</span>
              <span className="px-2 py-0.5 bg-navy-900 border border-navy-700 rounded text-warm-400 text-[10px] font-mono uppercase">Hardware Sandbox</span>
            </h3>
            <p className="text-[10px] text-sand-400">Secure Ephemeral Code Execution Kernels</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={spawnKernel}
            disabled={isSpawning}
            className="flex items-center space-x-2 px-4 py-2 bg-warm-500 hover:bg-warm-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            {isSpawning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Spawn Ephemeral Kernel</span>
          </button>
        </div>
      </header>

      {/* Main Pool Display Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-navy-900 via-navy-800/50 to-navy-900 flex flex-col">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-navy-800/80 border border-navy-700 rounded-2xl shadow-xl backdrop-blur-sm flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-sand-400 mb-1">Active microVMs</h4>
                <div className="text-2xl font-black text-white font-mono">{sessions.length} / 100</div>
              </div>
            </div>

            <div className="p-6 bg-navy-800/80 border border-navy-700 rounded-2xl shadow-xl backdrop-blur-sm flex items-center space-x-4">
              <div className="w-12 h-12 bg-warm-500/20 border border-warm-500/30 rounded-xl flex items-center justify-center text-warm-400 shadow-inner">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-sand-400 mb-1">Total Pool CPU</h4>
                <div className="text-2xl font-black text-white font-mono">
                  {sessions.reduce((acc, s) => acc + s.cpuUsage, 0).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="p-6 bg-navy-800/80 border border-navy-700 rounded-2xl shadow-xl backdrop-blur-sm flex items-center space-x-4">
              <div className="w-12 h-12 bg-sand-500/20 border border-sand-500/30 rounded-xl flex items-center justify-center text-sand-400 shadow-inner">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-sand-400 mb-1">RAM Allocated</h4>
                <div className="text-2xl font-black text-white font-mono">
                  {sessions.length * 512} MB
                </div>
              </div>
            </div>
          </div>

          {/* Kernel List */}
          <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-warm-400" />
            <span>Isolated Kernel Instances (Jailbreak Protected)</span>
          </h3>

          <div className="space-y-4">
            {sessions.map((sess) => (
              <motion.div
                key={sess.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-6 bg-navy-800/80 border rounded-2xl shadow-xl backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${sess.status === 'terminating' ? 'border-red-500/50 opacity-50 bg-red-500/5' : 'border-navy-700'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md font-mono text-xs uppercase font-bold ${sess.language === 'python' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' : sess.language === 'node' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-purple-500/20 border border-purple-500/30 text-purple-400'}`}>
                    {sess.language.substr(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>{sess.vmId}</span>
                      <span className="px-2 py-0.5 bg-navy-900 border border-navy-700 rounded text-sand-400 text-[10px] font-mono">{sess.id}</span>
                    </h4>
                    <p className="text-[10px] text-sand-400 font-mono mt-1">Uptime: {sess.uptime} | RAM: {sess.memoryUsage}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-navy-700">
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-[10px] text-sand-400 uppercase font-mono">CPU Usage</div>
                      <div className="text-xs font-bold text-white font-mono">{sess.cpuUsage}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-sand-400 uppercase font-mono">Status</div>
                      <div className={`text-xs font-bold font-mono capitalize ${sess.status === 'idle' ? 'text-emerald-400' : sess.status === 'busy' ? 'text-warm-400 animate-pulse' : 'text-red-400'}`}>
                        {sess.status}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => terminateKernel(sess.id)}
                    disabled={sess.status === 'terminating'}
                    className="p-2.5 bg-navy-900 hover:bg-red-500/20 border border-navy-700 hover:border-red-500/40 text-sand-400 hover:text-red-400 rounded-xl transition-all shadow-md group"
                    title="Terminate Kernel VM"
                  >
                    {sess.status === 'terminating' ? <RefreshCw className="w-4 h-4 animate-spin text-red-400" /> : <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
