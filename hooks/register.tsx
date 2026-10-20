import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { TodoSection } from '../types'

const PANE = 'todos'
const TITLE = 'To-do'
const sections = atom({ plugin: 'todo-pane', key: 'sections' } as const, [])

type SectionInput = { title: string; items: string[] }

const build = (input: SectionInput[], previous: TodoSection[]): TodoSection[] => {
  const done = new Set(previous.flatMap(s => s.items.filter(i => i.isDone).map(i => i.text)))
  let n = 0
  return input.map(s => ({
    title: s.title,
    items: s.items.map(text => ({ id: `t${++n}`, text, isDone: done.has(text) })),
  }))
}

const open = ($: EngineInterface) => $.ui.open({ id: PANE, title: TITLE })

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'todos', description: 'Open the to-do checklist pane' })
    await $.tool.register({
      name: 'set_todos',
      description:
        'Puts a to-do checklist in the pane beside the chat. Call it whenever you give the user a list of things they must do themselves (manual steps, follow-ups, config changes). Pass the whole list grouped by section; it replaces the current one, and items with the same text keep their ticked state.',
      isDeferred: false,
      inputSchema: {
        type: 'object',
        properties: {
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                items: { type: 'array', items: { type: 'string' } },
              },
              required: ['title', 'items'],
            },
          },
        },
        required: ['sections'],
      },
    })
    void open($)

    return next(e)
  })

  on('command.run', { command: 'todos' }, async $ => {
    await open($)

    return { text: 'To-do pane opened.' }
  })

  on('tool.call', { tool: 'mcp__todo-pane__set_todos' }, async ($, e) => {
    const input = (e as unknown as { sections?: SectionInput[] }).sections ?? []
    await update($, sections, prev => build(input, prev))
    await open($)
    const count = input.reduce((sum, s) => sum + s.items.length, 0)

    return { result: `Checklist set: ${count} items in ${input.length} sections.` }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const list = await read($, sections)
    const all = list.flatMap(s => s.items)
    const doneCount = all.filter(i => i.isDone).length
    const toggle = (id: string) =>
      update($, sections, prev =>
        prev.map(s => ({
          ...s,
          items: s.items.map(i => (i.id === id ? { ...i, isDone: !i.isDone } : i)),
        })),
      )

    return (
      <Box flexDirection="column">
        {all.length === 0 && <Text dimColor>No to-dos yet.</Text>}
        {all.length > 0 && (
          <Text dimColor>
            {doneCount} of {all.length} done
          </Text>
        )}
        {list.map(s => (
          <Box key={s.title} flexDirection="column" marginTop={1}>
            <Text bold>{s.title}</Text>
            {s.items.map(i => (
              <Button key={i.id} plain onPress={() => toggle(i.id)}>
                <Text dimColor={i.isDone} strikethrough={i.isDone}>
                  {i.isDone ? '☑' : '☐'} {i.text}
                </Text>
              </Button>
            ))}
          </Box>
        ))}
      </Box>
    )
  })
}
