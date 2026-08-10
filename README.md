# pi-cmux-subagents

`pi-cmux-subagents` adds visible, independently steerable Pi subagents to
cmux. It does not modify or auto-load in normal `pi` sessions. Run `pi-cmux`
when you want the integration.

The first child groups the parent workspace and its children under
`Pi · <project>`. Later children reuse that collapsible group and open without
stealing focus.

The interface combines conventions from
[`tintinweb/pi-subagents`](https://github.com/tintinweb/pi-subagents) and
[`nicobailon/pi-subagents`](https://github.com/nicobailon/pi-subagents) with a
cmux-native execution model:

- Claude Code-compatible `Agent`, `get_subagent_result`, and `steer_subagent` tools
- foreground and parallel background runs
- real interactive Pi sessions instead of hidden child processes
- collapsible cmux workspace grouping
- visible steering, session history, tool calls, and failures

## Install

```bash
npm install --global pi-cmux-subagents
# or
bun add --global pi-cmux-subagents
```

Until the first npm release:

```bash
npm install --global github:manaflow-ai/pi-cmux-subagents
# or
bun add --global github:manaflow-ai/pi-cmux-subagents
```

Do not use `pi install`. This is an explicit launcher, not an auto-loaded Pi
package.

## Run

From any cmux terminal:

```bash
pi-cmux
```

All Pi arguments pass through:

```bash
pi-cmux --model openai-codex/gpt-5.4
pi-cmux "Use an Explore subagent to map the authentication flow."
```

Normal `pi` remains unchanged.

## Use

Ask naturally:

```text
Use an Explore subagent to map the authentication flow.
Run reviewer and Plan in parallel, visibly.
Have worker implement the approved change in a visible subagent.
```

The parent can call:

```ts
Agent({
  subagent_type: "Explore",
  prompt: "Find the authentication entry points and data flow.",
  description: "map auth",
  run_in_background: true
})
```

Supported types are `Explore`, `Plan`, `reviewer`, `worker`, and
`general-purpose`. Read-only roles receive only inspection tools. `worker`
receives file mutation tools.

Use `/cmux-agents` to show a compact status widget. Background completion is
delivered into the parent conversation automatically.

## How it works

1. `pi-cmux` starts Pi with the cmux subagent extension explicitly enabled.
2. The extension identifies the caller workspace through the cmux socket.
3. It reuses the caller's group, or creates `Pi · <project>` containing the parent.
4. It starts each child in an unfocused workspace directly after the parent.
5. A child-only `report_to_parent` tool atomically writes the final handoff.
6. The parent waits or watches that result and can steer the child through cmux.

Run data is stored under `~/.pi/agent/cmux-subagents/`.

## Requirements

- cmux with workspace-group CLI support
- Pi available as `pi` on `PATH`
- Node.js 22 or newer

## Development

```bash
npm install
npm test
npm run typecheck
```

Test the launcher without installing:

```bash
node ./bin/pi-cmux.mjs
```

## Acknowledgements

The tool naming, role model, and foreground/background ergonomics are inspired
by the MIT-licensed projects from
[tintinweb](https://github.com/tintinweb/pi-subagents) and
[Nico Bailon](https://github.com/nicobailon/pi-subagents). This repository uses
an independent cmux-backed runtime.
