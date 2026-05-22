---
name: send-message
description: Use when the agent needs to send a message to a known chat thread through the local chat adapter host.
---

# Send Message

Use this skill to send messages through the local chat adapter host.

The skill talks to the agent's local control server. It expects `CONTROL_TOKEN` to be available in the environment. Override the control server URL with `AGENT_CONTROL_URL` when needed. The default URL is `http://127.0.0.1:8787`.

## List Known Chats

```bash
bun "$MEMORY_DIR/main/skills/send-message/send.ts" list
```

The output contains known `threadId` values and chat titles. A chat becomes known after the bot has seen a message in that chat.

## Send To A Thread

Use the current turn's `Thread id` when sending to the active conversation.

```bash
bun "$MEMORY_DIR/main/skills/send-message/send.ts" send \
  --thread "telegram:-1003908975751" \
  --text "Message text"
```

## Send By Chat Title

```bash
bun "$MEMORY_DIR/main/skills/send-message/send.ts" send \
  --chat "japan" \
  --text "Message text"
```

If a chat title is ambiguous, use `--thread`.

## Long Messages

```bash
cat message.md | bun "$MEMORY_DIR/main/skills/send-message/send.ts" send \
  --thread "telegram:-1003908975751" \
  --stdin
```

The CLI fails loudly when the control server, token, chat, or message text is missing.
