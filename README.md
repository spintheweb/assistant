# Spin the Web Assistant

Optional local AI service for Spin the Web Studio. It sends requests only to
Ollama on `127.0.0.1:11434`, and listens only on `127.0.0.1:11435`. It has no
access to Webbase files or permission to apply changes.

Install Ollama and a local model, for example `ollama pull qwen2.5-coder:7b`.
Set `OLLAMA_NO_CLOUD=1` for Ollama and restart it to disable cloud features.
Use a smaller model such as `qwen2.5-coder:1.5b` if necessary. Model downloads
require network access; inference is local.

Set the same long, randomly generated `STW_ASSISTANT_TOKEN` in both this
service and Webspinner. Optionally set `STW_ASSISTANT_MODEL` and
`STW_ASSISTANT_PORT`. Start the service with `npm start`. The model's output
is a proposal, not an instruction to execute a query or edit a file.

For example, in PowerShell, configure Ollama with `OLLAMA_NO_CLOUD=1` and
restart it, then in the assistant terminal:

```powershell
$env:STW_ASSISTANT_TOKEN = '<same secret configured in Webspinner>'
$env:STW_ASSISTANT_MODEL = 'qwen2.5-coder:7b'
npm start
```

Set `ALLOW_DEV=true` and the same token in Webspinner's environment or `.env`,
then start Webspinner and sign in as a developer. Never use a cloud model or
an Ollama instance that has cloud features enabled for this integration.

Run `npm test` for service tests.
