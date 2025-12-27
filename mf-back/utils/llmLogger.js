/**
 * LLM Tracing Logger
 * 
 * Structured logging for all LLM/Agent interactions
 * Tracks: userId, journeyId, agent, duration, tokens, success/failure
 */

const fs = require('node:fs');
const path = require('node:path');

class LLMLogger {
    constructor() {
        this.logsDir = path.join(__dirname, '../logs');
        this.ensureLogsDirectory();
    }

    ensureLogsDirectory() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }

    /**
     * Log an LLM/Agent run
     * @param {Object} data - Run data
     * @param {string} data.userId - User ID
     * @param {string} data.journeyId - Journey ID
     * @param {string} data.phase - Current phase
     * @param {string} data.agent - Agent name
     * @param {number} data.duration - Duration in ms
     * @param {number} data.tokens - Tokens used
     * @param {boolean} data.success - Success status
     * @param {string} data.error - Error message (if any)
     * @param {Object} data.metadata - Additional metadata
     */
    logRun(data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            userId: data.userId || 'unknown',
            journeyId: data.journeyId || 'unknown',
            phase: data.phase || 'unknown',
            agent: data.agent || 'unknown',
            duration: data.duration || 0,
            tokens: data.tokens || 0,
            success: data.success !== undefined ? data.success : true,
            error: data.error || null,
            metadata: data.metadata || {}
        };

        // Log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.log('[LLM Run]', JSON.stringify(logEntry, null, 2));
        }

        // Write to file
        const logFile = path.join(
            this.logsDir,
            `llm-runs-${new Date().toISOString().split('T')[0]}.jsonl`
        );

        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

        return logEntry;
    }

    /**
     * Log an error
     */
    logError(data) {
        return this.logRun({
            ...data,
            success: false
        });
    }

    /**
     * Get logs for a specific journey
     */
    async getJourneyLogs(journeyId, limit = 50) {
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(this.logsDir, `llm-runs-${today}.jsonl`);

        if (!fs.existsSync(logFile)) {
            return [];
        }

        const lines = fs.readFileSync(logFile, 'utf-8').split('\n').filter(Boolean);
        const logs = lines
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return null;
                }
            })
            .filter(log => log && log.journeyId === journeyId)
            .slice(-limit);

        return logs;
    }

    /**
     * Get aggregate stats
     */
    async getStats(userId = null, startDate = null, endDate = null) {
        // This would query all log files in the date range
        // For now, just return today's stats
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(this.logsDir, `llm-runs-${today}.jsonl`);

        if (!fs.existsSync(logFile)) {
            return {
                totalRuns: 0,
                successRate: 0,
                avgDuration: 0,
                totalTokens: 0
            };
        }

        const lines = fs.readFileSync(logFile, 'utf-8').split('\n').filter(Boolean);
        const logs = lines
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return null;
                }
            })
            .filter(Boolean);

        const filtered = userId
            ? logs.filter(log => log.userId === userId)
            : logs;

        const totalRuns = filtered.length;
        const successfulRuns = filtered.filter(log => log.success).length;
        const totalDuration = filtered.reduce((sum, log) => sum + log.duration, 0);
        const totalTokens = filtered.reduce((sum, log) => sum + log.tokens, 0);

        return {
            totalRuns,
            successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
            avgDuration: totalRuns > 0 ? totalDuration / totalRuns : 0,
            totalTokens
        };
    }
}

// Singleton instance
const llmLogger = new LLMLogger();

module.exports = llmLogger;
