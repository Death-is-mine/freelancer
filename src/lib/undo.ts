import { useState, useEffect, useCallback } from 'react'

type Action =
  | { type: 'delete'; store: string; item: unknown }
  | { type: 'create'; store: string; item: unknown }

const _undoStack: Action[] = []
let _redoStack: Action[] = []
const _listeners: Set<() => void> = new Set()

function notify() {
  _listeners.forEach((l) => l())
}

export function pushUndo(action: Action) {
  _undoStack.push(action)
  _redoStack = []
  notify()
}

export function popUndo(): Action | undefined {
  const a = _undoStack.pop()
  if (a) _redoStack.push(a)
  notify()
  return a
}

export function popRedo(): Action | undefined {
  const a = _redoStack.pop()
  if (a) _undoStack.push(a)
  notify()
  return a
}

export function useUndoCount() {
  const [count, setCount] = useState({ undo: 0, redo: 0 })
  const update = useCallback(
    () => setCount({ undo: _undoStack.length, redo: _redoStack.length }),
    [],
  )
  useEffect(() => {
    _listeners.add(update)
    return () => {
      _listeners.delete(update)
    }
  }, [update])
  return count
}
