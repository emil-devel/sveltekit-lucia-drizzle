type SanitizeOptions = {
	trim?: string[];
	lowercase?: string[];
	/**
	 * Convert empty strings (after trim/lowercase) into undefined.
	 * Useful for optional fields.
	 */
	emptyToUndefined?: string[];
};

/**
 * Converts a FormData object into a plain object and applies small, explicit
 * normalization steps (trim/lowercase) before validation.
 */
export function sanitizeFormData(formData: FormData, options: SanitizeOptions = {}) {
	const trim = new Set(options.trim ?? []);
	const lowercase = new Set(options.lowercase ?? []);
	const emptyToUndefined = new Set(options.emptyToUndefined ?? []);

	const out: Record<string, unknown> = {};
	for (const [key, value] of formData.entries()) {
		if (typeof value === 'string') {
			let next = value;
			if (trim.has(key)) next = next.trim();
			if (lowercase.has(key)) next = next.toLowerCase();
			if (emptyToUndefined.has(key) && next.length === 0) {
				out[key] = undefined;
			} else {
				out[key] = next;
			}
		} else {
			// File
			out[key] = value;
		}
	}
	return out;
}
