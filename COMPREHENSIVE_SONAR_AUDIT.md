# 🛡️ Audit Technique Complet : MFAI-Monorepo

*Généré le : 26/12/2025 21:19*

## 📊 Tableau de Bord de Santé

| Métrique | Valeur | Note |
| :--- | :--- | :--- |
| **Fiabilité (Bugs)** | 9 | D (Low) |
| **Sécurité** | 0 | A (Excellent) |
| **Maintenabilité** | 724 | A (Excellent) |
| **Dette Technique** | 83.3 heures | - |
| **Lignes de code (Loc)** | 49201 | - |

## 📂 Détail des Issues par Fichier

### 📄 `journey-simulator/src/api/mf-back-client.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Rename interface "paths" to match the regular expression ^[A-Z][a-zA-Z0-9]*$. | 6 |
| **MINOR** | CODE_SMELL | Rename interface "components" to match the regular expression ^[A-Z][a-zA-Z0-9]*$. | 359 |

### 📄 `journey-simulator/src/components/AccessPassHolders.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Remove this commented out code. | 6 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 146 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 155 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 216 |

### 📄 `journey-simulator/src/components/AgentActivityFeed.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed. | 66 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 169 |

### 📄 `journey-simulator/src/components/Artifacts/ArtifactCard.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | BUG | Visible, non-interactive elements with click handlers must have at least one keyboard listener. | 22 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 23 |

### 📄 `journey-simulator/src/components/Artifacts/ArtifactModal.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | BUG | Group parts of the regex together to make the intended operator precedence explicit. | 41 |
| **MAJOR** | CODE_SMELL | Prefer `childNode.remove()` over `parentNode.removeChild(childNode)`. | 46 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 20 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 22 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 41 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 41 |

### 📄 `journey-simulator/src/components/CertificationModal.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed. | 21 |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 44 |
| **MAJOR** | CODE_SMELL | This case's code block is the same as the block for the case on line 144. | 180 |
| **MAJOR** | CODE_SMELL | Prefer `childNode.remove()` over `parentNode.removeChild(childNode)`. | 74 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 285 |
| **MINOR** | CODE_SMELL | Use the "RegExp.exec()" method instead. | 43 |
| **MINOR** | CODE_SMELL | Prefer `Number.parseInt` over `parseInt`. | 45 |
| **MINOR** | CODE_SMELL | '(from: number, length?: number | undefined): string' is deprecated. | 372 |

### 📄 `journey-simulator/src/components/DAOVoteModal.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed. | 19 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 121 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 209 |

### 📄 `journey-simulator/src/components/DebugLogger.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this code to not nest functions more than 4 levels deep. | 16 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 46 |

### 📄 `journey-simulator/src/components/Governance/GovernanceDashboard.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 19 |

### 📄 `journey-simulator/src/components/HeroSection.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Don't use a zero fraction in the number. | 196 |
| **MINOR** | CODE_SMELL | Don't use a zero fraction in the number. | 187 |

### 📄 `journey-simulator/src/components/Journey/AgentActivityFeed.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 48 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 83 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 19 |

### 📄 `journey-simulator/src/components/Journey/InvestorDemoMode.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 128 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 219 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 10 |

### 📄 `journey-simulator/src/components/Journey/JourneyCard.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 26 to the 15 allowed. | 13 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 232 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 246 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 255 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 256 |

### 📄 `journey-simulator/src/components/Journey/JourneyDashboard.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 307 |

### 📄 `journey-simulator/src/components/Journey/JourneyNextActionsPanel.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 52 |

### 📄 `journey-simulator/src/components/Journey/JourneyProgressBar.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 53 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 61 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 77 |
| **MAJOR** | BUG | This conditional operation returns the same value whether the condition is "true" or "false". | 82 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 82 |

### 📄 `journey-simulator/src/components/Journey/JourneyTimeline.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element. | 25 |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 28 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 33 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 37 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 41 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 16 |
| **MINOR** | BUG | Visible, non-interactive elements with click handlers must have at least one keyboard listener. | 25 |

### 📄 `journey-simulator/src/components/Journey/JourneyWorkspace.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 36 to the 15 allowed. | 51 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 985 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 1047 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 1051 |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 1102 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 1113 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 862 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 1015 |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 126 |
| **MAJOR** | CODE_SMELL | Remove this commented out code. | 28 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 206 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 206 |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 243 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 301 |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 422 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 679 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 631 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 580 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 580 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 684 |

### 📄 `journey-simulator/src/components/Journey/LaunchCollaterizePhase.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 132 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 209 |

### 📄 `journey-simulator/src/components/Journey/PhaseDetails.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Ambiguous spacing after previous element span | 25 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 30 |
| **MAJOR** | CODE_SMELL | Ambiguous spacing after previous element span | 52 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 57 |
| **MAJOR** | CODE_SMELL | Ambiguous spacing after previous element span | 67 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 72 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 87 |

### 📄 `journey-simulator/src/components/Journey/PhaseSection.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed. | 60 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 143 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 133 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 135 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 193 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 214 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 320 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 361 |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 310 |

### 📄 `journey-simulator/src/components/Journey/XPTracker.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 64 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 65 |

### 📄 `journey-simulator/src/components/Journey/ZynoBox.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Move function 'pickRandomTip' to the outer scope. | 113 |
| **MINOR** | CODE_SMELL | Unnecessary use of conditional expression for default assignment. | 167 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 243 |
| **MINOR** | CODE_SMELL | 'onKeyPress' is deprecated. | 323 |

