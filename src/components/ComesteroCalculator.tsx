import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Copy, Download, ArrowLeft, AlertCircle, CheckCircle2, Info } from 'lucide-react';

// Costanti per Key A (dal foglio, colonna W righe 7-21)
const CONSTANTI_A: Record<number, string> = {
    1: "11C91ACEED1F",
    2: "124C7E54A8D1", 
    3: "131EAED53298",
    4: "149109BEC13A",
    5: "150B87026A78",
    6: "167090C2ACFB",
    7: "17DD13177F6F",
    8: "18CE625E7E80",
    9: "192BF3270B1A",
    10: "1A63DF34C7B7",
    11: "1B5DE72D4ED1",
    12: "1C259A2DCC39",
    13: "1D2691000BA8",
    14: "1EC4CB8AC386",
    15: "1FF64D61E854"
};

// Costanti per Key B (dal foglio, colonna W righe 70-100)
const CONSTANTI_B: Record<number, string> = {
    0: "000000000000",  // settore 0b
    1: "01B28EECB43B",
    2: "02321F1373B0",
    3: "0344B2D630D5",
    4: "04030961AB6E",
    5: "05BB6A7272B2",
    6: "066BE7C666DF",
    7: "0774080A207D",
    8: "0855937E2FFD",
    9: "09B336AAF081",
    10: "0A36B2CA4779",
    11: "0B6C101D0B33",
    12: "0C5D7512692B",
    13: "0DA26CFE5665",
    14: "0E6D10E2FF85",
    15: "0FC37ED8FA5C"
};

const KEY_A_SETTORE_0 = "A0A1A2A3A4A5";

interface ResultRow {
    keyA: string;
    keyB: string;
}

