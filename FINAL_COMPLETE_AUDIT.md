# 🛡️ AUDIT TECHNIQUE EXHAUSTIF : MFAI-Monorepo
*Généré le : 31/12/2025 07:59*

## 📊 Tableau de Bord
| Métrique | Valeur |
| :--- | :--- |
| **Bugs** | 0 |
| **Dette** | 43.0h |
| **Issues Totales** | 315 |
| **Hotspots** | 0 |

## 🚩 Security Hotspots (Revue Manuelle)
| Fichier | Risque | Ligne |
| :--- | :--- | :--- |

## 📂 Détail Complet des Issues
### 📄 `journey-simulator/src/components/Journey/JourneySimulationMode.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 103 |
| MINOR | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 104 |

### 📄 `journey-simulator/src/components/Journey/PhaseInteractionBlock.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | 'source?.id ?? source?.title ?? source?.url ?? `source-${source?.title ?? 'unknown'}`' will use Object's default stringification format ('[object Object]') when stringified. | 69 |

### 📄 `journey-simulator/src/components/Journey/PhaseSection.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 328 |

### 📄 `journey-simulator/src/components/Journey/__tests__/JourneyCard.test.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | "symbol" | "object" | "map" | "filter" | "search" | "big" | "link" | "small" | "sub" | "sup" | "text" | "set" | "body" | "head" | "header" | "path" | "data" | "article" | "video" | "template" | "textarea" | "select" | "center" | "a" | "abbr" | "address" | "area" | "aside" | "audio" | "b" | "base" | "bdi" | "bdo" | "blockquote" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "footer" | "form" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "keygen" | "label" | "legend" | "li" | "main" | "mark" | "menu" | "menuitem" | "meta" | "meter" | "nav" | "noindex" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "progress" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "slot" | "script" | "section" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "track" | "u" | "ul" | "var" | "wbr" | "webview" | "animate" | "circle" | "defs" | "desc" | "ellipse" | "g" | "image" | "line" | "marker" | "mask" | "metadata" | "pattern" | "polygon" | "polyline" | "rect" | "st... | 38 |

### 📄 `journey-simulator/src/components/Journey/__tests__/JourneyWorkspace.test.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 183 |
| MINOR | CODE_SMELL | The empty object is useless. | 14 |

### 📄 `journey-simulator/src/components/Journey/__tests__/NFTIntegration.test.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | The empty object is useless. | 15 |

### 📄 `journey-simulator/src/components/Layout/JourneyLayout.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 6 |

### 📄 `journey-simulator/src/components/LoginPage.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 23 |

### 📄 `journey-simulator/src/components/NFTMintingModal.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | The catch parameter `backendErr` should be named `error_`. | 107 |

### 📄 `journey-simulator/src/components/RegisterPage.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 38 |

### 📄 `journey-simulator/src/components/ShareModal.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | 'XIcon' is deprecated. | 84 |
| MINOR | CODE_SMELL | 'Twitter' is deprecated. | 3 |
| MINOR | CODE_SMELL | 'Linkedin' is deprecated. | 3 |
| MINOR | CODE_SMELL | 'Linkedin' is deprecated. | 94 |

### 📄 `journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Unnecessary use of conditional expression for default assignment. | 1151 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 982 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 54 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 81 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 109 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 232 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 405 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 524 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 700 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 717 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 756 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 879 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 917 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 1018 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 1069 |
| MINOR | CODE_SMELL | Prefer using nullish coalescing operator (`??=`) instead of an assignment expression, as it is simpler to read. | 43 |

### 📄 `journey-simulator/src/components/WalletStatusDisplay.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Unexpected negated condition. | 90 |

### 📄 `journey-simulator/src/components/Zyno/AgentFeedbackModal.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 33 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 48 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 56 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 59 |

### 📄 `journey-simulator/src/components/Zyno/AgentLogViewer.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 72 |

### 📄 `journey-simulator/src/components/Zyno/AgentScoreboardContext.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 42 |

