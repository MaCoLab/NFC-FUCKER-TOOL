import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Cpu, ShieldAlert, Zap, Lock, Unlock, Activity, CheckCircle2, Server, Database, Wifi, HardDrive } from 'lucide-react';

const PASSWORD = "Maco2025";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [firmware, setFirmware] = useState('senza');
  const [systemTime, setSystemTime] = useState('');
  const [hexStream, setHexStream] = useState<string[]>([]);

  // Generate random hex data for background effect
  useEffect(() => {
    const interval = setInterval(() => {
      const newHex = Array.from({ length: 8 }, () => 
        Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()
      );
      setHexStream(newHex);
      
      const date = new Date();
      setSystemTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('ERR_AUTH_FAILED: Invalid security key.');
      setPasswordInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-cyan-500 font-mono relative overflow-x-hidden selection:bg-cyan-500/30">
      {/* Tech Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(2,6,23,1)_0%,rgba(2,6,23,0.8)_50%,rgba(2,6,23,1)_100%)] z-10"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        
        {/* Animated scanning line */}
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-1 bg-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.8)] z-20"
        />

        {/* Hex data stream on sides */}
        <div className="absolute left-4 top-20 bottom-0 w-24 hidden xl:flex flex-col gap-2 text-[10px] text-cyan-900/40 z-0 overflow-hidden">
          {hexStream.map((hex, i) => <div key={`l-${i}`}>0x{hex}</div>)}
        </div>
        <div className="absolute right-4 top-20 bottom-0 w-24 hidden xl:flex flex-col gap-2 text-[10px] text-cyan-900/40 z-0 overflow-hidden text-right">
          {hexStream.map((hex, i) => <div key={`r-${i}`}>0x{hex}</div>)}
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-20 p-4 md:p-6 min-h-screen flex flex-col">
        {/* Top Status Bar */}
        <div className="flex justify-between items-center border-b border-cyan-900/50 pb-2 mb-8 text-xs tracking-widest text-cyan-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2"><Activity size={12} className="animate-pulse text-cyan-400" /> SYS.ONLINE</span>
            <span className="hidden md:inline">NODE: ESP32-C3</span>
          </div>
          <div className="flex items-center gap-4">
            <span>T:{systemTime}</span>
            <span className="flex items-center gap-1"><Wifi size={12} /> UPLINK</span>
          </div>
        </div>

        <header className="mb-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex flex-col items-center"
          >
            {/* Logo Section */}
            <div className="mb-6 relative group">
              <div className="absolute -inset-4 bg-cyan-500/10 blur-xl rounded-full group-hover:bg-cyan-500/20 transition-all duration-500"></div>
              {/* Assuming the uploaded logo is named log.png or logo.png. Using a fallback styling if image fails to load */}
              <img 
                src="log.png" 
                alt="MACO LAB" 
                className="h-20 md:h-28 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                onError={(e) => {
                  // Fallback if image not found
                  (e.target as HTMLImageElement).style.display = 'none';
                  document.getElementById('logo-fallback')!.style.display = 'flex';
                }}
              />
              <div id="logo-fallback" className="hidden flex-col items-center justify-center relative z-10">
                <span className="text-4xl md:text-5xl font-bold text-white tracking-widest">MACO</span>
                <span className="text-xl md:text-2xl font-light text-cyan-400 tracking-[0.3em] mt-1">L A B .</span>
              </div>
            </div>

            <div className="inline-block border border-cyan-500/30 bg-cyan-950/30 px-6 py-2 rounded-none relative">
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>
              <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-cyan-50 uppercase">
                NFC_FUCKER <span className="text-cyan-500 font-light">//</span> FLASHER
              </h1>
            </div>
          </motion.div>
        </header>

        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.4 }}
              className="max-w-md w-full mx-auto mt-4"
            >
              <div className="bg-[#020617]/80 backdrop-blur-md border border-cyan-500/30 p-1 relative">
                {/* Tech Corners */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-500"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-500"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-500"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-500"></div>
                
                <div className="bg-cyan-950/20 p-8 border border-cyan-900/50">
                  <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-cyan-950/50 flex items-center justify-center mb-4 border border-cyan-500/30 relative">
                      <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
                      <Lock className="text-cyan-400 relative z-10" size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-cyan-50 tracking-widest uppercase">AREA RISERVATA</h2>
                    <p className="text-cyan-600 text-xs mt-2 text-center uppercase tracking-wider">Inserisci la password per accedere</p>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Terminal size={18} className="text-cyan-700 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input 
                          type="password" 
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          className="w-full bg-[#020617] border border-cyan-800 py-3.5 pl-11 pr-4 text-cyan-300 placeholder-cyan-800 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-mono uppercase tracking-widest"
                          placeholder="PASSWORD..."
                          autoFocus
                        />
                      </div>
                      {error && (
                        <motion.p 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-red-500 mt-3 text-xs flex items-center gap-2 bg-red-950/30 py-2 px-3 border border-red-900/50 uppercase tracking-wider"
                        >
                          <ShieldAlert size={14} /> {error}
                        </motion.p>
                      )}
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-bold py-3.5 uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                    >
                      <span>Accedi</span>
                      <Unlock size={16} className="group-hover:text-cyan-300" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1"
            >
              {/* Left Column: Instructions, Mac Support & Changelog */}
              <div className="lg:col-span-5 space-y-6">
                {/* Instructions Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#020617]/60 backdrop-blur-md border border-cyan-900/50 p-1 relative"
                >
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>
                  
                  <div className="bg-cyan-950/10 p-5">
                    <h3 className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2 uppercase tracking-widest border-b border-cyan-900/50 pb-2">
                      <Server size={16} />
                      Come_utilizzare
                    </h3>
                    <div className="space-y-3 font-mono text-xs">
                      {[
                        "Collega il dispositivo dalla porta dati",
                        "Seleziona il firmware desiderato in Payload_Configuration",
                        "Premi 'Connect' e seleziona il dispositivo",
                        "Premi 'Install' per avviare il flash"
                      ].map((step, i) => (
                        <div key={i} className="flex gap-3 items-start group">
                          <div className="text-cyan-600 mt-0.5">[{i + 1}]</div>
                          <p className="text-cyan-100/70 group-hover:text-cyan-300 transition-colors">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Mac OS Support Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[#020617]/60 backdrop-blur-md border border-blue-900/50 p-1 relative"
                >
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500"></div>
                  
                  <div className="bg-blue-950/10 p-5">
                    <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2 uppercase tracking-widest border-b border-blue-900/50 pb-2">
                      <Wifi size={16} />
                      Compatibilità_MacOS
                    </h3>
                    <div className="space-y-3 font-mono text-[10px] leading-relaxed text-blue-200/60">
                      <p>Se il dispositivo non viene rilevato su Mac:</p>
                      <ul className="space-y-2 list-none">
                        <li className="flex gap-2"><span className="text-blue-500">●</span> <span>Usa un cavo dati da <span className="text-blue-400">USB-A</span> a <span className="text-blue-400">USB-C</span> con adattatore.</span></li>
                        <li className="flex gap-2"><span className="text-blue-500">●</span> <span>macOS Ventura o superiori: Consenti accessori USB in <span className="text-blue-400">Privacy e Sicurezza</span>.</span></li>
                      <li className="flex gap-2"><span className="text-blue-500">●</span> <span>Se necessario, scarica ed installa i driver <span className="text-blue-400">CH340</span> per il chip seriale da <a href="https://github.com/adrianmihalko/ch340g-ch34g-ch34x-mac-os-x-driver"><span className="text-blue-400">QUI</span></a> .</span></li>
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Changelog Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#020617]/60 backdrop-blur-md border border-cyan-900/50 p-1 relative"
                >
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"></div>
                  
                  <div className="bg-cyan-950/10 p-5">
                    <h3 className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2 uppercase tracking-widest border-b border-cyan-900/50 pb-2">
                      <Database size={16} />
                      Change_Log
                    </h3>
                    
                    <div className="space-y-5 font-mono">
                      <div className="relative pl-3 border-l border-cyan-500">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-cyan-50 text-xs font-bold tracking-wider">&gt; V_1.3.2 release n.8 <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1 py-0.5 ml-2 border border-cyan-500/30">STABILE</span></h4>
                          <span className="text-[10px] text-cyan-600">03.02.2026</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-cyan-200/70">
                          <li className="flex items-start gap-2">
                            <span className="text-cyan-500">&gt;</span>
                            <span>Correzione "reset" delle microel</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-cyan-500">&gt;</span>
                            <span>Aggiunte nuove chiavi per utenti</span>
                          </li>
                        </ul>
                      </div>

                      <div className="relative pl-3 border-l border-cyan-900">
                        <h4 className="text-cyan-600 text-xs font-bold tracking-wider mb-2">&gt; PREV_VERSIONS</h4>
                        <ul className="grid grid-cols-1 gap-1.5 text-[10px] text-cyan-700">
                          <li className="flex items-center gap-2"><span>-</span>Aggiunta selezione del credito per Comestero</li>
                          <li className="flex items-center gap-2"><span>-</span>Aggiunta funzione God Mode per Comestero</li>
                          <li className="flex items-center gap-2"><span>-</span>Nuovi Vendor MyKey </li>
                          <li className="flex items-center gap-2"><span>-</span>Nuovo menu v2 </li>
                          <li className="flex items-center gap-2"><span>-</span>Correzione "reset" delle microel </li>
                          <li className="flex items-center gap-2"><span>-</span>Menu migliorato & Flash automatico</li>
                          <li className="flex items-center gap-2"><span>-</span>Traduzione in Italiano</li>
                          <li className="flex items-center gap-2"><span>-</span>Importazione Vendor ID (srix4k)</li>
                          <li className="flex items-center gap-2"><span>-</span>Feedback (vibrazione + led rgb)</li>
                          <li className="flex items-center gap-2"><span>-</span>Password all'avvio del dispositivo</li>
                          <li className="flex items-center gap-2"><span>-</span>Scelta firmware nel web flasher</li>
                          <li className="flex items-center gap-2"><span>-</span>Aggiunto supporto TREA</li>
                          <li className="flex items-center gap-2"><span>-</span>Corretta ricarica Comestero</li>
                          <li className="flex items-center gap-2"><span>-</span>Aggiunto supporto per ESP32-C3</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Flasher Interface */}
              <div className="lg:col-span-7">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#020617]/80 backdrop-blur-xl border border-cyan-500/30 p-1 relative h-full flex flex-col"
                >
                  {/* Tech Corners */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
                  
                  <div className="bg-cyan-950/10 p-6 md:p-8 flex-1 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                    
                    <h3 className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2 uppercase tracking-widest border-b border-cyan-900/50 pb-3">
                      <HardDrive size={18} />
                      Payload_Configuration
                    </h3>
                    
                    <div className="space-y-4 mb-4 flex-none">
                      <label 
                        className={`block cursor-pointer border p-4 transition-all duration-300 relative overflow-hidden ${
                          firmware === 'senza' 
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                            : 'border-cyan-900/50 bg-[#020617] hover:border-cyan-700'
                        }`}
                      >
                        {firmware === 'senza' && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]"></div>
                        )}
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 border flex items-center justify-center ${
                            firmware === 'senza' ? 'border-cyan-400' : 'border-cyan-800'
                          }`}>
                            {firmware === 'senza' && <div className="w-2 h-2 bg-cyan-400" />}
                          </div>
                          <div>
                            <span className={`font-bold tracking-widest uppercase block ${firmware === 'senza' ? 'text-cyan-50' : 'text-cyan-600'}`}>
                              FW_NO_PASSWORD <span className="text-[10px] ml-2 opacity-50">v1.3.2</span>
                            </span>
                            <p className={`mt-1 text-xs ${firmware === 'senza' ? 'text-cyan-300' : 'text-cyan-800'}`}>
                              Versione standard senza password di accesso all'avvio.
                            </p>
                          </div>
                        </div>
                        <input 
                          type="radio" 
                          name="firmware" 
                          value="senza" 
                          checked={firmware === 'senza'}
                          onChange={() => setFirmware('senza')}
                          className="sr-only"
                        />
                      </label>

                      <label 
                        className={`block cursor-pointer border p-4 transition-all duration-300 relative overflow-hidden ${
                          firmware === 'con' 
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                            : 'border-cyan-900/50 bg-[#020617] hover:border-cyan-700'
                        }`}
                      >
                        {firmware === 'con' && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]"></div>
                        )}
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 border flex items-center justify-center ${
                            firmware === 'con' ? 'border-cyan-400' : 'border-cyan-800'
                          }`}>
                            {firmware === 'con' && <div className="w-2 h-2 bg-cyan-400" />}
                          </div>
                          <div>
                            <span className={`font-bold tracking-widest uppercase block ${firmware === 'con' ? 'text-cyan-50' : 'text-cyan-600'}`}>
                              FW_SICURO <span className="text-[10px] ml-2 opacity-50">v1.3.2</span>
                            </span>
                            <p className={`mt-1 text-xs ${firmware === 'con' ? 'text-cyan-300' : 'text-cyan-800'}`}>
                              Versione protetta con password all'avvio (richiedere al produttore).
                            </p>
                          </div>
                        </div>
                        <input 
                          type="radio" 
                          name="firmware" 
                          value="con" 
                          checked={firmware === 'con'}
                          onChange={() => setFirmware('con')}
                          className="sr-only"
                        />
                      </label>
                    </div>

                    <div className="bg-[#020617] p-6 border border-cyan-900/50 flex flex-col items-center justify-center relative">
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                      
                      <div className="flex items-center gap-2 text-cyan-500/50 text-[10px] uppercase tracking-widest mb-6 w-full justify-center">
                        <span className="w-8 h-px bg-cyan-900"></span>
                        In attesa di connessione del dispositivo
                        <span className="w-8 h-px bg-cyan-900"></span>
                      </div>
                      
                      <div className="relative z-10 w-full flex justify-center">
                        {/* @ts-ignore */}
                        <esp-web-install-button 
                          manifest={firmware === 'senza' ? 'manifest_senza.json' : 'manifest_con.json'}
                        ></esp-web-install-button>
                      </div>
                    </div>

                    {/* Simulated Terminal */}
                    <div className="mt-6 bg-black/80 border border-cyan-900/30 p-3 font-mono text-[9px] text-cyan-700/60 h-24 overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px] pointer-events-none"></div>
                      <div className="animate-pulse mb-1 text-cyan-500/40">&gt;&gt; SYSTEM_READY: Awaiting serial handshake...</div>
                      <div>[ATTENZIONE!]Si ricorda che questo progetto ha il solo scopo informatico ed educativo, decliniamo qualsiasi responsabilità dall'uso illecito che ne farete.</div>
                      <div>[INFO] ESP32-C3 detected on COM3 / /dev/cu.usbserial-0001</div>
                      <div>[DEBUG] Baud rate set to 460800</div>
                      <div>[STATUS] Flash chip: GD25Q32 (4MB)</div>
                      <div className="flex gap-1">
                        <span className="text-cyan-400/30">root@maco-lab:~$</span>
                        <span className="w-1.5 h-3 bg-cyan-500/40 animate-pulse mt-0.5"></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
