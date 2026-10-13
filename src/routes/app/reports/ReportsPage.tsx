/**
 * Halo Reports page — `/app/reports` (Phase 4, plan 04-05 Task 2).
 *
 * Page composer for the Phase 4 Reports surface. Closes REP-01..04:
 *
 *   - REP-01: three filter dimensions — Date range (DatePickerInput type='range'
 *     from @mantine/dates) + Assignee Select + Status MultiSelect, ANDed.
 *   - REP-02: TanStack Table v8 with 6 read-only columns (Title / Status /
 *     Priority / Assignee / Due date / Completed at). Default sort createdAt desc.
 *   - REP-03: Recharts stacked BarChart with three Bars (To do / In progress /
 *     Done); tick density per D-20; theme-resolved colors per D-18.
 *   - REP-04: Export CSV button (top-right) → hand-rolled RFC 4180 CSV →
 *     Blob + URL.createObjectURL + ephemeral <a download> click.
 *
 * Filter defaults (D-19 + D-22):
 *   - Date range: [computeNowRef(allTasks) - 30d, computeNowRef(allTasks)]
 *     (anchored to most recent task activity so the demo never goes stale;
 *      shared with the Dashboard via src/tasks/now-ref.ts).
 *   - Assignee: 'all'
 *   - Status: ['todo', 'in_progress', 'done'] (all three selected — equivalent
 *     to no status filter). Deselecting every chip ALSO yields no filter
 *     (empty array = match-all), matching the Lists `All` Select idiom — the
 *     user cannot strand themselves in a recovery-less empty state by
 *     deselecting all statuses. See 04-REVIEW.md CR-03 + 04-06-PLAN.md Task D
 *     for the override of the original Phase 04-05 design note.
 *
 * Filter predicate: tasks are matched on `createdAt` against the date-range
 * bounds (the chart day-buckets and the table both anchor to createdAt so the
 * three views stay aligned). Assignee filter compares against `task.assignee.id`
 * with the sentinel `'all'`. Status filter is a multi-select includes() check.
 *
 * Defensive narrowing: RequireAuth + AppLayout already gate `/app/*`, but mirror
 * the Dashboard.tsx belt-and-suspenders fallback for `workspaceId`/`visitor`.
 *
 * Router import contract: this file MUST export a function named `ReportsPage`
 * (named export, no default) — `src/router.tsx` imports it that way and the
 * Phase 3 D-01 placeholder convention forbids router edits at phase boundaries.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Stack, Group, Title } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { Button } from '../../../ui/primitives'
import { PENDO_IDS } from '../../../pendo/PENDO_IDS'
import { useAuthStore } from '../../../auth/authStore'
import { listTasks } from '../../../tasks/tasksRepo'
import { computeNowRef } from '../../../tasks/now-ref'
import type { TaskStatus } from '../../../tasks/types'
import { ReportsFiltersBar } from '../../../reports/ReportsFiltersBar'
import { ReportsChart } from '../../../reports/ReportsChart'
import { ReportsTable } from '../../../reports/ReportsTable'
import { exportTasksToCsv } from '../../../reports/csvExport'

const DEFAULT_STATUS_FILTER: TaskStatus[] = ['todo', 'in_progress', 'done']

/**
 * Inclusive UTC calendar-day count of a complete date range — the same day
 * semantics as the filter predicate below. `null` when either end is open
 * (cleared range, or only the start date picked). Sent to Pendo as
 * `dateRangeDays` on the report events.
 */
function countRangeDays([start, end]: [Date | null, Date | null]): number | null {
  if (!start || !end) return null
  return dayjs.utc(end).startOf('day').diff(dayjs.utc(start).startOf('day'), 'day') + 1
}