### 📄 `journey-simulator/src/components/Zyno/ResourceUploader.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Ambiguous spacing before next element input | 178 |

### 📄 `journey-simulator/src/components/Zyno/ZynoConsole.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Move this component definition out of the parent component and pass data as props. | 387 |
| MAJOR | CODE_SMELL | Move this component definition out of the parent component and pass data as props. | 451 |
| MAJOR | CODE_SMELL | Move this component definition out of the parent component and pass data as props. | 487 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 223 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 226 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 238 |
| MINOR | CODE_SMELL | arrow function is equivalent to `Boolean`. Use `Boolean` directly. | 542 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 122 |

### 📄 `journey-simulator/src/components/Zyno/ZynoDecisionPanel.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 26 |

### 📄 `journey-simulator/src/components/Zyno/ZynoMissionFlow.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 6 |

### 📄 `journey-simulator/src/components/Zyno/__tests__/ZynoConsole.test.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | The object passed as the value prop to the Context provider changes every render. To fix this consider wrapping it in a useMemo hook. | 62 |

### 📄 `journey-simulator/src/components/Zyno/agent-card.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 24 |

### 📄 `journey-simulator/src/components/__tests__/WalletButton.test.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 79 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 90 |

### 📄 `journey-simulator/src/components/layout/Footer.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | 'XIcon' is deprecated. | 13 |
| MINOR | CODE_SMELL | 'XIcon' is deprecated. | 111 |
| MINOR | CODE_SMELL | 'Twitter' is deprecated. | 2 |
| MINOR | CODE_SMELL | 'Github' is deprecated. | 2 |
| MINOR | CODE_SMELL | 'Github' is deprecated. | 15 |
| MINOR | CODE_SMELL | 'Github' is deprecated. | 113 |

### 📄 `journey-simulator/src/components/layout/Sidebar.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Unexpected negated condition. | 162 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 115 |

### 📄 `journey-simulator/src/components/navigation/MainNavigation.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| CRITICAL | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 24 to the 15 allowed. | 458 |
| MAJOR | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 206 |
| MAJOR | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 257 |
| MAJOR | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 336 |
| MINOR | CODE_SMELL | 'navActiveTone' PropType is defined but prop is never used | 43 |
| MINOR | CODE_SMELL | 'navDefaultTone' PropType is defined but prop is never used | 44 |
| MINOR | CODE_SMELL | 'navDisabledTone' PropType is defined but prop is never used | 45 |
| MINOR | CODE_SMELL | Replace this union type with a type alias. | 53 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 467 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 468 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 521 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 522 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 113 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 356 |

### 📄 `journey-simulator/src/components/onboarding/OnboardingFlow.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | 'onStart' PropType is defined but prop is never used | 38 |
| MINOR | CODE_SMELL | 'onContinue' PropType is defined but prop is never used | 39 |

### 📄 `journey-simulator/src/components/shared/MessageDisplay.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | 'autoDismiss' PropType is defined but prop is never used | 9 |

### 📄 `journey-simulator/src/components/shared/Skeleton.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | This case's code block is the same as the block for the case on line 51. | 58 |
| MINOR | CODE_SMELL | Use `new Array()` instead of `Array()`. | 69 |

### 📄 `journey-simulator/src/components/shared/ZynoAssistant.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `.at(…)` over `[….length - index]`. | 16 |

### 📄 `journey-simulator/src/contexts/TutorialContext.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | The object passed as the value prop to the Context provider changes every render. To fix this consider wrapping it in a useMemo hook. | 42 |

### 📄 `journey-simulator/src/contexts/WalletContext.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 61 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 62 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 89 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 90 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 94 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 104 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 106 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 124 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 125 |

### 📄 `journey-simulator/src/contexts/WorkspaceLayoutContext.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 37 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 37 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 37 |

### 📄 `journey-simulator/src/contexts/__tests__/WalletContext.test.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | 'unknown' overrides all other types in this union type. | 64 |

### 📄 `journey-simulator/src/hooks/useArtifacts.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | The catch parameter `fallbackErr` should be named `error_`. | 49 |

