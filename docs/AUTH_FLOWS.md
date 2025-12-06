
## Typed Client & OpenAPI for mf-back

To improve reliability and developer experience, the interaction between `journey-simulator` and `mf-back` is now strictly typed.

-   **Spec**: `docs/openapi/mf-back.openapi.yaml`
-   **Client**: `journey-simulator/src/api/mf-back-client.ts` (Generated)
-   **Wrapper**: `journey-simulator/src/api/mf-back.ts`

The wallet login flow uses this typed client to ensure the challenge-response protocol is correctly implemented.