export function ReportsPage(): React.JSX.Element {
  const visitor = useAuthStore((s) => s.currentVisitor)
  const workspaceId = useAuthStore((s) => s.currentWorkspace?.id)

  // Single read of the workspace's task list. Reports is read-only, so the
  // memoization key is just workspaceId — there is no CRUD refresh ticker
  // (compare ListsPage which carries one for create/edit/delete cycles).
  const allTasks = useMemo(() => (workspaceId ? listTasks(workspaceId) : []), [workspaceId])

  // Anchor "now" to the most recent task activity (shared with Dashboard via D-22).
  const nowRef = useMemo(() => computeNowRef(allTasks), [allTasks])

  // Default date range: [nowRef - 30 days, nowRef].
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() => [
    dayjs(nowRef).subtract(30, 'day').toDate(),
    dayjs(nowRef).toDate(),
  ])
  const [assignee, setAssignee] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>(DEFAULT_STATUS_FILTER)

  // Filtered + sorted task slice. createdAt-anchored date filter; assignee
  // equality on .id; status multi-select includes().
  const filteredTasks = useMemo(() => {
    return allTasks
      .filter((t) => {
        // UTC-anchored date-range predicate: t.createdAt and the dateRange
        // bounds are both interpreted as UTC instants so this filter agrees
        // with ReportsChart's bucket axis (also UTC, post 04-06-PLAN.md Task C)
        // on "what day is this task in." See 04-REVIEW.md CR-02.
        if (
          dateRange[0] &&
          dayjs.utc(t.createdAt).isBefore(dayjs.utc(dateRange[0]).startOf('day'))
        ) {
          return false
        }
        if (
          dateRange[1] &&
          dayjs.utc(t.createdAt).isAfter(dayjs.utc(dateRange[1]).endOf('day'))
        ) {
          return false
        }
        if (assignee !== 'all' && t.assignee?.id !== assignee) return false
        // Empty status selection = match-all (matches Lists' `All` Select idiom).
        // Pre-04-06: empty array meant "filter out everything," which stranded
        // users who deselected every Status chip with no recovery affordance.
        // See 04-REVIEW.md CR-03 + 04-06-PLAN.md Task D for the override rationale.
        if (statusFilter.length > 0 && !statusFilter.includes(t.status)) return false
        return true
      })
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
  }, [allTasks, dateRange, assignee, statusFilter])

  // Pendo report_filtered bookkeeping: the report parameters last reported,
  // seeded with the mount-time defaults so nothing fires on first render.
  const lastTrackedReportFilters = useRef({
    dateRangeStart: dateRange[0]?.toISOString() ?? '',
    dateRangeEnd: dateRange[1]?.toISOString() ?? '',
    assignee,
    statusFilters: statusFilter.join(', '),
  })

  // Fires once per report-parameter change, after filteredTasks has been
  // recomputed (so taskCount reflects the regenerated chart + table).
  useEffect(() => {
    // Range picker mid-selection ([start, null]) — wait for the end date.
    if (dateRange[0] !== null && dateRange[1] === null) return
    const current = {
      dateRangeStart: dateRange[0]?.toISOString() ?? '',
      dateRangeEnd: dateRange[1]?.toISOString() ?? '',
      assignee,
      statusFilters: statusFilter.join(', '),
    }
    const last = lastTrackedReportFilters.current
    const changed: string[] = []
    if (
      last.dateRangeStart !== current.dateRangeStart ||
      last.dateRangeEnd !== current.dateRangeEnd
    ) {
      changed.push('date_range')
    }
    if (last.assignee !== current.assignee) changed.push('assignee')
    if (last.statusFilters !== current.statusFilters) changed.push('status')
    if (changed.length === 0) return
    lastTrackedReportFilters.current = current
    if (typeof pendo !== 'undefined') {
      pendo.track('report_filtered', {
        changedFilter: changed.join(', '),
        dateRangeStart: current.dateRangeStart,
        dateRangeEnd: current.dateRangeEnd,
        dateRangeDays: countRangeDays(dateRange),
        assigneeFilter: assignee,
        statusFilters: current.statusFilters,
        taskCount: filteredTasks.length,
        totalTaskCount: allTasks.length,
      })
    }
  }, [dateRange, assignee, statusFilter, filteredTasks.length, allTasks.length])

  // Defensive narrowing — RequireAuth already gates this path.
  if (!workspaceId || !visitor) return <></>

  return (
    <Stack gap="lg">
      {/* Page header — Title left, Export CSV right (D-23, UI-SPEC lines 638-651) */}
      <Group justify="space-between" align="center">
        <Title order={3}>Reports</Title>
        <Button
          variant="outline"
          leftSection={<IconDownload size={16} />}
          pendoId={PENDO_IDS.reports.csvExport}
          onClick={() => {
            if (typeof pendo !== 'undefined') {
              pendo.track('report_exported_csv', {
                taskCount: filteredTasks.length,
                dateRangeStart: dateRange[0]?.toISOString() ?? '',
                dateRangeEnd: dateRange[1]?.toISOString() ?? '',
                dateRangeDays: countRangeDays(dateRange),
                assigneeFilter: assignee,
                statusFilters: statusFilter.join(', '),
              })
            }
            exportTasksToCsv(filteredTasks)
          }}
          disabled={filteredTasks.length === 0}
        >
          Export CSV
        </Button>
      </Group>

      <ReportsFiltersBar
        workspaceId={workspaceId}
        visitor={visitor}
        dateRange={dateRange}
        assignee={assignee}
        statusFilter={statusFilter}
        onDateRangeChange={setDateRange}
        onAssigneeChange={setAssignee}
        onStatusChange={setStatusFilter}
      />

      <ReportsChart tasks={filteredTasks} dateRange={dateRange} />

      <ReportsTable tasks={filteredTasks} />
    </Stack>
  )
}
