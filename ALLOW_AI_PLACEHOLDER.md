# @@stwALLOW_AI Placeholder

## Overview

The `@@stwALLOW_AI` placeholder exposes the application-level `ALLOW_AI` environment setting to WBPL expressions, enabling conditional content visibility and feature control based on AI assistant enablement.

## Usage in WBOL

Control the visibility of content based on the `ALLOW_AI` setting:

```xml
<content uuid="..." type="accordion" visible="@@stwALLOW_AI">
  <name>
    <text xml:lang="en"><![CDATA[AI Assistant]]></text>
  </name>
  <!-- content options -->
</content>
```

## How It Works

1. **Configuration**: The `ALLOW_AI` environment variable (defaults to `"false"`) is read during application startup and validated to ensure it is either `"true"` or `"false"`.

2. **Placeholder Population**: When a session is created, `@@stwALLOW_AI` is set to the string `"true"` or `"false"` based on the environment setting.

3. **Persistence Across Requests**: The placeholder is re-populated after every request is processed, ensuring it always reflects the current application setting.

4. **Authorization vs. Visibility**: The placeholder is for UI visibility control in WBOL. Server-side authorization checks in the assistant and connector APIs remain separate and enforce access control.

## Configuration

Set the environment variable before starting the application:

```bash
export ALLOW_AI=true
npm start
```

Or in `.env` / `.env.docker`:

```
ALLOW_AI=true
```

## Implementation Details

### Files Modified

- **[stwConfig.js](stwComponents/stwConfig.js)**: Added `readBooleanSetting()` function to normalize and validate boolean environment variables.
- **[stwSession.js](stwComponents/stwSession.js)**: Added `setApplicationPlaceholders()` method to populate `@@stwALLOW_AI` during session initialization and after request resets.
- **[stwPortal.js](stwElements/stwPortal.js)**: Updated to use `readBooleanSetting()` for consistent `ALLOW_DEV` and `ALLOW_AI` handling.
- **[stwAssistant.js](stwComponents/stwAssistant.js)**: Updated authorization check to use `readBooleanSetting()`.
- **[stwWBOLApi.js](stwComponents/stwWBOLApi.js)**: Updated connector listing to use `readBooleanSetting()`.
- **[stwStudio.wbol](webbaselets/stwStudio.wbol)**: Added `visible="@@stwALLOW_AI"` condition to the AI Assistant accordion.

### Session Lifecycle

1. **Session Creation** (`new STWSession()`): `@@stwALLOW_AI` is set via `setApplicationPlaceholders()`.
2. **Request Processing** (`session.setPlaceholders(request)`): Placeholder is preserved when request placeholders are cleared.
3. **Language Change** (`session.setLanguage()`): Application placeholders remain intact.

## Placeholder Values

- `"true"`: AI assistant is enabled (`ALLOW_AI=true`)
- `"false"`: AI assistant is disabled (default or `ALLOW_AI=false`)

## Note on WBPL Behavior

In WBPL, both `"true"` and `"false"` are nonempty strings. For conditional visibility:

- `visible="@@stwALLOW_AI"` shows the element only if `@@stwALLOW_AI` has a truthy value (including the string `"false"`)
- To show only when AI is enabled, the visibility logic in the WBOL renderer must explicitly compare the placeholder value

If you need fine-grained conditional visibility, consider:
```xml
visible="'true'=@@stwALLOW_AI"
```

Consult the [WBPL documentation](wiki/WBPL-Webbase-Placeholder-Language.md) for visibility expression syntax.
