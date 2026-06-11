import type {
	BoardData,
	BoardTask,
	DashboardCalendarData,
	DashboardCalendarEvent,
	ScheduleData,
	ScheduleItem,
} from "../types";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { defineLoader } from "vitepress";
import YAML from "yaml";

declare const data: DashboardCalendarData;
export { data };

const BOARD_FILE = "docs/dashboard/board.yml";
const SCHEDULE_FILE = "docs/dashboard/schedule.yml";
const IGNORED_TASK_STATUSES = new Set([
	"done",
	"cancelled",
	"deferred",
	"deffered",
]);

export default defineLoader({
	watch: [BOARD_FILE, SCHEDULE_FILE],

	load(watchedFiles): DashboardCalendarData {
		const boardFile =
			watchedFiles.find((file) => file.endsWith("board.yml")) ??
			path.join(process.cwd(), BOARD_FILE);
		const scheduleFile =
			watchedFiles.find((file) => file.endsWith("schedule.yml")) ??
			path.join(process.cwd(), SCHEDULE_FILE);

		const board = exists(boardFile)
			? readYaml<Partial<BoardData>>(boardFile)
			: { active: [], backlog: [], archive: [] };
		const scheduleData = exists(scheduleFile)
			? readYaml<Partial<ScheduleData>>(scheduleFile)
			: { schedule: [] };

		const boardEvents = [
			...(board.active ?? []),
			...(board.backlog ?? []),
		].flatMap((task, index) => boardTaskToCalendarEvent(task, index));

		const scheduleEvents = (scheduleData.schedule ?? []).map(
			scheduleItemToCalendarEvent,
		);

		return {
			updated: scheduleData.updated ?? board.updated ?? "",
			events: [...boardEvents, ...scheduleEvents].sort((a, b) =>
				a.start.localeCompare(b.start),
			),
		};
	},
});

function exists(file: string): boolean {
	return fs.existsSync(file);
}

function readYaml<T>(file: string): T {
	return YAML.parse(fs.readFileSync(file, "utf-8")) as T;
}

function boardTaskToCalendarEvent(
	task: BoardTask,
	index: number,
): DashboardCalendarEvent[] {
	if (!task.due) return [];

	if (task.status && IGNORED_TASK_STATUSES.has(task.status)) return [];

	const due = normalizeDateInput(task.due);
	const url = task.notes?.find((note) => note.url)?.url ?? "/dashboard/";
	const content = [task.dod, ...(task.notes?.map((note) => note.text) ?? [])]
		.filter(Boolean)
		.join("\n");

	return [
		{
			id: `board-${stableHash(`${task.title}-${task.due}-${index}`)}`,
			title: task.title,
			start: due.hasTime ? subtractMinutes(due.value, 30) : `${due.date} 00:00`,
			end: due.hasTime ? due.value : `${due.date} 23:59`,
			allDay: !due.hasTime,
			source: "board",
			type: `task-${task.priority ?? "medium"}`,
			content,
			url,
			status: task.status,
			priority: task.priority,
			raw: task,
		},
	];
}

function scheduleItemToCalendarEvent(
	item: ScheduleItem,
): DashboardCalendarEvent {
	return {
		id:
			item.id ??
			`schedule-${stableHash(`${item.title}-${item.start}-${item.end}`)}`,
		title: item.title,
		start: normalizeDateInput(item.start).value,
		end: normalizeDateInput(item.end).value,
		allDay: item.allDay,
		source: "schedule",
		type: item.type ?? "schedule",
		content: item.content ?? item.notes?.map((note) => note.text).join("\n"),
		url: item.url,
		raw: item,
	};
}

const ISO_TZ_RE = /([+-]\d{2}:?\d{2}|Z)$/u;
const DATE_ONLY_RE = /^(\d{4}-\d{2}-\d{2})$/u;
const DATE_TIME_RE = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/u;

function normalizeDateInput(input: string): {
	value: string;
	date: string;
	hasTime: boolean;
} {
	const trimmed = input.trim();
	const isoLike = trimmed.replace("T", " ").replace(ISO_TZ_RE, "").trim();
	const dateOnly = isoLike.match(DATE_ONLY_RE);
	if (dateOnly) {
		return { value: `${dateOnly[1]} 00:00`, date: dateOnly[1], hasTime: false };
	}

	const dateTime = isoLike.match(DATE_TIME_RE);
	if (dateTime) {
		return {
			value: `${dateTime[1]} ${dateTime[2]}`,
			date: dateTime[1],
			hasTime: true,
		};
	}

	throw new Error(`Invalid calendar date: ${input}`);
}

function subtractMinutes(dateTime: string, minutes: number): string {
	const [date, time] = dateTime.split(" ");
	const [year, month, day] = date.split("-").map(Number);
	const [hour, minute] = time.split(":").map(Number);
	const dateObj = new Date(year, month - 1, day, hour, minute - minutes);
	return formatDateTime(dateObj);
}

function formatDateTime(date: Date): string {
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	const hh = String(date.getHours()).padStart(2, "0");
	const mi = String(date.getMinutes()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function stableHash(input: string): string {
	let hash = 0;
	for (let i = 0; i < input.length; i++) {
		hash = (hash << 5) - hash + input.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash).toString(36);
}