export default function ComesteroCalculator({ onBack }: { onBack: () => void }) {
    const [uid, setUid] = useState('');
    const [knownKey, setKnownKey] = useState('');
    const [keyType, setKeyType] = useState<'A' | 'B'>('B');
    const [sector, setSector] = useState(0);
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
            risultato += xor.toString(16).padStart(2, '0').toUpperCase();
        }
        return risultato;
    };

    const validate = () => {
        const hexRegex = /^[0-9A-Fa-f]+$/;
        if (!uid || uid.length !== 8 || !hexRegex.test(uid)) {
            setError("L'UID deve essere di 8 caratteri esadecimali.");
            return false;
        }
        if (!knownKey || knownKey.length !== 12 || !hexRegex.test(knownKey)) {
            setError("La chiave nota deve essere di 12 caratteri esadecimali (6 byte).");
            return false;
        }
        if (sector < 0 || sector > 15) {
            setError("Il settore deve essere compreso tra 0 e 15.");
            return false;
        }
        if (keyType === 'A') {
            setError("Per il calcolo è necessaria una Key B come chiave nota. Fornisci una Key B di un settore qualsiasi.");
            return false;
        }
        return true;
    };

    const handleCalculate = () => {
        setError(null);
        if (!validate()) return;

        setCalculating(true);
        
        // Simulate calculation delay for UI feedback
        setTimeout(() => {
            try {
                const uidUpper = uid.toUpperCase();
                const keyUpper = knownKey.toUpperCase();
                
                let keyB_settore0;
                if (sector === 0) {
                    keyB_settore0 = keyUpper;
                } else {
                    const costanteBX = CONSTANTI_B[sector];
                    const chiaveBaseCalcolata = xorHex(keyUpper, costanteBX);
                    keyB_settore0 = xorHex(chiaveBaseCalcolata, CONSTANTI_B[0]);
                }

                const newResults: Record<number, ResultRow> = {};
                
                for (let s = 0; s <= 15; s++) {
                    newResults[s] = {
                        keyA: s === 0 ? KEY_A_SETTORE_0 : xorHex(KEY_A_SETTORE_0, CONSTANTI_A[s]),
                        keyB: s === 0 ? keyB_settore0 : xorHex(keyB_settore0, CONSTANTI_B[s])
                    };
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
        testo += "     CALCOLATORE CHIAVI COMESTERO\n";
        testo += "=============================================\n\n";
        testo += `Data e ora: ${dataOra}\n`;
        testo += `UID: ${uid.toUpperCase()}\n`;
        testo += `Chiave nota: ${knownKey.toUpperCase()} (Tipo ${keyType}, Settore ${sector})\n\n`;
        testo += "=============================================\n";
        testo += " SETTORE | KEY A             | KEY B\n";
        testo += "=============================================\n";
        
        for (let s = 0; s <= 15; s++) {
            testo += `   ${s.toString().padStart(2, ' ')}   | ${results[s].keyA} | ${results[s].keyB}\n`;
        }
        
        testo += "=============================================\n";
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
        a.download = `chiavi_comestero_${uid.toUpperCase()}_${new Date().toISOString().slice(0,10)}.txt`;
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
                    Comestero_Key_Gen_v1.0
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
                            <h2 className="text-xl font-bold text-cyan-50 tracking-widest uppercase">Calcolatore Chiavi COMESTERO</h2>
                            <p className="text-cyan-600 text-xs mt-1 uppercase tracking-wider">Generazione chiavi settori 0-15 per sistemi Mifare Classic</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-cyan-500 uppercase tracking-widest mb-1.5 ml-1">UID Carta (8 hex)</label>
                                <input 
                                    type="text" 
                                    value={uid}
                                    onChange={(e) => setUid(e.target.value.toUpperCase())}
                                    maxLength={8}
                                    className="w-full bg-[#020617] border border-cyan-800 py-2.5 px-4 text-cyan-300 placeholder-cyan-900 focus:outline-none focus:border-cyan-400 transition-all font-mono uppercase tracking-widest text-sm"
                                    placeholder="Inserisci UID"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-cyan-500 uppercase tracking-widest mb-1.5 ml-1">Chiave Nota (12 hex)</label>
                                <input 
                                    type="text" 
                                    value={knownKey}
                                    onChange={(e) => setKnownKey(e.target.value.toUpperCase())}
                                    maxLength={12}
                                    className="w-full bg-[#020617] border border-cyan-800 py-2.5 px-4 text-cyan-300 placeholder-cyan-900 focus:outline-none focus:border-cyan-400 transition-all font-mono uppercase tracking-widest text-sm"
                                    placeholder="Inserisci chiave"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-cyan-500 uppercase tracking-widest mb-1.5 ml-1">Tipo Chiave</label>
                                <select 
                                    value={keyType}
                                    onChange={(e) => setKeyType(e.target.value as 'A' | 'B')}
                                    className="w-full bg-[#020617] border border-cyan-800 py-2.5 px-4 text-cyan-300 focus:outline-none focus:border-cyan-400 transition-all font-mono uppercase tracking-widest text-sm appearance-none cursor-pointer"
                                >
                                    <option value="A">Tipo A</option>
                                    <option value="B">Tipo B</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-cyan-500 uppercase tracking-widest mb-1.5 ml-1">Settore Chiave Nota</label>
                                <input 
                                    type="number" 
                                    min={0}
                                    max={15}
                                    value={sector}
                                    onChange={(e) => setSector(parseInt(e.target.value) || 0)}
                                    className="w-full bg-[#020617] border border-cyan-800 py-2.5 px-4 text-cyan-300 focus:outline-none focus:border-cyan-400 transition-all font-mono uppercase tracking-widest text-sm"
                                />
                            </div>
                        </div>
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
                                <span>La Key A del settore 0 è sempre A0A1A2A3A4A5 per tutti i sistemi.</span>
                            </div>
                            <div className="flex items-start gap-2 text-[10px] text-cyan-600 uppercase tracking-widest">
                                <Info size={12} className="shrink-0 mt-0.5" />
                                <span>Per il calcolo è necessaria una Key B nota di un qualsiasi settore (consigliato settore 0).</span>
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
