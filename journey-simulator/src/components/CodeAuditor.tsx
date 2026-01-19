/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Code, Zap } from 'lucide-react';

interface Vulnerability {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    type: string;
    line: number;
    description: string;
    fix?: string;
}

interface CodeAuditorProps {
    code?: string;
    vulnerabilities?: Vulnerability[];
    onComplete?: (results: { score: number; vulnerabilities: Vulnerability[] }) => void;
}

const SAMPLE_CODE = `use anchor_lang::prelude::*;

#[program]
pub mod token_vault {
    use super::*;
    
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        // VULNERABILITY: Missing access control check
        let vault = &mut ctx.accounts.vault;
        vault.balance -= amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    pub user: Signer<'info>,
}`;

const VULNERABILITIES: Vulnerability[] = [
    {
        id: 'vuln-1',
        severity: 'critical',
        type: 'Missing Access Control',
        line: 8,
        description: 'Withdrawal function lacks owner verification. Any user can drain the vault.',
        fix: 'Add constraint: require!(vault.owner == user.key(), ErrorCode::Unauthorized);'
    },
    {
        id: 'vuln-2',
        severity: 'high',
        type: 'Integer Underflow',
        line: 10,
        description: 'Unchecked subtraction can cause underflow if amount > balance.',
        fix: 'Use checked_sub() or add balance validation before subtraction.'
    },
    {
        id: 'vuln-3',
        severity: 'medium',
        type: 'Missing Event Emission',
        line: 8,
        description: 'No event emitted for withdrawal tracking and transparency.',
        fix: 'Emit WithdrawalEvent with amount and timestamp.'
    }
];

export default function CodeAuditor({ code = SAMPLE_CODE, vulnerabilities = VULNERABILITIES, onComplete }: CodeAuditorProps) {
    const [scanning, setScanning] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [foundVulns, setFoundVulns] = useState<Vulnerability[]>([]);
    const [selectedVuln, setSelectedVuln] = useState<string | null>(null);

    const handleScan = () => {
        setScanning(true);
        setFoundVulns([]);

        // Simulate progressive vulnerability detection
        const delays = [800, 1400, 2000];
        vulnerabilities.forEach((vuln, idx) => {
            setTimeout(() => {
                setFoundVulns(prev => [...prev, vuln]);
                if (idx === vulnerabilities.length - 1) {
                    setScanning(false);
                    setScanned(true);

                    // Calculate security score (100 - severity penalties)
                    const score = 100 - (
                        vulnerabilities.filter(v => v.severity === 'critical').length * 30 +
                        vulnerabilities.filter(v => v.severity === 'high').length * 20 +
                        vulnerabilities.filter(v => v.severity === 'medium').length * 10 +
                        vulnerabilities.filter(v => v.severity === 'low').length * 5
                    );

                    if (onComplete) {
                        onComplete({ score, vulnerabilities: vulnerabilities });
                    }
                }
            }, delays[idx]);
        });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/40';
            case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/40';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
            case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
            default: return 'text-white/60 bg-white/10 border-white/20';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
            case 'high':
                return <AlertTriangle size={16} />;
            case 'medium':
                return <Shield size={16} />;
            default:
                return <CheckCircle size={16} />;
        }
    };

    return (
        <div data-testid="code-auditor" className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent-cyan flex items-center gap-2">
                    <Code size={18} className="text-accent-cyan" />
                    Rust/Anchor Security Auditor
                </h3>
                <span className="text-[10px] font-mono text-white/40">STATIC_ANALYSIS_V2</span>
            </div>

            {/* Code Display */}
            <div className="bg-black/60 rounded-lg p-4 mb-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2 text-[10px] text-white/40 font-mono">
                    <Zap size={12} />
                    <span>token_vault.rs</span>
                </div>
                <pre className="text-xs font-mono text-white/80 overflow-x-auto whitespace-pre">
                    {code}
                </pre>
            </div>

            {/* Scan Button */}
            {!scanned && (
                <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-[var(--color-zyno)] to-accent-purple text-white font-bold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-zyno)]/20"
                >
                    {scanning ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Shield size={16} />
                            </motion.div>
                            Scanning for vulnerabilities...
                        </>
                    ) : (
                        <>
                            <Shield size={16} />
                            Run Security Audit
                        </>
                    )}
                </button>
            )}

            {/* Vulnerabilities List */}
            <AnimatePresence>
                {foundVulns.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 space-y-2"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-white/70">
                                Detected Vulnerabilities ({foundVulns.length})
                            </h4>
                            {scanned && (
                                <div className="text-xs font-mono">
                                    Security Score: <span className="text-red-400 font-bold">
                                        {100 - (foundVulns.filter(v => v.severity === 'critical').length * 30 +
                                            foundVulns.filter(v => v.severity === 'high').length * 20 +
                                            foundVulns.filter(v => v.severity === 'medium').length * 10)}/100
                                    </span>
                                </div>
                            )}
                        </div>

                        {foundVulns.map((vuln, idx) => (
                            <motion.div
                                key={vuln.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedVuln === vuln.id
                                    ? 'bg-white/10 border-accent-cyan'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                                onClick={() => setSelectedVuln(selectedVuln === vuln.id ? null : vuln.id)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${getSeverityColor(vuln.severity)}`}>
                                                {getSeverityIcon(vuln.severity)}
                                                {vuln.severity}
                                            </span>
                                            <span className="text-xs font-mono text-white/60">Line {vuln.line}</span>
                                        </div>
                                        <h5 className="text-sm font-semibold text-white mb-1">{vuln.type}</h5>
                                        <p className="text-xs text-white/70">{vuln.description}</p>

                                        {selectedVuln === vuln.id && vuln.fix && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-3 pt-3 border-t border-white/10"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle size={14} className="text-green-400" />
                                                    <span className="text-[10px] font-semibold uppercase tracking-wide text-green-400">
                                                        Recommended Fix
                                                    </span>
                                                </div>
                                                <code className="block text-xs font-mono text-green-300/90 bg-green-500/10 rounded p-2 border border-green-500/20">
                                                    {vuln.fix}
                                                </code>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reset Button */}
            {scanned && (
                <button
                    onClick={() => {
                        setScanned(false);
                        setFoundVulns([]);
                        setSelectedVuln(null);
                    }}
                    className="w-full mt-4 px-4 py-2 rounded-lg border border-white/10 text-white/80 text-sm hover:bg-white/5 transition-colors"
                >
                    Reset Audit
                </button>
            )}
        </div>
    );
}
