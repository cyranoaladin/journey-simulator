#!/usr/bin/env python3
"""
Check for zero-byte files in a directory
Usage: python3 check_zero_byte_files.py <directory>
"""

import os
import sys

def check_zero_byte_files(directory):
    zero_byte_files = []
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            filepath = os.path.join(root, file)
            try:
                if os.path.getsize(filepath) == 0:
                    # Make path relative to directory for readability
                    rel_path = os.path.relpath(filepath, directory)
                    zero_byte_files.append(rel_path)
            except OSError as e:
                print(f"Warning: Could not check {filepath}: {e}", file=sys.stderr)
    
    print("=== Zero-Byte File Check ===")
    if zero_byte_files:
        print(f"Found {len(zero_byte_files)} zero-byte file(s):")
        for f in sorted(zero_byte_files):
            print(f"  - {f}")
        print(f"\nZERO_BYTE_FILES_FOUND={len(zero_byte_files)}")
        return len(zero_byte_files)
    else:
        print("✅ No zero-byte files found")
        print("\nZERO_BYTE_FILES_FOUND=0")
        return 0

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 check_zero_byte_files.py <directory>", file=sys.stderr)
        sys.exit(1)
    
    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Error: {directory} is not a valid directory", file=sys.stderr)
        sys.exit(1)
    
    count = check_zero_byte_files(directory)
    sys.exit(0)  # Always exit 0, let caller check ZERO_BYTE_FILES_FOUND value
