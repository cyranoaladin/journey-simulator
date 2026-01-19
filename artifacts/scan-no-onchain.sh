#!/bin/bash
rg "sendTransaction|signTransaction" journey-simulator | grep -v "node_modules" || true