### 📄 `journey-simulator/src/components/Journey/ZynoChat.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 152 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 9 |

### 📄 `journey-simulator/src/components/Journey/ZynoSignalSidebar.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 94 |

### 📄 `journey-simulator/src/components/Journey/__tests__/JourneyCard.test.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | "symbol" | "object" | "map" | "filter" | "search" | "big" | "link" | "small" | "sub" | "sup" | "text" | "set" | "article" | "video" | "template" | "textarea" | "select" | "body" | "head" | "header" | "path" | "data" | "center" | "a" | "abbr" | "address" | "area" | "aside" | "audio" | "b" | "base" | "bdi" | "bdo" | "blockquote" | "br" | "button" | "canvas" | "caption" | "cite" | "code" | "col" | "colgroup" | "datalist" | "dd" | "del" | "details" | "dfn" | "dialog" | "div" | "dl" | "dt" | "em" | "embed" | "fieldset" | "figcaption" | "figure" | "footer" | "form" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "hgroup" | "hr" | "html" | "i" | "iframe" | "img" | "input" | "ins" | "kbd" | "keygen" | "label" | "legend" | "li" | "main" | "mark" | "menu" | "menuitem" | "meta" | "meter" | "nav" | "noindex" | "noscript" | "ol" | "optgroup" | "option" | "output" | "p" | "param" | "picture" | "pre" | "progress" | "q" | "rp" | "rt" | "ruby" | "s" | "samp" | "slot" | "script" | "section" | "source" | "span" | "strong" | "style" | "summary" | "table" | "tbody" | "td" | "tfoot" | "th" | "thead" | "time" | "title" | "tr" | "track" | "u" | "ul" | "var" | "wbr" | "webview" | "animate" | "circle" | "defs" | "desc" | "ellipse" | "g" | "image" | "line" | "marker" | "mask" | "metadata" | "pattern" | "polygon" | "polyline" | "rect" | "st... | 38 |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 42 |

### 📄 `journey-simulator/src/components/Journey/__tests__/JourneyWorkspace.test.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Remove this use of the "void" operator. | 164 |
| **MAJOR** | CODE_SMELL | Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element. | 25 |
| **MINOR** | CODE_SMELL | The empty object is useless. | 14 |
| **MINOR** | BUG | Visible, non-interactive elements with click handlers must have at least one keyboard listener. | 25 |

### 📄 `journey-simulator/src/components/Journey/__tests__/NFTIntegration.test.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | The empty object is useless. | 15 |

### 📄 `journey-simulator/src/components/JourneyCompletedPage.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 41 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 60 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 61 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 62 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 63 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 64 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 65 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 66 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 67 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 68 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 183 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 186 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 187 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 208 |

### 📄 `journey-simulator/src/components/Layout/JourneyLayout.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Ambiguous spacing after previous element span | 85 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 6 |

### 📄 `journey-simulator/src/components/LoginPage.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | A fragment with only one child is redundant. | 102 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 62 |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 23 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 78 |

### 📄 `journey-simulator/src/components/MintCelebrationBanner.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 33 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 33 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 12 |

### 📄 `journey-simulator/src/components/NFTMintingModal.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | This case's code block is the same as the block for the case on line 131. | 167 |
| **MINOR** | CODE_SMELL | The catch parameter `backendErr` should be named `error_`. | 106 |

### 📄 `journey-simulator/src/components/NFTProofModal.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | This case's code block is the same as the block for the case on line 221. | 263 |
| **MINOR** | CODE_SMELL | Prefer using nullish coalescing operator (`??=`) instead of an assignment expression, as it is simpler to read. | 36 |
| **MINOR** | CODE_SMELL | Prefer using nullish coalescing operator (`??=`) instead of an assignment expression, as it is simpler to read. | 44 |
| **MINOR** | CODE_SMELL | `new Error()` is too unspecific for a type check. Use `new TypeError()` instead. | 48 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 28 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 110 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 110 |
| **MINOR** | CODE_SMELL | 'Twitter' is deprecated. | 14 |
| **MINOR** | CODE_SMELL | 'Linkedin' is deprecated. | 15 |
| **MINOR** | CODE_SMELL | '(from: number, length?: number | undefined): string' is deprecated. | 330 |
| **MINOR** | CODE_SMELL | 'Twitter' is deprecated. | 897 |
| **MINOR** | CODE_SMELL | 'Linkedin' is deprecated. | 904 |

### 📄 `journey-simulator/src/components/PlaygroundPage.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 84 |

### 📄 `journey-simulator/src/components/ProofCertificationsBoard.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 191 |
| **MAJOR** | CODE_SMELL | This case's code block is the same as the block for the case on line 90. | 126 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 182 |
| **MAJOR** | CODE_SMELL | Refactor this code to not use nested template literals. | 186 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 230 |

### 📄 `journey-simulator/src/components/RegisterPage.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | A fragment with only one child is redundant. | 134 |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 37 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 110 |

### 📄 `journey-simulator/src/components/ResetProgressButton.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 38 |

### 📄 `journey-simulator/src/components/Resources/ResourceHub.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | BUG | Provide a compare function that depends on "String.localeCompare", to reliably sort elements alphabetically. | 116 |
| **MAJOR** | CODE_SMELL | Ambiguous spacing after previous element span | 182 |

