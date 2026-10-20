# todo-pane

A Claude Code mod that keeps a to-do checklist in a pane beside the chat. When Claude gives you steps to do yourself, it puts them in the pane with its `set_todos` tool, grouped by section. Click an item to tick it off; `/todos` reopens the pane.

## Install

At the prompt of a terminal session:

```
/plugin install todo-pane --marketplace Yaelsarusi/claude-mods
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install todo-pane --marketplace Yaelsarusi/claude-mods
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `Yaelsarusi/claude-mods`, then Add plugin.

This repository is private: installing needs read access to it and a git credential for github.com on your machine (an SSH key, or `gh auth login` then `gh auth setup-git`).
