import { useCallback, useState } from "react";

interface UseTableSelectionOptions {
  /**
   * Ids on the current page that are eligible for selection. Rows that must
   * stay read-only should be excluded by the caller.
   */
  selectableIds: number[];
  /**
   * A value that changes whenever the selection scope changes (page, filter,
   * or result set). Selection is cleared when this changes.
   */
  resetKey: string;
}

/**
 * Fine-grained table row selection built on a `Set<number>` of id values.
 *
 * The caller derives the "select all" checkbox state from the returned
 * `allSelected` and `someSelected` booleans. `someSelected && !allSelected`
 * is the indeterminate state.
 */
export function useTableSelection({
  selectableIds,
  resetKey,
}: Readonly<UseTableSelectionOptions>) {
  const [state, setState] = useState<{
    resetKey: string;
    selectedIds: Set<number>;
  }>({ resetKey, selectedIds: new Set<number>() });

  // Clear the selection whenever the scope (page or filters) changes. React
  // re-renders immediately after this render-phase adjustment, so the stale
  // selection never reaches the user.
  if (state.resetKey !== resetKey) {
    setState({ resetKey, selectedIds: new Set<number>() });
  }

  const { selectedIds } = state;

  const toggleId = useCallback((id: number) => {
    setState((prev) => {
      const next = new Set(prev.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { ...prev, selectedIds: next };
    });
  }, []);

  const toggleAll = useCallback(() => {
    setState((prev) => {
      const next = new Set(prev.selectedIds);
      const allSelected =
        selectableIds.length > 0 &&
        selectableIds.every((id) => next.has(id));

      if (allSelected) {
        selectableIds.forEach((id) => next.delete(id));
      } else {
        selectableIds.forEach((id) => next.add(id));
      }
      return { ...prev, selectedIds: next };
    });
  }, [selectableIds]);

  const clear = useCallback(() => {
    setState((prev) => ({ ...prev, selectedIds: new Set<number>() }));
  }, []);

  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedIds.has(id));
  const someSelected = selectableIds.some((id) => selectedIds.has(id));

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    allSelected,
    someSelected,
    toggleId,
    toggleAll,
    clear,
  };
}
