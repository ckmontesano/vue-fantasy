<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  rowKey: {
    type: [String, Function],
    default: null,
  },
  emptyMessage: {
    type: String,
    default: "No data available.",
  },
  containerClass: {
    type: String,
    default: "overflow-x-auto",
  },
  tableClass: {
    type: String,
    default: "min-w-full border-collapse text-sm",
  },
  headerRowClass: {
    type: String,
    default: "bg-zinc-300 dark:bg-zinc-700",
  },
  rowClass: {
    type: [String, Function],
    default: "odd:bg-zinc-100 odd:dark:bg-zinc-800/70",
  },
  headerCellClass: {
    type: String,
    default: "whitespace-nowrap border border-zinc-500/50 px-3 py-2 text-left",
  },
  cellClass: {
    type: String,
    default: "border border-zinc-500/50 px-3 py-2",
  },
});

const activeSortKey = ref(null);
const activeSortDirection = ref("asc");

function getColumnValue(column, row) {
  if (typeof column.value === "function") {
    return column.value(row);
  }

  return row?.[column.key];
}

function getSortValue(column, row) {
  if (typeof column.sortValue === "function") {
    return column.sortValue(row);
  }

  return getColumnValue(column, row);
}

function compareValues(left, right) {
  if (left == null && right == null) {
    return 0;
  }

  if (left == null) {
    return 1;
  }

  if (right == null) {
    return -1;
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  if (typeof left === "boolean" && typeof right === "boolean") {
    return Number(left) - Number(right);
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function toggleSort(column) {
  if (!column.sortable) {
    return;
  }

  if (activeSortKey.value !== column.key) {
    activeSortKey.value = column.key;
    activeSortDirection.value = column.sortDirection || "asc";
    return;
  }

  activeSortDirection.value = activeSortDirection.value === "asc" ? "desc" : "asc";
}

function getRowKey(row, rowIndex) {
  if (typeof props.rowKey === "function") {
    return props.rowKey(row, rowIndex);
  }

  if (typeof props.rowKey === "string") {
    return row?.[props.rowKey] ?? rowIndex;
  }

  return rowIndex;
}

function resolveRowClass(row, rowIndex) {
  if (typeof props.rowClass === "function") {
    return props.rowClass(row, rowIndex);
  }

  return props.rowClass;
}

const sortedRows = computed(() => {
  const rows = props.rows || [];

  if (!activeSortKey.value) {
    return rows;
  }

  const column = props.columns.find((candidate) => candidate.key === activeSortKey.value);

  if (!column?.sortable) {
    return rows;
  }

  return [...rows].sort((leftRow, rightRow) => {
    const comparison = compareValues(
      getSortValue(column, leftRow),
      getSortValue(column, rightRow),
    );

    return activeSortDirection.value === "asc" ? comparison : -comparison;
  });
});
</script>

<template>
  <div :class="containerClass">
    <table :class="tableClass">
      <thead>
        <tr :class="headerRowClass">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[headerCellClass, column.headerClass]"
            :aria-sort="
              activeSortKey === column.key
                ? activeSortDirection === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'
            ">
            <button
              v-if="column.sortable"
              type="button"
              class="inline-flex w-full items-center gap-1 text-left"
              @click="toggleSort(column)">
              <slot :name="`header-${column.key}`" :column="column">{{ column.label }}</slot>
              <span v-if="activeSortKey === column.key">{{ activeSortDirection === "asc" ? "▲" : "▼" }}</span>
            </button>
            <template v-else>
              <slot :name="`header-${column.key}`" :column="column">{{ column.label }}</slot>
            </template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="sortedRows.length === 0">
          <td :colspan="columns.length" :class="cellClass">
            <slot name="empty">{{ emptyMessage }}</slot>
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="(row, rowIndex) in sortedRows"
            :key="getRowKey(row, rowIndex)"
            :class="resolveRowClass(row, rowIndex)">
            <td
              v-for="column in columns"
              :key="column.key"
              :class="[cellClass, column.cellClass]">
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :column="column"
                :value="getColumnValue(column, row)"
                :rowIndex="rowIndex">
                {{ getColumnValue(column, row) }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
