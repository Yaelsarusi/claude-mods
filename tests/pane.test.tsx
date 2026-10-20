import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'todo-pane',
  component: 'Pane',
  requestId: 'todos',
  props: {
    title: 'To-do',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

test('an item ticks and unticks on every surface', async ($, on) => {
  on('command.register', () => ({ value: { command: 'todos' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__todo-pane__set_todos' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    await $.tool.call({
      tool: 'mcp__todo-pane__set_todos',
      sections: [{ title: 'Morning', items: ['Water plants'] }],
    })
    const ui = await $.ui.mount({ ...PANE, surface })
    const before = await ui.find({ key: 't1' })
    expect(before?.text).toBe('☐')
    expect((await ui.find({ type: 'Text', text: /Water plants/ }))?.text).toContain('Water plants')
    await ui.press({ key: 't1' })
    expect((await ui.find({ type: 'Text', text: /0 of 1|1 of 1/ }))?.text).toBe('1 of 1 done')
    expect((await ui.find({ key: 't1' }))?.text).toBe('☑')
    await ui.press({ key: 't1' })
    expect((await ui.find({ type: 'Text', text: /of 1 done/ }))?.text).toBe('0 of 1 done')
    await ui.unmount()
  }
})
