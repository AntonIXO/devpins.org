import { expect, test } from 'bun:test';
import { readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);

test('moved WHOOP vs Fitbit and deleted Fitbit vs Oura have no local posts in either language', () => {
	const posts = readdirSync(new URL('src/content/blog/', root)).sort();
	expect(posts).toEqual([
		'ai360-itmo-ru.md',
		'fear-of-calculus-itmo-ai360.md',

		'ne-ya-umer-en.md',
		'ne-ya-umer.md',
	]);
});
