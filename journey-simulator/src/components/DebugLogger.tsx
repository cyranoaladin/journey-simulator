import { useEffect, useState } from 'react';
import { generateStableKey } from '../utils/generateStableKey';

const DebugLogger = () => {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        // Extract log update function to reduce nesting
        const updateLogs = (type: string, message: string) => {
            setLogs(prev => [`[${type}] ${message}`, ...prev].slice(0, 20));
        };

        const addLog = (type: string, args: any[]) => {
            const message = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            setTimeout(() => updateLogs(type, message), 0);
        };

        console.log = (...args) => {
            originalLog(...args);
            addLog('LOG', args);
        };

        console.error = (...args) => {
            originalError(...args);
            addLog('ERR', args);
        };

        console.warn = (...args) => {
            originalWarn(...args);
            addLog('WARN', args);
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    return (
        <div className="fixed bottom-0 left-0 w-full h-64 bg-black/90 text-green-400 font-mono text-xs p-4 overflow-y-auto z-[9999] border-t border-green-500 pointer-events-none opacity-80">
            <h3 className="font-bold border-b border-green-500 mb-2">Debug Logs</h3>
            {logs.map((log) => {
                const logKey = generateStableKey({ text: log }, 'debug-log', ['text']);
                return (
                    <div key={logKey} className="mb-1">{log}</div>
                );
            })}
        </div>
    );
};

export default DebugLogger;
