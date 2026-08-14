import { ProjectObservationSnapshot, RawObservationRow, calculateStats } from "./observationAnalysis";
import { compareLayout } from "./observationSort";

export type ComparisonMode = "specificDates" | "dateRange" | "sessions" | "time";
export type GroupBy = "plot" | "treatment";
export type Aggregation = "average" | "minimum" | "maximum" | "growth" | "minMax" | "daily";

export interface ComparisonRequest {
  mode: ComparisonMode;
  selectedDates?: string[];
  from?: string;
  to?: string;
  sessionIds?: string[];
  timeFrom?: string;
  timeTo?: string;
  selectedPlots?: string[];
  selectedTreatments?: string[];
  groupBy?: GroupBy;
  aggregation?: Aggregation;
}

export interface ComparisonPoint {
  category: string;
  values: Record<string, number | null>;
  ranges?: Record<string, { minimum: number; maximum: number } | null>;
  change?: { previous: number; current: number; absolute: number; percentage: number | null };
}

export interface ComparisonResult {
  title: string;
  chartType: "groupedBar" | "line";
  xAxis: string;
  yAxis: string;
  series: Array<{ key: string; label: string }>;
  points: ComparisonPoint[];
  request: ComparisonRequest;
}

const rowDate = (row: RawObservationRow) => row.date.toISOString().slice(0, 10);
const prettyDate = (value: string, includeYear = true) => new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(includeYear ? { year: "numeric" } : {}), timeZone: "UTC" });
const timeLabel = (value: Date) => value.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
const average = (values: number[]) => calculateStats(values).average;

export function buildObservationComparison(snapshot: ProjectObservationSnapshot, observationTypeId: string, input: ComparisonRequest): ComparisonResult | null {
  const analysis = snapshot.analyses.find(item => item.type._id.toString() === observationTypeId);
  if (!analysis) return null;

  const request = { ...input, groupBy: input.groupBy || "plot", aggregation: input.aggregation || "average" } as ComparisonRequest & { groupBy: GroupBy; aggregation: Aggregation };
  let rows = snapshot.rawRows.filter(row => row.observationTypeId === observationTypeId);
  if (request.selectedPlots?.length) rows = rows.filter(row => request.selectedPlots!.includes(row.plotId));
  if (request.selectedTreatments?.length) rows = rows.filter(row => request.selectedTreatments!.includes(row.treatment));

  const sessionMap = new Map(analysis.sessions.map(session => [session.id, session]));
  let periods: Array<{ key: string; label: string; matches: (row: RawObservationRow) => boolean }> = [];
  if (request.mode === "specificDates") {
    periods = [...new Set(request.selectedDates || [])].sort().map(value => ({ key: value, label: prettyDate(value), matches: row => rowDate(row) === value }));
  } else if (request.mode === "dateRange") {
    const from = request.from || "0000-01-01";
    const to = request.to || "9999-12-31";
    // Sessions, rather than calendar dates, are the ordered measurement points.
    // This preserves morning/evening and repeated rounds on the same day.
    periods = analysis.sessions.filter(session => {
      const day = new Date(session.capturedAt).toISOString().slice(0, 10);
      return day >= from && day <= to;
    }).map(session => ({ key: session.id, label: session.label, matches: row => row.measurementSessionId === session.id }));
  } else {
    let ids = request.sessionIds?.length ? request.sessionIds : [];
    if (request.mode === "time") {
      ids = ids.filter(id => {
        const session = sessionMap.get(id);
        if (!session) return false;
        const value = new Date(session.capturedAt).toISOString().slice(11, 16);
        return (!request.timeFrom || value >= request.timeFrom) && (!request.timeTo || value <= request.timeTo);
      });
    }
    periods = ids.flatMap(id => {
      const session = sessionMap.get(id);
      if (!session) return [];
      const label = request.mode === "time"
        ? `${prettyDate(new Date(session.capturedAt).toISOString().slice(0, 10), false)}, ${timeLabel(new Date(session.capturedAt))}`
        : session.label;
      return [{ key: id, label, matches: (row: RawObservationRow) => row.measurementSessionId === id }];
    });
  }

  const categories = new Map<string, RawObservationRow[]>();
  rows.forEach(row => {
    const key = request.groupBy === "treatment" ? row.treatment : row.plotId;
    if (key) categories.set(key, [...(categories.get(key) || []), row]);
  });

  const orderedCategories=[...categories].sort(([leftKey,leftRows],[rightKey,rightRows])=>request.groupBy==="treatment"?Number(leftKey.replace(/^T/,""))-Number(rightKey.replace(/^T/,"")):compareLayout(leftRows[0],rightRows[0],"replication"));
  const points = orderedCategories.map(([key, categoryRows]): ComparisonPoint => {
    const values: Record<string, number | null> = {};
    const ranges: Record<string, { minimum: number; maximum: number } | null> = {};
    periods.forEach(period => {
      const numbers = categoryRows.filter(period.matches).map(row => Number(row.value)).filter(Number.isFinite);
      const stats = calculateStats(numbers);
      values[period.key] = request.aggregation === "minimum" ? stats.minimum : request.aggregation === "maximum" ? stats.maximum : stats.average;
      ranges[period.key] = stats.minimum == null || stats.maximum == null ? null : { minimum: stats.minimum, maximum: stats.maximum };
    });
    if (request.aggregation === "growth") {
      const baseline = periods.map(period => values[period.key]).find((value): value is number => value != null);
      periods.forEach(period => { if (values[period.key] != null && baseline != null) values[period.key] = values[period.key]! - baseline; });
    }
    const pair = periods.length === 2 ? [values[periods[0].key], values[periods[1].key]] : null;
    const change = pair && pair[0] != null && pair[1] != null ? {
      previous: pair[0], current: pair[1], absolute: pair[1] - pair[0],
      percentage: pair[0] === 0 ? null : ((pair[1] - pair[0]) / Math.abs(pair[0])) * 100,
    } : undefined;
    return { category: request.groupBy === "treatment" ? key : categoryRows[0]?.plot || key, values, ...(request.aggregation === "minMax" ? { ranges } : {}), change };
  });

  const typeName = analysis.type.name;
  const unit = analysis.type.unit ? ` (${analysis.type.unit})` : "";
  const grouping = request.groupBy === "treatment" ? "By Treatment" : "By Plot";
  const periodText = periods.map(period => period.label).join(" vs ");
  const rangeText = request.mode === "dateRange" && request.from && request.to ? `${prettyDate(request.from, false)}–${prettyDate(request.to)}` : periodText;
  const aggregationText = request.mode === "dateRange" ? ({ daily: "Daily Values", average: "Daily Average", growth: "Growth", minMax: "Daily Min/Max", minimum: "Daily Minimum", maximum: "Daily Maximum" }[request.aggregation]) : "";
  const title = `${typeName} — ${rangeText}${aggregationText ? ` — ${aggregationText}` : ""} — ${grouping}`;
  return { title, chartType: request.mode === "dateRange" ? "line" : "groupedBar", xAxis: request.mode === "dateRange" ? "Date" : request.groupBy === "treatment" ? "Treatment" : "Plot", yAxis: `${typeName}${unit}`, series: periods.map(period => ({ key: period.key, label: period.label })), points, request };
}