### 📄 `journey-simulator/src/hooks/usePhaseData.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 49 |
| MAJOR | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 55 |
| MINOR | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 48 |
| MINOR | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 57 |

### 📄 `journey-simulator/src/lib/solana-config.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Unexpected negated condition. | 67 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 73 |

### 📄 `journey-simulator/src/lib/walletAuth.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 18 |

### 📄 `journey-simulator/src/main.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `node:process` over `process`. | 2 |
| MINOR | CODE_SMELL | Prefer `node:buffer` over `buffer`. | 1 |

### 📄 `journey-simulator/src/pages/HomePage.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Ambiguous spacing after previous element span | 140 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 106 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 110 |

### 📄 `journey-simulator/src/store/journeyStore.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 871 |
| MAJOR | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 542 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 145 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 167 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 201 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 744 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 439 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 140 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 162 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 178 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 188 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 196 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 870 |
| MINOR | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 871 |
| MINOR | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 872 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 678 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 679 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 876 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 742 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 750 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 750 |

### 📄 `journey-simulator/src/test/setup.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 6 |

### 📄 `journey-simulator/src/types/uiBlocks.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | "learn" is overridden by string in this union type. | 9 |
| MINOR | CODE_SMELL | "build" is overridden by string in this union type. | 9 |
| MINOR | CODE_SMELL | "prove" is overridden by string in this union type. | 9 |
| MINOR | CODE_SMELL | "activate" is overridden by string in this union type. | 9 |
| MINOR | CODE_SMELL | "scale" is overridden by string in this union type. | 9 |

### 📄 `journey-simulator/src/utils/__tests__/ignoreExtensionErrors.test.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 24 |

### 📄 `journey-simulator/src/utils/api.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Unexpected negated condition. | 322 |
| MINOR | CODE_SMELL | Prefer using nullish coalescing operator (`??`) instead of a ternary expression, as it is simpler to read. | 322 |
| MINOR | CODE_SMELL | Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. | 338 |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 380 |
| MINOR | CODE_SMELL | Prefer using nullish coalescing operator (`??=`) instead of an assignment expression, as it is simpler to read. | 341 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 18 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 19 |
| MINOR | CODE_SMELL | Prefer `Number.parseFloat` over `parseFloat`. | 278 |
| MINOR | CODE_SMELL | Prefer `Number.parseFloat` over `parseFloat`. | 279 |
| MINOR | CODE_SMELL | The empty object is useless. | 366 |
| MINOR | CODE_SMELL | The empty object is useless. | 402 |
| MINOR | CODE_SMELL | Don't use a zero fraction in the number. | 826 |

### 📄 `journey-simulator/src/utils/apiDemoHandlers.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Member 'demoDatabase' is never reassigned; mark it as `readonly`. | 84 |
| MAJOR | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 422 |
| MINOR | CODE_SMELL | Prefer `Number.parseFloat` over `parseFloat`. | 438 |

### 📄 `journey-simulator/src/utils/apiMiddleware.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | The empty object is useless. | 48 |
| MINOR | CODE_SMELL | The empty object is useless. | 147 |

### 📄 `journey-simulator/src/utils/blockchain.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 122 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 74 |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 79 |
| MINOR | CODE_SMELL | The signature '(strategy: string, commitment?: Commitment | undefined): Promise<RpcResponseAndContext<SignatureResult>>' of 'connection.confirmTransaction' is deprecated. | 22 |
| MINOR | CODE_SMELL | The signature '(signature: string, rawConfig?: GetTransactionConfig | undefined): Promise<TransactionResponse | null>' of 'connection.getTransaction' is deprecated. | 325 |
| MINOR | CODE_SMELL | The signature '(signature: string, rawConfig?: GetTransactionConfig | undefined): Promise<TransactionResponse | null>' of 'connection.getTransaction' is deprecated. | 337 |

### 📄 `journey-simulator/src/utils/exportToPDF.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | `new Error()` is too unspecific for a type check. Use `new TypeError()` instead. | 19 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 2 |
| MINOR | CODE_SMELL | `new Error()` is too unspecific for a type check. Use `new TypeError()` instead. | 3 |

