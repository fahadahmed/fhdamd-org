import { vi } from "vitest";

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: any) => children,
  useSensors: () => [],
  useSensor: () => ({}),
  PointerSensor: vi.fn(),
  closestCenter: () => null,
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: any) => children,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: undefined,
  }),
  arrayMove: (arr: any[], from: number, to: number) => {
    const r = [...arr];
    r.splice(to, 0, r.splice(from, 1)[0]);
    return r;
  },
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => "" } },
}));
