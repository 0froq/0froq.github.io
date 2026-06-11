const FRONTMATTER_RE = /---[\s\S]*?---/;
const HTML_TAG_RE = /<[\s\S]*?>/g;
const ZH_RE = /[\u4E00-\u9FA5]/g;
const EN_RE = /[a-z]/gi;
const CODE_BLOCK_RE = /```[\s\S]*?```/g;
const TAG_REG =
	/<a href="[./tags][^"]*">\s*<span class="tag">(.*?)<\/span>\s*<\/a>/g;

function calculateReadingTime(text?: string): number {
	if (!text) {
		return 0;
	}

	const WORDS_PER_MINUTE_ZH = 400;
	const WORDS_PER_MINUTE_EN = 225;
	const BLOCKS_PER_MINUTE_CODE = 1;

	const content = text
		.replace(FRONTMATTER_RE, "") // Remove frontmatter
		.replace(HTML_TAG_RE, ""); // Remove HTML tags

	const countZh = content.match(ZH_RE)?.length || 0;
	const countEn = content.match(EN_RE)?.length || 0;
	const countCodeBlocks = content.match(CODE_BLOCK_RE)?.length || 0;

	const minutes = Math.ceil(
		countZh / WORDS_PER_MINUTE_ZH +
			countEn / WORDS_PER_MINUTE_EN +
			countCodeBlocks * BLOCKS_PER_MINUTE_CODE,
	);

	return minutes;
}

function dealTagHierarchy(tag: string): Set<string> {
	const tags = new Set<string>();
	const levels = tag.split("/");
	levels.forEach((_: string, i: number) => {
		tags.add(levels.slice(0, i + 1).join("/"));
	});

	return tags;
}

function getTags(
	html: string | undefined,
	frontmatter: Record<string, any>,
): {
	tags: Set<string>;
	tagsExtended: Set<string>;
} {
	let tagsExtended: Set<string> = new Set();
	const tags: Set<string> = new Set();

	if (!html) {
		return {
			tags,
			tagsExtended,
		};
	}

	let match: RegExpExecArray | null = TAG_REG.exec(html);

	while (match) {
		tags.add(match[1]);
		tagsExtended = new Set([...tagsExtended, ...dealTagHierarchy(match[1])]);
		match = TAG_REG.exec(html);
	}

	if (frontmatter.tags) {
		frontmatter.tags.forEach((tag: string) => {
			tags.add(tag);
			tagsExtended = new Set([...tagsExtended, ...dealTagHierarchy(tag)]);
		});
	}

	return {
		tags,
		tagsExtended,
	};
}

function normalizeCategory(category: string | undefined): string {
	const categoryMap: Record<string, string> = {
		log: "代序",
		roadmap: "成言",
		collection: "前脩",
	};
	if (!category) {
		return "未分类";
	}
	return categoryMap[category] || category;
}

export { calculateReadingTime, getTags, normalizeCategory };