### 📄 `journey-simulator/src/utils/generateStableKey.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Use `Math.trunc` instead of `| 0`. | 36 |
| MINOR | CODE_SMELL | Prefer `String#codePointAt()` over `String#charCodeAt()`. | 36 |

### 📄 `journey-simulator/src/utils/ignoreExtensionErrors.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 62 |

### 📄 `journey-simulator/src/utils/logger.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 7 |
| MINOR | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 6 |

### 📄 `journey-simulator/src/utils/particles.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 11 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 143 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 20 |

### 📄 `journey-simulator/src/utils/progress.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | arrow function is equivalent to `Number`. Use `Number` directly. | 8 |

### 📄 `journey-simulator/src/utils/solanaWeb3.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer using nullish coalescing operator (`??=`) instead of an assignment expression, as it is simpler to read. | 10 |

### 📄 `mf-back/__tests__/agents.test.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Correct the use of this function; on line 67 it was called with "new". | 71 |
| MAJOR | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 87 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 85 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 87 |

### 📄 `mf-back/__tests__/setup.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 8 |
| MINOR | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 20 |

### 📄 `mf-back/__tests__/verticalSliceOrchestration.test.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Remove this useless assignment to variable "first". | 701 |
| MINOR | CODE_SMELL | Remove the declaration of the unused 'first' variable. | 701 |

### 📄 `mf-back/agents/APIContractAgent.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/BaseAgent.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 62 |
| MINOR | CODE_SMELL | The empty object is useless. | 180 |
| MINOR | CODE_SMELL | The catch parameter `logErr` should be named `error_`. | 271 |
| MINOR | CODE_SMELL | Unexpected negated condition. | 172 |

### 📄 `mf-back/agents/DataIntegrityAgent.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/EvaluationAgent.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/GrowthAgent.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/JourneyDesignAgent.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/ObservabilityAgent.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/ProductSpecAgent.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 5 |

### 📄 `mf-back/agents/RAGOpsAgent.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/SecurityAuditAgent.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 5 |

### 📄 `mf-back/agents/TokenomicsAgent.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/registry.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Don't use a zero fraction in the number. | 7 |

### 📄 `mf-back/agents/telemetryUtils.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | The empty object is useless. | 72 |

### 📄 `mf-back/app.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer top-level await over using a promise chain. | 24 |
| MINOR | CODE_SMELL | `allowedOrigins` should be a `Set`, and use `allowedOrigins.has()` to check existence or non-existence. | 42 |

### 📄 `mf-back/controllers/journey-controller.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `node:fs/promises` over `fs/promises`. | 3 |
| MINOR | CODE_SMELL | arrow function is equivalent to `Number`. Use `Number` directly. | 28 |

### 📄 `mf-back/debug_agent_logs.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer top-level await over using a promise chain. | 19 |

### 📄 `mf-back/debug_gpt5.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer top-level await over an async function `testGpt5` call. | 63 |

### 📄 `mf-back/memory/agent_metrics.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 25 |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 55 |

### 📄 `mf-back/middleware/auth.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 151 |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 82 |

### 📄 `mf-back/orchestration/executionEngine.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| CRITICAL | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 35 to the 15 allowed. | 254 |
| MINOR | CODE_SMELL | The empty object is useless. | 281 |
| MINOR | CODE_SMELL | `new Error()` is too unspecific for a type check. Use `new TypeError()` instead. | 302 |

### 📄 `mf-back/orchestration/intentRouter.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 70 |
| MINOR | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 9 |
| MINOR | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 10 |

### 📄 `mf-back/orchestration/memoryStore.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer default parameters over reassignment. | 19 |

### 📄 `mf-back/orchestration/runtimeMode.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | `VALID_MODES` should be a `Set`, and use `VALID_MODES.has()` to check existence or non-existence. | 3 |