### 📄 `journey-simulator/src/components/ShareModal.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | 'Twitter' is deprecated. | 3 |
| **MINOR** | CODE_SMELL | 'Linkedin' is deprecated. | 3 |
| **MINOR** | CODE_SMELL | 'Twitter' is deprecated. | 84 |
| **MINOR** | CODE_SMELL | 'Linkedin' is deprecated. | 94 |

### 📄 `journey-simulator/src/components/SkillchainCard.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 117 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 369 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 404 |
| **MINOR** | CODE_SMELL | Replace this union type with a type alias. | 117 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 28 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 29 |
| **MINOR** | CODE_SMELL | '(from: number, length?: number | undefined): string' is deprecated. | 332 |

### 📄 `journey-simulator/src/components/StakingModal.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | A form label must be associated with a control. | 101 |
| **MINOR** | CODE_SMELL | Prefer `Number.parseFloat` over `parseFloat`. | 24 |
| **MINOR** | CODE_SMELL | Prefer `Number.parseFloat` over `parseFloat`. | 51 |
| **MINOR** | CODE_SMELL | Prefer `Number.parseFloat` over `parseFloat`. | 128 |
| **MINOR** | CODE_SMELL | Prefer `Number.parseFloat` over `parseFloat`. | 179 |
| **MINOR** | CODE_SMELL | Prefer `Number.parseFloat` over `parseFloat`. | 179 |

### 📄 `journey-simulator/src/components/UIBlocks/IndicatorBlock.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 200 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 20 |

### 📄 `journey-simulator/src/components/UIBlocks/InteractiveTemplateBlock.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer `childNode.remove()` over `parentNode.removeChild(childNode)`. | 67 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 87 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 98 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 23 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 64 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 84 |

### 📄 `journey-simulator/src/components/UIBlocks/NarrativeChoiceBlock.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 23 |
| **MINOR** | CODE_SMELL | Prefer `Number.isNaN` over `isNaN`. | 67 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 131 |

### 📄 `journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this code to not nest functions more than 4 levels deep. | 110 |
| **CRITICAL** | CODE_SMELL | Refactor this code to not nest functions more than 4 levels deep. | 256 |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 27 to the 15 allowed. | 560 |
| **MAJOR** | CODE_SMELL | Remove this commented out code. | 451 |
| **MAJOR** | CODE_SMELL | Remove this commented out code. | 477 |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 981 |
| **MAJOR** | CODE_SMELL | Refactor this code to not use nested template literals. | 729 |
| **MAJOR** | CODE_SMELL | Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element. | 939 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 99 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 254 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 654 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 744 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 565 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 566 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 567 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 568 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 569 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 895 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 56 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 83 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 92 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 125 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 322 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 439 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 621 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 638 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 676 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 792 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 830 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 931 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 980 |
| **MINOR** | CODE_SMELL | Prefer using nullish coalescing operator (`??=`) instead of an assignment expression, as it is simpler to read. | 45 |
| **MINOR** | CODE_SMELL | Prefer `Number.isNaN` over `isNaN`. | 185 |
| **MINOR** | CODE_SMELL | Prefer `Number.isNaN` over `isNaN`. | 363 |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 1020 |
| **MINOR** | BUG | Visible, non-interactive elements with click handlers must have at least one keyboard listener. | 939 |

### 📄 `journey-simulator/src/components/WalletButton.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element. | 316 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 76 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 77 |
| **MINOR** | BUG | Visible, non-interactive elements with click handlers must have at least one keyboard listener. | 316 |

### 📄 `journey-simulator/src/components/WalletFaucetButton.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 51 |

### 📄 `journey-simulator/src/components/WalletStatusDisplay.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed. | 15 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 115 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 123 |

### 📄 `journey-simulator/src/components/Zyno/AgentFeedbackModal.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 33 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 48 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 56 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 59 |

### 📄 `journey-simulator/src/components/Zyno/AgentLogViewer.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 72 |

### 📄 `journey-simulator/src/components/Zyno/AgentScoreboardContext.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 32 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 35 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 42 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 48 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 50 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 52 |

### 📄 `journey-simulator/src/components/Zyno/DashboardZyno.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 123 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 125 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 190 |

### 📄 `journey-simulator/src/components/Zyno/MissionFeedbackSummary.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Ambiguous spacing before next element input | 172 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 23 |

### 📄 `journey-simulator/src/components/Zyno/ResourceUploader.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 193 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 197 |
| **MAJOR** | CODE_SMELL | Ambiguous spacing before next element input | 133 |

### 📄 `journey-simulator/src/components/Zyno/ZynoConsole.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed. | 122 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 566 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 142 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 145 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 157 |
| **MINOR** | CODE_SMELL | arrow function is equivalent to `Boolean`. Use `Boolean` directly. | 330 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 122 |

### 📄 `journey-simulator/src/components/Zyno/ZynoDecisionPanel.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 26 |

### 📄 `journey-simulator/src/components/Zyno/ZynoMissionFlow.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 6 |

### 📄 `journey-simulator/src/components/Zyno/__tests__/AgentFeedbackModal.test.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 64 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 71 |

### 📄 `journey-simulator/src/components/Zyno/__tests__/ZynoConsole.test.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | The object passed as the value prop to the Context provider changes every render. To fix this consider wrapping it in a useMemo hook. | 62 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 145 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 104 |

