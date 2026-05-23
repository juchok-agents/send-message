#!/usr/bin/env bun

import { resolve } from "node:path";

const command = process.argv[2];
const args = parseArgs(process.argv.slice(3));

if (command === "list") {
  const result = await request("/messages/threads", { method: "GET" });
  print(result);
} else if (command === "participants") {
  const result = await request("/messages/participants", {
    body: JSON.stringify({
      chat: args.chat,
      threadId: args.thread,
    }),
    method: "POST",
  });
  print(result);
} else if (command === "history" || command === "messages") {
  const result = await request("/messages/history", {
    body: JSON.stringify({
      chat: args.chat,
      limit: args.limit,
      threadId: args.thread,
    }),
    method: "POST",
  });
  print(result);
} else if (command === "attachments" || command === "files") {
  const result = await request("/messages/attachments", {
    body: JSON.stringify({
      chat: args.chat,
      messageId: args.message,
      threadId: args.thread,
    }),
    method: "POST",
  });
  print(result);
} else if (command === "send") {
  const text = args.stdin ? await Bun.stdin.text() : args.text;
  const result = await request("/messages/send", {
    body: JSON.stringify({
      chat: args.chat,
      files: args.files,
      text,
      threadId: args.thread,
    }),
    method: "POST",
  });
  print(result);
} else {
  throw new Error("Unknown command. Use `list`, `participants`, `history`, `messages`, `attachments`, `files`, or `send`.");
}

async function request(path: string, init: RequestInit) {
  const token = process.env.CONTROL_TOKEN;
  if (!token) {
    throw new Error("CONTROL_TOKEN is required.");
  }

  const url = `${controlUrl()}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...init.headers,
    },
  });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${url} failed with ${response.status}: ${body}`);
  }

  return body ? JSON.parse(body) : null;
}

function controlUrl() {
  return (process.env.AGENT_CONTROL_URL ?? `http://127.0.0.1:${process.env.CONTROL_PORT ?? "8787"}`).replace(/\/+$/, "");
}

function parseArgs(argv: string[]) {
  const values: Record<string, string | string[] | boolean> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg?.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    if (key === "stdin") {
      values[key] = true;
      continue;
    }

    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }
    if (key === "file") {
      const files = Array.isArray(values.file) ? values.file : [];
      files.push(resolve(value));
      values.file = files;
    } else {
      values[key] = value;
    }
    i += 1;
  }

  return {
    chat: stringArg(values.chat),
    files: stringArrayArg(values.file),
    limit: numberArg(values.limit),
    message: stringArg(values.message),
    stdin: values.stdin === true,
    text: stringArg(values.text),
    thread: stringArg(values.thread),
  };
}

function stringArg(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringArrayArg(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : undefined;
}

function numberArg(value: unknown) {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("limit must be a positive integer.");
  }
  return parsed;
}

function print(value: unknown) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
