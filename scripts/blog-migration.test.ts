import { expect, test } from 'bun:test';
import { readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);

test('only WHOOP vs Fitbit local articles are removed, including the Russian translation', () => {
	const posts = readdirSync(new URL('src/content/blog/', root)).sort();
	expect(posts).toEqual([
		'ai360-itmo-ru.md',
		'fear-of-calculus-itmo-ai360.md',
		'fitbit-vs-oura-ru.md',
		'fitbit-vs-oura.md',
		'ne-ya-umer-en.md',
		'ne-ya-umer.md',
	]);
});
