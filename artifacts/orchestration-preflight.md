# Orchestration Preflight Checks

- Timestamp: 2026-01-03T22:50:00Z
- Profile: PROFILE_B (local prod-like services)

## Health Endpoint

Command:
```
curl -s -o /tmp/mfai-health.txt -w "%{http_code}\n" http://127.0.0.1:3002/health
```

Output:
```
200
```

Sanitized Body (`/tmp/mfai-health.txt`):
```
{"status":"ok","env":"development"}
```

## Auth Storage State

Command:
```
ls -l journey-simulator/test-results/.auth/user.json
```

Output:
```
-rw-rw-r-- 1 *** *** 966 2026-01-03T21:37:00Z journey-simulator/test-results/.auth/user.json
```
