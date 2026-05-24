---
name: send-message
description: Use when the agent needs to inspect known chat threads, inspect recent chat metadata, list known participants, find local files saved from chat attachments, send files, or send an out-of-band message through the local chat adapter host.
---

# Chat Adapter

Use this skill to work with chats through the local chat adapter host.

Do not use this skill to deliver the normal reply to the current incoming message. The chat host sends the final assistant response automatically. For ordinary replies, answer normally in the final assistant message.

The skill talks to the agent's local control server. Use `agent-send-message` in deployed chat-host containers; it loads the required local control environment.

## List Known Chats

```bash
agent-send-message list
```

The output contains known `threadId` values and chat titles. A chat becomes known after the bot has seen a message in that chat.

## List Known Participants

```bash
agent-send-message participants --chat "japan"
```

```bash
agent-send-message participants --thread "telegram:-1003908975751"
```

The output contains participants observed by the bot in that chat, with user ids, names, last seen time, and message count.

## Inspect Recent Messages

```bash
agent-send-message history --chat "japan" --limit 20
```

The output contains recent message metadata: author, time, text preview, attachments, reply context, and forwarded-message context.
`messages` is an alias for `history`.

## Inspect Saved Attachments

```bash
agent-send-message attachments --chat "japan"
```

```bash
agent-send-message attachments \
  --thread "telegram:-1003908975751" \
  --message "345"
```

The output contains saved attachment metadata and local file paths. Attachments are files on disk; inspect them with normal shell tools. Use PDF parsers for PDFs, image tools for images, video tools for videos, archive tools for archives, and scripts when needed.
`files` is an alias for `attachments`.

## Send To A Thread

Use `send` for proactive messages, scheduled messages, messages to another known chat, or files that must be attached to a chat.

When sending files to the active conversation, use the current turn's `Thread id`.

Do not use `send` for a plain text answer to the current incoming message.

```bash
agent-send-message send \
  --thread "telegram:-1003908975751" \
  --text "Message text"
```

Attach local files with one or more `--file` arguments. Relative paths are resolved by this CLI before it calls the local control server. `--text` is optional when at least one file is attached.

```bash
agent-send-message send \
  --thread "telegram:-1003908975751" \
  --text "Generated file" \
  --file "./out/image.png" \
  --file "./report.pdf"
```

## Send By Chat Title

```bash
agent-send-message send \
  --chat "japan" \
  --text "Message text"
```

If a chat title is ambiguous, use `--thread`.

## Long Messages

```bash
cat message.md | agent-send-message send \
  --thread "telegram:-1003908975751" \
  --stdin
```

The CLI fails loudly when the control server, token, chat, or message text is missing.

## Cron

Cron runs with a minimal environment. Use the wrapper from crontab entries and scripts:

```bash
agent-send-message send \
  --thread "telegram:-1003908975751" \
  --text "Scheduled message"
```

For larger scripts, source `/agent/state/cron.env` before using other local agent commands.