### 📄 `journey-simulator/src/components/Zyno/agent-card.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 55 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 23 |

### 📄 `journey-simulator/src/components/__tests__/WalletButton.test.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 79 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 90 |

### 📄 `journey-simulator/src/components/layout/Footer.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | 'Twitter' is deprecated. | 2 |
| **MINOR** | CODE_SMELL | 'Github' is deprecated. | 2 |
| **MINOR** | CODE_SMELL | 'Twitter' is deprecated. | 13 |
| **MINOR** | CODE_SMELL | 'Github' is deprecated. | 15 |
| **MINOR** | CODE_SMELL | 'Twitter' is deprecated. | 111 |
| **MINOR** | CODE_SMELL | 'Github' is deprecated. | 113 |

### 📄 `journey-simulator/src/components/layout/Sidebar.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 162 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 115 |

### 📄 `journey-simulator/src/components/navigation/MainNavigation.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 30 to the 15 allowed. | 54 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 389 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 325 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 572 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 277 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 278 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 280 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 281 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 430 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 593 |

### 📄 `journey-simulator/src/components/onboarding/OnboardingFlow.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Update this function so that its implementation is not identical to the one on line 54. | 62 |
| **MINOR** | CODE_SMELL | 'onStart' PropType is defined but prop is never used | 38 |
| **MINOR** | CODE_SMELL | 'onContinue' PropType is defined but prop is never used | 39 |

### 📄 `journey-simulator/src/components/shared/ContextualTutorial.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 153 |

### 📄 `journey-simulator/src/components/shared/JourneyModal.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 200 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 128 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 144 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 239 |

### 📄 `journey-simulator/src/components/shared/MessageDisplay.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | 'autoDismiss' PropType is defined but prop is never used | 9 |

### 📄 `journey-simulator/src/components/shared/Skeleton.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 23 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 24 |
| **MAJOR** | CODE_SMELL | This case's code block is the same as the block for the case on line 41. | 48 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 61 |
| **MINOR** | CODE_SMELL | Use `new Array()` instead of `Array()`. | 59 |

### 📄 `journey-simulator/src/components/shared/ZynoAssistant.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `.at(…)` over `[….length - index]`. | 16 |
| **MINOR** | CODE_SMELL | 'onKeyPress' is deprecated. | 148 |

### 📄 `journey-simulator/src/contexts/AuthContext.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 41 to the 15 allowed. | 218 |

### 📄 `journey-simulator/src/contexts/TutorialContext.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | The object passed as the value prop to the Context provider changes every render. To fix this consider wrapping it in a useMemo hook. | 42 |

### 📄 `journey-simulator/src/contexts/WalletContext.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 61 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 62 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 89 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 90 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 94 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 104 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 106 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 124 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 125 |

### 📄 `journey-simulator/src/contexts/WorkspaceLayoutContext.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 37 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 37 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 37 |

### 📄 `journey-simulator/src/contexts/__tests__/WalletContext.test.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 34 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 46 |
| **MINOR** | CODE_SMELL | 'unknown' overrides all other types in this union type. | 64 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 69 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 70 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 73 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 74 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 95 |

### 📄 `journey-simulator/src/hooks/useArtifacts.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | The catch parameter `fallbackErr` should be named `error_`. | 49 |

### 📄 `journey-simulator/src/hooks/useOptimizedLoading.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed. | 14 |

### 📄 `journey-simulator/src/lib/solana-config.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 67 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 73 |

### 📄 `journey-simulator/src/lib/walletAuth.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 18 |

### 📄 `journey-simulator/src/main.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:process` over `process`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `node:buffer` over `buffer`. | 1 |

### 📄 `journey-simulator/src/pages/GuidePage.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 569 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 193 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 619 |

### 📄 `journey-simulator/src/pages/HomePage.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Ambiguous spacing after previous element span | 140 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 106 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 110 |

### 📄 `journey-simulator/src/pages/JourneyDemo.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Remove this use of the "void" operator. | 67 |

### 📄 `journey-simulator/src/service-worker.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **BLOCKER** | CODE_SMELL | Refactor this function to not always return the same value. | 32 |

### 📄 `journey-simulator/src/store/__tests__/journeyStore.test.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 33 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 32 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 32 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 39 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 39 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 40 |

### 📄 `journey-simulator/src/store/journeyStore.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed. | 365 |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 873 |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 462 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 143 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 165 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 199 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 664 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 300 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 138 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 160 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 176 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 186 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 194 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 872 |
| **MINOR** | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 873 |
| **MINOR** | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 874 |
| **MINOR** | CODE_SMELL | '(from: number, length?: number | undefined): string' is deprecated. | 452 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 598 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 599 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 878 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 662 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 670 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 670 |

### 📄 `journey-simulator/src/test/setup.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 4 |

### 📄 `journey-simulator/src/types/uiBlocks.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | "scale" is overridden by string in this union type. | 8 |
| **MINOR** | CODE_SMELL | "build" is overridden by string in this union type. | 8 |
| **MINOR** | CODE_SMELL | "activate" is overridden by string in this union type. | 8 |
| **MINOR** | CODE_SMELL | "learn" is overridden by string in this union type. | 8 |
| **MINOR** | CODE_SMELL | "prove" is overridden by string in this union type. | 8 |

