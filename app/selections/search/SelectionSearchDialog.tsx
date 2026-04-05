"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { SelectionSearchBounds } from "@/types/utaroSelection";
import { useState } from "react";
import {
  hasActiveSearchFilters,
  type RangeState,
} from "./selectionSearchRange";
import { SelectionSearchFilters } from "./SelectionSearchFilters";

type Props = {
  bounds: SelectionSearchBounds;
  ranges: RangeState;
};

export function SelectionSearchDialog({ bounds, ranges }: Props) {
  const [open, setOpen] = useState(false);
  const active = hasActiveSearchFilters(ranges, bounds);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
          >
            {active ? (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-amber-300"
                aria-hidden
              />
            ) : null}
            絞り込み検索
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[min(90vh,720px)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg outline-none sm:p-6">
            <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <Dialog.Title className="text-lg font-semibold text-zinc-900">
                  検索条件
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-zinc-600">
                  カロリー・PFC・金額の範囲で絞り込みます。
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="shrink-0 rounded-full p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  aria-label="閉じる"
                >
                  <span className="block text-xl leading-none" aria-hidden>
                    ×
                  </span>
                </button>
              </Dialog.Close>
            </div>
            <div className="mt-4">
              <SelectionSearchFilters
                bounds={bounds}
                ranges={ranges}
                onAfterNavigate={() => setOpen(false)}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {active ? (
        <span className="text-xs font-medium text-emerald-800">
          絞り込み中
        </span>
      ) : null}
    </div>
  );
}
