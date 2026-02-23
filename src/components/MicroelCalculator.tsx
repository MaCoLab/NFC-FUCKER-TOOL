import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Copy, Download, ArrowLeft, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const COSTANTE_BASE = "20B386540AD8";
const COSTANTE_BYTES = COSTANTE_BASE.split('');
const CHIAVE_DEFAULT = "FFFFFFFFFFFF";

interface ResultRow {
    keyA: string;
    keyB: string;
}

export default function MicroelCalculator({ onBack }: { onBack: () => void }) {
    const [uid, setUid] = useState('');
    const [results, setResults] = useState<Record<number, ResultRow> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [calculating, setCalculating] = useState(false);

    const xorHex = (hex1: string, hex2: string) => {
        if (hex1.length !== hex2.length) {
            throw new Error("Le stringhe hex devono avere la stessa lunghezza");
        }
        
        let risultato = "";
        for (let i = 0; i < hex1.length; i += 2) {
            const byte1 = parseInt(hex1.substr(i, 2), 16);
            const byte2 = parseInt(hex2.substr(i, 2), 16);
            const xor = byte1 ^ byte2;
            risultato += xor.toString(16).toUpperCase().padStart(2, '0');
        }
        return risultato;
    };

    const validate = () => {
        const hexRegex = /^[0-9A-Fa-f]+$/;
        if (!uid || uid.length !== 8 || !hexRegex.test(uid)) {
            setError("L'UID deve essere di 8 caratteri esadecimali.");
            return false;
        }
        return true;
    };

    const handleCalculate = () => {
        setError(null);
        if (!validate()) return;

        setCalculating(true);
        
        setTimeout(() => {
            try {
                const uidUpper = uid.toUpperCase();
                
                // PASSO 1: Converti UID in byte decimali
                const byte1 = parseInt(uidUpper.substring(0, 2), 16);
                const byte2 = parseInt(uidUpper.substring(2, 4), 16);
                const byte3 = parseInt(uidUpper.substring(4, 6), 16);
                const byte4 = parseInt(uidUpper.substring(6, 8), 16);
                
                // PASSO 2: Calcola somma + 33
                const somma = byte1 + byte2 + byte3 + byte4 + 33;
                
                // PASSO 3: Modulo 256
                const valore = somma % 256;
                
                // PASSO 4: Converti in hex a 2 caratteri
                const hexValore = valore.toString(16).toUpperCase().padStart(2, '0');
                
                // PASSO 5: Dividi in due caratteri
                const char1 = hexValore[0];
                const char2 = hexValore[1];
                
                const valChar1 = parseInt(char1, 16);
                const valChar2 = parseInt(char2, 16);
                
                // PASSO 6: Calcola Key A (per settori 0 e 1)
                let keyA = "";
                for (let i = 0; i < 12; i++) {
                    const valCostante = parseInt(COSTANTE_BYTES[i], 16);
                    const valXOR = (i % 2 === 0) ? valChar1 : valChar2;
                    const xor = valCostante ^ valXOR;
                    keyA += xor.toString(16).toUpperCase();
                }
                
                // PASSO 7: Calcola Key B del settore 0
                const keyB0 = xorHex(keyA, "FF88FF9FFF0F");
                
                const newResults: Record<number, ResultRow> = {};
                for (let s = 0; s <= 15; s++) {
                    if (s === 0) {
                        newResults[s] = {
                            keyA: keyA,
                            keyB: keyB0
                        };
                    } else if (s === 1) {
                        newResults[s] = {
                            keyA: keyA,
                            keyB: keyA
                        };
                    } else {
                        newResults[s] = {
                            keyA: CHIAVE_DEFAULT,
                            keyB: CHIAVE_DEFAULT
                        };
                    }
                }

                setResults(newResults);
            } catch (err: any) {
                setError(err.message || "Errore durante il calcolo.");
            } finally {
                setCalculating(false);
            }
        }, 600);
    };

    const formatResultsText = () => {
        if (!results) return "";
        const dataOra = new Date().toLocaleString();
        
        let testo = "=============================================\n";
        testo += "       CALCOLATORE CHIAVI MICROEL\n";
        testo += "=============================================\n\n";
        testo += `Data e ora: ${dataOra}\n`;
        testo += `UID: ${uid.toUpperCase()}\n\n`;
        testo += "=============================================\n";
        testo += " SETTORE | KEY A           | KEY B\n";
        testo += "=============================================\n";
        
        for (let s = 0; s <= 15; s++) {
            testo += `    ${s.toString().padStart(2, ' ')}   | ${results[s].keyA} | ${results[s].keyB}\n`;
        }
        
        testo += "=============================================\n";
        testo += "\nChiave default: FFFFFFFFFFFF\n";
        return testo;
    };

    const formatKeysOnly = () => {
        if (!results) return "";
        let testo = "";
        for (let s = 0; s <= 15; s++) {
            testo += `${results[s].keyA}\n${results[s].keyB}\n`;
        }
        return testo.trim();
    };

    const handleCopy = () => {
        const text = formatKeysOnly();
        navigator.clipboard.writeText(text);
        alert("Chiavi copiate nella clipboard!");
    };

    const handleExport = () => {
        const text = formatResultsText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chiavi_microel_${uid.toUpperCase()}_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto space-y-6"
        >
            <div className="flex items-center justify-between mb-4">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-cyan-500 hover:text-cyan-300 transition-colors text-sm uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> Torna al Flasher
                </button>
                <div className="text-[10px] text-cyan-700 uppercase tracking-widest">
                    Microel_Key_Gen_v1.0
                </div>
            </div>

            <div className="bg-[#020617]/80 backdrop-blur-xl border border-cyan-500/30 p-1 relative">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

                <div className="bg-cyan-950/10 p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-6 border-b border-cyan-900/50 pb-4">
                        <div className="w-12 h-12 bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                            <Calculator className="text-cyan-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-cyan-50 tracking-widest uppercase">Calcolatore Chiavi MICROEL</h2>
                            <p className="text-cyan-600 text-xs mt-1 uppercase tracking-wider">Generazione chiavi settori 0-15 per sistemi Microel</p>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto mb-8">
                        <label className="block text-[10px] text-cyan-500 uppercase tracking-widest mb-1.5 ml-1">UID Carta (8 hex)</label>
                        <input 
                            type="text" 
                            value={uid}
                            onChange={(e) => setUid(e.target.value.toUpperCase())}
                            maxLength={8}
                            className="w-full bg-[#020617] border border-cyan-800 py-2.5 px-4 text-cyan-300 placeholder-cyan-900 focus:outline-none focus:border-cyan-400 transition-all font-mono uppercase tracking-widest text-sm"
                            placeholder="Inserire UID"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        {error && (
                            <div className="bg-red-950/30 border border-red-900/50 p-3 flex items-start gap-3 text-red-400 text-xs uppercase tracking-wider">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="bg-cyan-950/20 border border-cyan-900/30 p-4 space-y-2">
                            <div className="flex items-start gap-2 text-[10px] text-cyan-600 uppercase tracking-widest">
                                <Info size={12} className="shrink-0 mt-0.5" />
                                <span>Le chiavi MICROEL sono di 6 byte (12 caratteri esadecimali).</span>
                            </div>
                            <div className="flex items-start gap-2 text-[10px] text-cyan-600 uppercase tracking-widest">
                                <Info size={12} className="shrink-0 mt-0.5" />
                                <span>La chiave di default per tutti i settori è FFFFFFFFFFFF.</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleCalculate}
                            disabled={calculating}
                            className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-bold py-4 uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {calculating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Calcolo in corso...</span>
                                </>
                            ) : (
                                <>
                                    <span>Calcola tutte le chiavi</span>
                                    <CheckCircle2 size={18} className="group-hover:text-cyan-300" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {results && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#020617]/80 backdrop-blur-xl border border-cyan-500/30 p-1 relative"
                >
                    <div className="bg-cyan-950/10 p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-xs">
                                <thead>
                                    <tr className="border-b border-cyan-900/50 text-cyan-500 uppercase tracking-widest">
                                        <th className="py-3 px-4">Settore</th>
                                        <th className="py-3 px-4">Key A</th>
                                        <th className="py-3 px-4">Key B</th>
                                    </tr>
                                </thead>
                                <tbody className="text-cyan-100/80">
                                    {results && Object.entries(results).map(([s, keys]) => (
                                        <tr key={s} className="border-b border-cyan-900/20 hover:bg-cyan-500/5 transition-colors">
                                            <td className="py-2.5 px-4 text-cyan-600 font-bold">{s.padStart(2, '0')}</td>
                                            <td className="py-2.5 px-4 tracking-widest">{(keys as ResultRow).keyA}</td>
                                            <td className="py-2.5 px-4 tracking-widest">{(keys as ResultRow).keyB}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-cyan-900/50">
                            <button 
                                onClick={handleCopy}
                                className="flex items-center justify-center gap-2 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800 text-cyan-400 py-3 text-xs uppercase tracking-widest transition-all"
                            >
                                <Copy size={16} /> 📋 Copia tutto
                            </button>
                            <button 
                                onClick={handleExport}
                                className="flex items-center justify-center gap-2 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800 text-cyan-400 py-3 text-xs uppercase tracking-widest transition-all"
                            >
                                <Download size={16} /> 💾 Esporta come TXT
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