### 📄 `journey-simulator/src/utils/__tests__/ignoreExtensionErrors.test.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 24 |

### 📄 `journey-simulator/src/utils/api.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 106 to the 15 allowed. | 316 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 737 |
| **MINOR** | CODE_SMELL | Prefer using nullish coalescing operator (`??=`) instead of an assignment expression, as it is simpler to read. | 805 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 17 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 18 |
| **MINOR** | CODE_SMELL | Prefer `Number.parseFloat` over `parseFloat`. | 277 |
| **MINOR** | CODE_SMELL | Prefer `Number.parseFloat` over `parseFloat`. | 278 |
| **MINOR** | CODE_SMELL | Prefer `Number.parseFloat` over `parseFloat`. | 731 |
| **MINOR** | CODE_SMELL | The empty object is useless. | 774 |
| **MINOR** | CODE_SMELL | The empty object is useless. | 830 |
| **MINOR** | CODE_SMELL | Don't use a zero fraction in the number. | 1253 |

### 📄 `journey-simulator/src/utils/blockchain.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 122 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 74 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 79 |
| **MINOR** | CODE_SMELL | The signature '(strategy: string, commitment?: Commitment | undefined): Promise<RpcResponseAndContext<SignatureResult>>' of 'connection.confirmTransaction' is deprecated. | 22 |
| **MINOR** | CODE_SMELL | The signature '(signature: string, rawConfig?: GetTransactionConfig | undefined): Promise<TransactionResponse | null>' of 'connection.getTransaction' is deprecated. | 325 |
| **MINOR** | CODE_SMELL | The signature '(signature: string, rawConfig?: GetTransactionConfig | undefined): Promise<TransactionResponse | null>' of 'connection.getTransaction' is deprecated. | 337 |

### 📄 `journey-simulator/src/utils/exportToPDF.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | `new Error()` is too unspecific for a type check. Use `new TypeError()` instead. | 19 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 2 |
| **MINOR** | CODE_SMELL | `new Error()` is too unspecific for a type check. Use `new TypeError()` instead. | 3 |

### 📄 `journey-simulator/src/utils/ignoreExtensionErrors.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 62 |

### 📄 `journey-simulator/src/utils/logger.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 7 |
| **MINOR** | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 6 |

### 📄 `journey-simulator/src/utils/particles.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 11 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 143 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 20 |

### 📄 `journey-simulator/src/utils/progress.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | arrow function is equivalent to `Number`. Use `Number` directly. | 8 |

### 📄 `journey-simulator/src/utils/solanaWeb3.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer using nullish coalescing operator (`??=`) instead of an assignment expression, as it is simpler to read. | 10 |

### 📄 `journey-simulator/src/utils/tokenStore.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 10 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 10 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 11 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 18 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 18 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 19 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 26 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 26 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 27 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 37 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 37 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 38 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 45 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 45 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 46 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 53 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 53 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 54 |

### 📄 `mf-back/__tests__/admin.rag.e2e.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `node:os` over `os`. | 3 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 4 |

### 📄 `mf-back/__tests__/agents.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 24 to the 15 allowed. | 73 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 99 |
| **MAJOR** | CODE_SMELL | Correct the use of this function; on line 81 it was called with "new". | 85 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 99 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 99 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 65 |

### 📄 `mf-back/__tests__/demoMission.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 3 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 4 |

### 📄 `mf-back/__tests__/e2e/orchestration.e2e.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 3 |

### 📄 `mf-back/__tests__/golden/goldenOutputs.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 3 |
| **MINOR** | CODE_SMELL | Prefer `structuredClone(…)` over `JSON.parse(JSON.stringify(…))` to create a deep clone. | 8 |

### 📄 `mf-back/__tests__/parcoursTemplates.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 1 |
| **MINOR** | CODE_SMELL | Prefer `node:os` over `os`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 3 |

### 📄 `mf-back/__tests__/ragClient.fallback.integration.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 1 |
| **MINOR** | CODE_SMELL | Prefer `node:os` over `os`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 3 |

### 📄 `mf-back/__tests__/ragClient.remote.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `node:os` over `os`. | 3 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 4 |

### 📄 `mf-back/__tests__/ragClient.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 1 |
| **MINOR** | CODE_SMELL | Prefer `node:os` over `os`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 3 |

### 📄 `mf-back/__tests__/routes.admin.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 3 |
| **MINOR** | CODE_SMELL | Prefer `node:os` over `os`. | 4 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 5 |

### 📄 `mf-back/__tests__/routes.dao.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Unexpected empty method 'index'. | 46 |

### 📄 `mf-back/__tests__/s2_models.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Remove this commented out code. | 2 |

### 📄 `mf-back/__tests__/verticalSliceOrchestration.test.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "res". | 1156 |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "learningProd". | 751 |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "first". | 682 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 52 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'res' variable. | 1156 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 1367 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'learningProd' variable. | 751 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'first' variable. | 682 |

### 📄 `mf-back/agents/APIContractAgent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/AgentFactory.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 109 to the 15 allowed. | 27 |

### 📄 `mf-back/agents/BaseAgent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 19 to the 15 allowed. | 152 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 62 |
| **MINOR** | CODE_SMELL | The catch parameter `logErr` should be named `error_`. | 231 |
| **MINOR** | CODE_SMELL | The empty object is useless. | 248 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 240 |

