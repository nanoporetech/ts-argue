import { compare } from 'levenstein.js';

export function nearest_string(input: string, possibles: string[]): string {
	let closest_str = '';
	let smallest_dist = Infinity;
	for (const str of possibles) {
		const dist = compare(input, str);
		if (dist < smallest_dist) {
			smallest_dist = dist;
			closest_str = str;
		}
	}
	return closest_str;
}