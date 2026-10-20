export type TodoItem = { id: string; text: string; isDone: boolean }
export type TodoSection = { title: string; items: TodoItem[] }

declare module 'claude-code' {
  interface PluginState {
    'todo-pane': { sections: TodoSection[] }
  }
}