### 📄 `mf-back/agents/DataIntegrityAgent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/EvaluationAgent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/GrowthAgent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/JourneyDesignAgent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/ObservabilityAgent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/ProductSpecAgent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 5 |

### 📄 `mf-back/agents/QAPlaywrightAgent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 1 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 2 |

### 📄 `mf-back/agents/RAGOpsAgent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/SecurityAuditAgent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 5 |

### 📄 `mf-back/agents/TokenomicsAgent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer class field declaration over `this` assignment in constructor for static values. | 3 |

### 📄 `mf-back/agents/registry.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Don't use a zero fraction in the number. | 7 |

### 📄 `mf-back/agents/telemetryUtils.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | The empty object is useless. | 72 |

### 📄 `mf-back/app.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer top-level await over using a promise chain. | 23 |
| **MINOR** | CODE_SMELL | `allowedOrigins` should be a `Set`, and use `allowedOrigins.has()` to check existence or non-existence. | 41 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 2 |

### 📄 `mf-back/controllers/agent-run-controller.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `Number.parseInt` over `parseInt`. | 19 |
| **MINOR** | CODE_SMELL | Prefer `Number.parseInt` over `parseInt`. | 28 |
| **MINOR** | CODE_SMELL | Prefer `Number.parseInt` over `parseInt`. | 29 |

### 📄 `mf-back/controllers/analytics-controller.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "user_persona". | 7 |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "user_persona". | 41 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'user_persona' variable. | 7 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'user_persona' variable. | 41 |

### 📄 `mf-back/controllers/journey-controller.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 28 to the 15 allowed. | 499 |
| **MAJOR** | CODE_SMELL | Remove this commented out code. | 445 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `node:fs/promises` over `fs/promises`. | 3 |
| **MINOR** | CODE_SMELL | arrow function is equivalent to `Number`. Use `Number` directly. | 28 |

### 📄 `mf-back/controllers/user-controller.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed. | 189 |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 30 to the 15 allowed. | 641 |
| **MINOR** | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 3 |

### 📄 `mf-back/debug_agent_logs.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer top-level await over using a promise chain. | 19 |

### 📄 `mf-back/debug_gpt5.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer top-level await over an async function `testGpt5` call. | 63 |

### 📄 `mf-back/memory/agent_memory.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 3 |

### 📄 `mf-back/memory/agent_metrics.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 3 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 25 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 55 |

### 📄 `mf-back/middleware/auth.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 151 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 82 |

### 📄 `mf-back/orchestration/actionToolMapper.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "object". | 24 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'object' variable. | 24 |

### 📄 `mf-back/orchestration/agentProtocol.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 1 |

### 📄 `mf-back/orchestration/alertingEngine.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Update this function so that its implementation is not identical to the one on line 16. | 31 |

### 📄 `mf-back/orchestration/executionEngine.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 90 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 90 |

### 📄 `mf-back/orchestration/executionGate.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 1 |

### 📄 `mf-back/orchestration/idempotencyStore.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 1 |

### 📄 `mf-back/orchestration/intentRouter.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 9 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 10 |

### 📄 `mf-back/orchestration/llmCache.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 1 |

### 📄 `mf-back/orchestration/memoryStore.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer default parameters over reassignment. | 19 |

### 📄 `mf-back/orchestration/ragClient.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 3 |

### 📄 `mf-back/orchestration/telemetryAdapter.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 17 |

### 📄 `mf-back/orchestration/toolsRegistry.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "action". | 7 |
| **MAJOR** | CODE_SMELL | Unexpected lexical declaration in case block. | 35 |
| **MAJOR** | CODE_SMELL | Unexpected lexical declaration in case block. | 36 |
| **MAJOR** | CODE_SMELL | Unexpected lexical declaration in case block. | 41 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'action' variable. | 7 |

### 📄 `mf-back/orchestration/vsliceSchema.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 87 |

### 📄 `mf-back/orchestration/web3Guards.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed. | 1 |

### 📄 `mf-back/orchestration/web3Pipeline.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Refactor this code to not use nested template literals. | 49 |
| **MAJOR** | CODE_SMELL | Refactor this code to not use nested template literals. | 53 |
| **MINOR** | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 1 |

### 📄 `mf-back/orchestration/zynoOrchestrator.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 174 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 35 |
| **MINOR** | CODE_SMELL | The empty object is useless. | 55 |
| **MINOR** | CODE_SMELL | The empty object is useless. | 208 |

### 📄 `mf-back/orchestration/zynoVerticalSlice.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 215 to the 15 allowed. | 332 |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 31 to the 15 allowed. | 216 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 370 |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "originalOpenAIKey". | 462 |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "journeyPhases". | 486 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 543 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 544 |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "idempotentReplays". | 585 |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "retried". | 737 |
| **MAJOR** | BUG | Unexpected constant truthiness on the left-hand side of a `||` expression. | 894 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 912 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 914 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 1062 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 1226 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 883 |
| **MAJOR** | CODE_SMELL | Extract this nested ternary operation into an independent statement. | 168 |
| **MAJOR** | CODE_SMELL | This branch's code block is the same as the block for the branch on line 276. | 278 |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "overallStatus". | 825 |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 9 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 10 |
| **MINOR** | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 27 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 93 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 122 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 141 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 347 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 351 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 371 |
| **MINOR** | CODE_SMELL | The empty object is useless. | 420 |
| **MINOR** | CODE_SMELL | The empty object is useless. | 451 |
| **MINOR** | CODE_SMELL | The empty object is useless. | 453 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'originalOpenAIKey' variable. | 462 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'journeyPhases' variable. | 486 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 534 |
| **MINOR** | CODE_SMELL | Prefer `structuredClone(…)` over `JSON.parse(JSON.stringify(…))` to create a deep clone. | 586 |
| **MINOR** | CODE_SMELL | The empty object is useless. | 593 |
| **MINOR** | CODE_SMELL | Prefer `structuredClone(…)` over `JSON.parse(JSON.stringify(…))` to create a deep clone. | 614 |
| **MINOR** | CODE_SMELL | The empty object is useless. | 756 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 1631 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 1632 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 1901 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 183 |

