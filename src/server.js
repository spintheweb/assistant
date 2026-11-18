import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { generate } from "./assistant.js";

const token = process.env.STW_ASSISTANT_TOKEN;
if (!token || token.length < 32) throw new Error("STW_ASSISTANT_TOKEN must contain at least 32 characters");
const port = Number(process.env.STW_ASSISTANT_PORT || 11435);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid STW_ASSISTANT_PORT");
const model = process.env.STW_ASSISTANT_MODEL || "qwen2.5-coder:7b";

function authorized(header) {
	const supplied = Buffer.from(header || "");
	const expected = Buffer.from(`Bearer ${token}`);
	return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

createServer(async (request, response) => {
	response.setHeader("Content-Type", "application/json");
	response.setHeader("Cache-Control", "no-store");
	try {
		if (!authorized(request.headers.authorization)) {
			response.writeHead(401).end(JSON.stringify({ error: "Unauthorized" }));
			return;
		}
		if (request.method !== "POST" || request.url !== "/chat") {
			response.writeHead(404).end(JSON.stringify({ error: "Not found" }));
			return;
		}
		let size = 0;
		const chunks = [];
		for await (const chunk of request) {
			size += chunk.length;
			if (size > 65536) {
				response.writeHead(413).end(JSON.stringify({ error: "Request too large" }));
				return;
			}
			chunks.push(chunk);
		}
		const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
		const result = await generate(body, { model });
		response.writeHead(200).end(JSON.stringify(result));
	} catch (error) {
		const status = error instanceof TypeError || error instanceof SyntaxError ? 400 : 502;
		console.error("Assistant request failed:", error.message);
		response.writeHead(status).end(JSON.stringify({ error: error.message }));
	}
}).listen(port, "127.0.0.1", () => console.log(`STW Assistant listening on 127.0.0.1:${port}`));
