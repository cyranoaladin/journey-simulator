#!/bin/bash
rg "ey[A-Za-z0-9_-]{10,}" journey-simulator mf-back | grep -v "node_modules" | grep -v "dist" || true