### 📄 `mf-back/rag/ragClient.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 4 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 5 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 136 |

### 📄 `mf-back/routes/auth-routes.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 169 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 250 |

### 📄 `mf-back/routes/export-routes.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 9 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 10 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 11 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 12 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 13 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 14 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 29 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 30 |
| **MINOR** | CODE_SMELL | Do not call `Array#push()` multiple times. | 31 |

### 📄 `mf-back/routes/feedback.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 10 |

### 📄 `mf-back/routes/index.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Unexpected var, use let or const instead. | 1 |
| **CRITICAL** | CODE_SMELL | Unexpected var, use let or const instead. | 2 |

### 📄 `mf-back/routes/journey-routes.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Unexpected var, use let or const instead. | 1 |
| **CRITICAL** | CODE_SMELL | Unexpected var, use let or const instead. | 2 |

### 📄 `mf-back/routes/rag-routes.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 3 |

### 📄 `mf-back/routes/solana-routes.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "destinationWallet". | 10 |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "nftId". | 10 |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "metadata". | 10 |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "metadata". | 50 |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "nftId". | 50 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'nftId' variable. | 10 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'destinationWallet' variable. | 10 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'metadata' variable. | 10 |
| **MINOR** | CODE_SMELL | Don't use a zero fraction in the number. | 19 |
| **MINOR** | CODE_SMELL | Don't use a zero fraction in the number. | 33 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'nftId' variable. | 50 |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'metadata' variable. | 50 |

### 📄 `mf-back/routes/user-routes.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Unexpected var, use let or const instead. | 1 |
| **CRITICAL** | CODE_SMELL | Unexpected var, use let or const instead. | 2 |

### 📄 `mf-back/routes/zyno-routes.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Remove the declaration of the unused 'timeline' variable. | 31 |

### 📄 `mf-back/run_agent.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer top-level await over using a promise chain. | 43 |

### 📄 `mf-back/scripts/check-rag-connection.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 26 to the 15 allowed. | 26 |
| **MAJOR** | CODE_SMELL | Prefer top-level await over an async function `checkConnection` call. | 105 |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 3 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 4 |

### 📄 `mf-back/scripts/rag_upload.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer top-level await over an async function `main` call. | 44 |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 3 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 4 |

### 📄 `mf-back/scripts/verify-journey-flow.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer top-level await over an async function `runVerification` call. | 110 |

### 📄 `mf-back/services/JourneyEngine.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `Number.parseInt` over `parseInt`. | 105 |

### 📄 `mf-back/services/journey-state-service.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 58 |
| **MINOR** | CODE_SMELL | Prefer `Number.parseInt` over `parseInt`. | 55 |

### 📄 `mf-back/utils/agent-idempotence.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 2 |

### 📄 `mf-back/utils/llmLogger.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 8 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 9 |
| **MINOR** | CODE_SMELL | Unexpected negated condition. | 45 |

### 📄 `mf-back/utils/resourceValidator.js`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 11 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 19 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 28 |
| **MINOR** | CODE_SMELL | Prefer `node:url` over `url`. | 1 |

### 📄 `web/app/api/auth/nonce/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 2 |

### 📄 `web/app/api/auth/siws/verify/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 16 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 16 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 16 |
| **MINOR** | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 38 |

### 📄 `web/app/api/auth/verify/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 9 |

### 📄 `web/app/api/journeys/[id]/step/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 120 |
| **MINOR** | CODE_SMELL | '/usr/src/web/node_modules/next/server.js' imported multiple times. | 1 |
| **MINOR** | CODE_SMELL | '/usr/src/web/node_modules/next/server.js' imported multiple times. | 15 |

### 📄 `web/app/api/journeys/[id]/submit/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 128 |

### 📄 `web/app/api/journeys/audit/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Don't use a zero fraction in the number. | 49 |

### 📄 `web/app/api/journeys/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 8 |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 35 |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 53 |

### 📄 `web/app/api/mint/last/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 27 |

### 📄 `web/app/api/rag/doc/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 22 |

### 📄 `web/app/api/rag/ingest-batch/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 32 |

### 📄 `web/app/api/rag/ingest/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 26 |

### 📄 `web/app/api/rag/query/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 21 |

### 📄 `web/app/api/rag/search/route.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 26 |
| **MINOR** | CODE_SMELL | 'unknown' overrides all other types in this union type. | 41 |

### 📄 `web/app/global-error.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 4 |

### 📄 `web/app/layout.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 10 |

### 📄 `web/e2e/basic.spec.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Remove this useless assignment to variable "resp". | 34 |