### 📄 `mf-back/orchestration/services/logicCheckService.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 209 |
| MAJOR | CODE_SMELL | Review this redundant assignment: "score" already holds the assigned value along all execution paths. | 39 |
| MINOR | CODE_SMELL | Don't use a zero fraction in the number. | 42 |

### 📄 `mf-back/orchestration/services/validationService.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 50 |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 16 |
| MINOR | CODE_SMELL | The empty object is useless. | 81 |
| MINOR | CODE_SMELL | The empty object is useless. | 117 |
| MINOR | CODE_SMELL | The empty object is useless. | 119 |

### 📄 `mf-back/orchestration/telemetryAdapter.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 17 |

### 📄 `mf-back/orchestration/toolsRegistry.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Unexpected lexical declaration in case block. | 35 |
| MAJOR | CODE_SMELL | Unexpected lexical declaration in case block. | 36 |
| MAJOR | CODE_SMELL | Unexpected lexical declaration in case block. | 41 |

### 📄 `mf-back/orchestration/vsliceSchema.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 87 |

### 📄 `mf-back/orchestration/zynoOrchestrator.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 35 |
| MINOR | CODE_SMELL | The empty object is useless. | 55 |
| MINOR | CODE_SMELL | The empty object is useless. | 209 |

### 📄 `mf-back/orchestration/zynoVerticalSlice.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| CRITICAL | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed. | 1336 |
| CRITICAL | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed. | 1018 |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 94 |
| MINOR | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 143 |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 772 |
| MINOR | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 191 |

### 📄 `mf-back/rag/ragClient.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 136 |

### 📄 `mf-back/routes/auth-routes.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 169 |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 250 |

### 📄 `mf-back/routes/export-routes.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Do not call `Array#push()` multiple times. | 9 |
| MINOR | CODE_SMELL | Do not call `Array#push()` multiple times. | 10 |
| MINOR | CODE_SMELL | Do not call `Array#push()` multiple times. | 11 |
| MINOR | CODE_SMELL | Do not call `Array#push()` multiple times. | 12 |
| MINOR | CODE_SMELL | Do not call `Array#push()` multiple times. | 13 |
| MINOR | CODE_SMELL | Do not call `Array#push()` multiple times. | 14 |
| MINOR | CODE_SMELL | Do not call `Array#push()` multiple times. | 29 |
| MINOR | CODE_SMELL | Do not call `Array#push()` multiple times. | 30 |
| MINOR | CODE_SMELL | Do not call `Array#push()` multiple times. | 31 |

### 📄 `mf-back/routes/feedback.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 10 |

### 📄 `mf-back/routes/solana-routes.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Don't use a zero fraction in the number. | 19 |
| MINOR | CODE_SMELL | Don't use a zero fraction in the number. | 33 |

### 📄 `mf-back/routes/zyno-routes.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | The empty object is useless. | 148 |

### 📄 `mf-back/run_agent.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer top-level await over using a promise chain. | 43 |

### 📄 `mf-back/scripts/check-rag-connection.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer top-level await over an async function `checkConnection` call. | 111 |

### 📄 `mf-back/scripts/rag_upload.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer top-level await over an async function `main` call. | 44 |

### 📄 `mf-back/scripts/verify-journey-flow.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer top-level await over an async function `runVerification` call. | 110 |

### 📄 `mf-back/services/journeyService.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Static method 'prepareAgentContext' has too many parameters (10). Maximum allowed is 7. | 128 |

### 📄 `mf-back/utils/llmLogger.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Unexpected negated condition. | 45 |

### 📄 `mf-back/utils/resourceValidator.js`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 11 |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 19 |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 28 |
| MINOR | CODE_SMELL | Prefer `node:url` over `url`. | 1 |

### 📄 `web/app/api/auth/nonce/route.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 2 |

### 📄 `web/app/api/auth/siws/verify/route.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 38 |

### 📄 `web/app/api/auth/verify/route.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 9 |

### 📄 `web/app/api/journeys/[id]/step/route.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 118 |

### 📄 `web/app/api/journeys/[id]/submit/route.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 128 |

### 📄 `web/app/api/journeys/audit/route.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Don't use a zero fraction in the number. | 49 |

