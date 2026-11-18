import { test } from "node:test";
import assert from "node:assert/strict";
import { generate } from "../src/assistant.js";

test("sends context only to local Ollama and returns a structured proposal", async () => {
	const result = await generate({
		messages: [{ role: "user", content: "Rename this" }],
		element: { uuid: "p1", name: "Old" }
	}, {
		model: "test",
		fetchImpl: async (url, options) => {
			assert.equal(url, "http://127.0.0.1:11434/api/chat");
			const body = JSON.parse(options.body);
			assert.match(body.messages[1].content, /"uuid":"p1"/);
			return new Response(JSON.stringify({ message: { content: JSON.stringify({ answer: "Rename", changes: { name: "New" } }) } }));
		}
	});
	assert.deepEqual(result, { answer: "Rename", changes: { name: "New" } });
});

test("rejects malformed or unsolicited changes and reports model failures", async () => {
	const messages = [{ role: "user", content: "Hello" }];
	const reply = (content) => async () => new Response(JSON.stringify({ message: { content: JSON.stringify(content) } }));
	await assert.rejects(generate({ messages, element: null }, { model: "test", fetchImpl: reply({ answer: "x", changes: { name: "x" } }) }), /selected element/);
	await assert.rejects(generate({ messages, element: {} }, { model: "test", fetchImpl: reply({ answer: "x", changes: { visibility: "x" } }) }), /invalid response/);
	await assert.rejects(generate({ messages, element: {} }, { model: "test", fetchImpl: async () => new Response("missing model", { status: 404 }) }), /missing model/);
	await assert.rejects(generate({ messages, element: {} }, { model: "test", fetchImpl: async () => { throw new TypeError("fetch failed"); } }), /Cannot reach local Ollama/);
});