### 📄 `web/jest.setup.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Remove this commented out code. | 43 |
| **MAJOR** | CODE_SMELL | Remove this commented out code. | 46 |
| **MAJOR** | CODE_SMELL | Remove this commented out code. | 53 |
| **MAJOR** | CODE_SMELL | Remove this commented out code. | 60 |
| **MAJOR** | CODE_SMELL | Remove this commented out code. | 63 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 6 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 66 |
| **MINOR** | CODE_SMELL | Compare with `undefined` directly instead of using `typeof`. | 5 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 5 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 15 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 25 |
| **MINOR** | CODE_SMELL | Useless constructor. | 42 |
| **MINOR** | CODE_SMELL | Prefer `node:util` over `util`. | 2 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 10 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 11 |

### 📄 `web/middleware.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 20 to the 15 allowed. | 23 |

### 📄 `web/packages/agents/tools/solana.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Remove this unused import of 'base58'. | 18 |

### 📄 `web/prisma/seed.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer top-level await over using a promise chain. | 96 |

### 📄 `web/scripts/check-minter-balance.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer top-level await over using a promise chain. | 10 |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 2 |

### 📄 `web/scripts/check-minter-status.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer top-level await over using a promise chain. | 24 |

### 📄 `web/scripts/gen-minter.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer top-level await over using a promise chain. | 37 |
| **MINOR** | CODE_SMELL | Prefer `node:fs` over `fs`. | 3 |
| **MINOR** | CODE_SMELL | Prefer `node:path` over `path`. | 4 |
| **MINOR** | CODE_SMELL | The signature '(strategy: string, commitment?: Commitment | undefined): Promise<RpcResponseAndContext<SignatureResult>>' of 'conn.confirmTransaction' is deprecated. | 28 |

### 📄 `web/scripts/run-mint-worker.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer top-level await over using a promise chain. | 8 |
| **MINOR** | CODE_SMELL | Remove this unused import of 'mintWorker'. | 1 |

### 📄 `web/sentry.client.config.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Don't use a zero fraction in the number. | 7 |

### 📄 `web/server/metrics.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Member 'metrics' is never reassigned; mark it as `readonly`. | 14 |

### 📄 `web/server/signer.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 27 |
| **MINOR** | CODE_SMELL | Handle this exception or don't catch it at all. | 38 |

### 📄 `web/src/__tests__/api.journeys.step.actionId.test.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 38 |

### 📄 `web/src/__tests__/api.journeys.submit.test.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 48 |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 56 |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 79 |

### 📄 `web/src/__tests__/api.journeys.test.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 16 |

### 📄 `web/src/__tests__/api.misc.coverage.test.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Useless constructor. | 68 |

### 📄 `web/src/__tests__/api.rag.test.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 22 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 23 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 25 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 128 |

### 📄 `web/src/__tests__/api.siws.redis.test.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since the receiver accepts the original type of the expression. | 68 |

### 📄 `web/src/__tests__/api.tx.prepare.test.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Unexpected class with only a constructor. | 5 |
| **MINOR** | CODE_SMELL | Useless constructor. | 6 |
| **MINOR** | CODE_SMELL | Useless constructor. | 9 |
| **MINOR** | CODE_SMELL | Useless constructor. | 14 |

### 📄 `web/src/components/Artifacts/ArtifactModal.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 10 |
| **MINOR** | CODE_SMELL | Prefer `globalThis.window` over `window`. | 14 |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 17 |

### 📄 `web/src/components/Artifacts/NeuralOverlay.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Ambiguous spacing after previous element span | 15 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 9 |

### 📄 `web/src/components/AuthProvider.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 4 |

### 📄 `web/src/components/Journey/UIBlocksRenderer.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Remove this redundant type alias and replace its occurrences with "any". | 4 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 33 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 101 |
| **MAJOR** | CODE_SMELL | Do not use Array index in keys | 118 |
| **MINOR** | CODE_SMELL | Prefer `String#replaceAll()` over `String#replace()`. | 9 |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 11 |

### 📄 `web/src/components/WalletProvider.tsx`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Mark the props of the component as read-only. | 14 |

### 📄 `web/src/hooks/useAuth.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `window`. | 63 |

### 📄 `web/src/lib/solana/checkPassOnChain.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MAJOR** | CODE_SMELL | Prefer using an optional chain expression instead, as it's more concise and easier to read. | 60 |

### 📄 `web/src/server/db.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Use `export…from` to re-export `prisma`. | 3 |

### 📄 `web/src/server/embeddings.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `String#codePointAt()` over `String#charCodeAt()`. | 13 |

### 📄 `web/src/server/ragStore.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer using nullish coalescing operator (`??=`) instead of an assignment expression, as it is simpler to read. | 19 |
| **MINOR** | CODE_SMELL | This assertion is unnecessary since it does not change the type of the expression. | 23 |

### 📄 `web/src/server/redis.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `globalThis` over `global`. | 3 |

### 📄 `web/src/server/siwsStore.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **MINOR** | CODE_SMELL | Prefer `node:crypto` over `crypto`. | 1 |

### 📄 `web/src/server/state.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 34 |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 71 |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 105 |
| **INFO** | CODE_SMELL | Complete the task associated to this "TODO" comment. | 146 |

### 📄 `web/src/server/zyno.ts`

| Sévérité | Type | Message | Ligne |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed. | 81 |
| **CRITICAL** | CODE_SMELL | Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed. | 182 |
