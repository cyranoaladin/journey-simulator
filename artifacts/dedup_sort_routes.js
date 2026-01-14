#!/usr/bin/env node
/**
 * Deduplicate and sort routes from raw route visit log
 * Usage: node dedup_sort_routes.js <raw_file> <output_file>
 */

const fs = require('fs');

const rawFile = process.argv[2];
const outputFile = process.argv[3];

if (!rawFile || !outputFile) {
    console.error('Usage: node dedup_sort_routes.js <raw_file> <output_file>');
    process.exit(1);
}

try {
    const content = fs.readFileSync(rawFile, 'utf8');
    const lines = content.trim().split('\n');

    // Count occurrences
    const routeCounts = {};
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed) {
            routeCounts[trimmed] = (routeCounts[trimmed] || 0) + 1;
        }
    });

    // Get unique routes sorted
    const uniqueRoutes = Object.keys(routeCounts).sort();

    // Write deduplicated routes
    fs.writeFileSync(outputFile, uniqueRoutes.join('\n') + '\n', 'utf8');

    // Print stats
    console.log('=== Route Deduplication Stats ===');
    console.log(`Total visits: ${lines.length}`);
    console.log(`Unique routes: ${uniqueRoutes.length}`);
    console.log('');
    console.log('Route visit counts:');
    uniqueRoutes.forEach(route => {
        console.log(`  ${route}: ${routeCounts[route]} visit(s)`);
    });

} catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
}