### 📄 `web/app/api/rag/search/route.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | 'unknown' overrides all other types in this union type. | 38 |

### 📄 `web/app/global-error.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 4 |

### 📄 `web/app/layout.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 10 |

### 📄 `web/jest.setup.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Remove this commented out code. | 56 |
| MAJOR | CODE_SMELL | Remove this commented out code. | 59 |
| MAJOR | CODE_SMELL | Remove this commented out code. | 66 |
| MAJOR | CODE_SMELL | Remove this commented out code. | 73 |
| MAJOR | CODE_SMELL | Remove this commented out code. | 76 |
| MINOR | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 7 |
| MINOR | CODE_SMELL | Useless constructor. | 55 |

### 📄 `web/prisma/seed.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer top-level await over using a promise chain. | 96 |

### 📄 `web/scripts/check-minter-balance.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer top-level await over using a promise chain. | 10 |

### 📄 `web/scripts/check-minter-status.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer top-level await over using a promise chain. | 24 |

### 📄 `web/scripts/gen-minter.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer top-level await over using a promise chain. | 37 |
| MINOR | CODE_SMELL | The signature '(strategy: string, commitment?: Commitment | undefined): Promise<RpcResponseAndContext<SignatureResult>>' of 'conn.confirmTransaction' is deprecated. | 28 |

### 📄 `web/scripts/run-mint-worker.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer top-level await over using a promise chain. | 9 |

### 📄 `web/sentry.client.config.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Don't use a zero fraction in the number. | 7 |

### 📄 `web/server/metrics.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Member 'metrics' is never reassigned; mark it as `readonly`. | 14 |

### 📄 `web/server/signer.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 27 |
| MINOR | CODE_SMELL | Handle this exception or don't catch it at all. | 38 |

### 📄 `web/src/__tests__/api.misc.coverage.test.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Useless constructor. | 68 |

### 📄 `web/src/__tests__/api.siws.redis.test.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | This assertion is unnecessary since the receiver accepts the original type of the expression. | 68 |

### 📄 `web/src/__tests__/api.tx.prepare.test.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Unexpected class with only a constructor. | 5 |
| MINOR | CODE_SMELL | Useless constructor. | 6 |
| MINOR | CODE_SMELL | Useless constructor. | 9 |
| MINOR | CODE_SMELL | Useless constructor. | 14 |

### 📄 `web/src/components/Artifacts/ArtifactModal.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 10 |
| MINOR | CODE_SMELL | Prefer `globalThis.window` over `window`. | 14 |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 17 |

### 📄 `web/src/components/Artifacts/NeuralOverlay.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Ambiguous spacing after previous element span | 15 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 9 |

### 📄 `web/src/components/AuthProvider.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 4 |

### 📄 `web/src/components/Journey/UIBlocksRenderer.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Use `Math.trunc` instead of `| 0`. | 35 |
| MAJOR | CODE_SMELL | Remove this redundant type alias and replace its occurrences with "any". | 3 |
| MINOR | CODE_SMELL | Prefer `String#codePointAt()` over `String#charCodeAt()`. | 35 |
| MINOR | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 9 |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 40 |

### 📄 `web/src/components/WalletProvider.tsx`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Mark the props of the component as read-only. | 14 |

### 📄 `web/src/hooks/useAuth.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `globalThis` over `window`. | 63 |

### 📄 `web/src/lib/solana/checkPassOnChain.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MAJOR | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 60 |

### 📄 `web/src/server/db.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Use `export…from` to re-export `prisma`. | 3 |

### 📄 `web/src/server/embeddings.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `String#codePointAt()` over `String#charCodeAt()`. | 13 |

### 📄 `web/src/server/ragStore.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer using nullish coalescing operator (`??=`) instead of an assignment expression, as it is simpler to read. | 19 |
| MINOR | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 23 |

### 📄 `web/src/server/redis.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `globalThis` over `global`. | 3 |

### 📄 `web/src/server/siwsStore.ts`
| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| MINOR | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 1 |

