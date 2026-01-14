
const fs = require('fs');
const path = require('path');

function checkWriteIntegrity() {
    console.log('[WRITE-INTEGRITY] Testing Read-Only Hardening...');

    const appDir = '/usr/src/app'; // Inside container path
    const tmpDir = '/tmp';
    const testFile = path.join(tmpDir, `integrity-test-${Date.now()}.txt`);

    // 1. Check if /tmp is writable
    try {
        fs.writeFileSync(testFile, 'OK');
        const content = fs.readFileSync(testFile, 'utf8');
        if (content !== 'OK') throw new Error('Content mismatch in /tmp');
        fs.unlinkSync(testFile);
        console.log('[WRITE-INTEGRITY] /tmp is WRITABLE: PASS');
    } catch (err) {
        console.error(`[WRITE-INTEGRITY] /tmp is NOT WRITABLE: FAIL (${err.message})`);
        process.exit(1);
    }

    // 2. Check if appDir is Read-Only (only if inside container)
    // We can check if it fails to write a dummy file
    const roTestFile = path.join(process.cwd(), `ro-test-${Date.now()}.txt`);
    try {
        fs.writeFileSync(roTestFile, 'FAIL');
        // If we reach here, it's NOT Read-Only
        if (process.env.STRICT_HARDENING === 'true') {
            console.error('[WRITE-INTEGRITY] Code directory is WRITABLE while STRICT_HARDENING is on: FAIL');
            fs.unlinkSync(roTestFile);
            process.exit(1);
        } else {
            console.log('[WRITE-INTEGRITY] Code directory is WRITABLE (Development Mode)');
            fs.unlinkSync(roTestFile);
        }
    } catch (err) {
        if (err.code === 'EROFS' || err.code === 'EACCES') {
            console.log('[WRITE-INTEGRITY] Code directory is READ-ONLY: PASS');
        } else {
            console.warn(`[WRITE-INTEGRITY] Unexpected error checking RO: ${err.message}`);
        }
    }

    process.exit(0);
}

checkWriteIntegrity();
