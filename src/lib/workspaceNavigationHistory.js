const MAX_HISTORY_ENTRIES = 30

function isWorkspaceHistory(state) {
  return state?.ozzieWorkspaceHistory === true && Array.isArray(state.stack)
}

export function createWorkspaceNavigationState(snapshot) {
  return {
    ozzieWorkspaceHistory: true,
    stack: [snapshot],
    index: 0,
  }
}

export function startWorkspaceNavigation(state, currentSnapshot) {
  const stack = isWorkspaceHistory(state) && !state.pending
    ? state.stack.slice(0, state.index + 1)
    : [currentSnapshot]

  const boundedStack = stack.slice(-MAX_HISTORY_ENTRIES)
  return {
    ozzieWorkspaceHistory: true,
    pending: true,
    stack: boundedStack,
    index: boundedStack.length - 1,
  }
}

export function completeWorkspaceNavigation(state, nextSnapshot) {
  const previousStack = isWorkspaceHistory(state) && state.pending
    ? state.stack.slice(0, state.index + 1)
    : []
  const stack = [...previousStack, nextSnapshot].slice(-MAX_HISTORY_ENTRIES)

  return {
    ozzieWorkspaceHistory: true,
    stack,
    index: stack.length - 1,
  }
}

export function resolveWorkspaceNavigationState(state) {
  if (!isWorkspaceHistory(state) || state.pending || state.stack.length === 0) return null

  const index = Math.min(Math.max(0, state.index), state.stack.length - 1)

  return {
    snapshot: state.stack[index],
    index,
    backStack: state.stack.slice(0, index),
  }
}
