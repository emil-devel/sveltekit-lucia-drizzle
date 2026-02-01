<script lang="ts">
	import { profileBioSchema } from '$lib/valibot';
	import { Tipex, type TipexEditor } from '@friendofsvelte/tipex';
	import { fromAction } from 'svelte/attachments';
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	let props = $props();
	let { id, isSelf } = props;
	let data = $state(props.data);

	const { enhance: bioEnhance, form: bioForm } = superForm(data.bioForm, {
		validators: valibot(profileBioSchema),
		dataType: 'json'
	});

	// Tipex editor setup
	// Initial HTML content from server form
	let body = $state($bioForm.bio ?? '');
	// Editor instance binding
	let editor = $state<TipexEditor>(undefined);
	// Always up-to-date HTML extracted from the editor
	const htmlContent = $derived.by(() => editor?.getHTML() ?? body);
	// Plain text representation for safe display (no HTML injection)
	const plainTextContent = $derived.by(() =>
		htmlContent
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
	);

	// Keep superform field in sync so JSON submission includes latest HTML
	$effect(() => {
		const current = htmlContent;
		if (current !== $bioForm.bio) {
			$bioForm.bio = current;
		}
	});
</script>

{#if isSelf}
	<form
		class="flex items-baseline justify-between gap-4 pb-1"
		method="post"
		action="?/bio"
		{@attach fromAction(bioEnhance)}
	>
		<input class="input" type="hidden" name="id" value={id} />
		<span class="label-text">Bio</span>
		<!-- bio value provided via superforms JSON (kept in sync in script) -->
		<button class="btn preset-tonal btn-sm" type="submit"> Submit </button>
	</form>
	<div class="pb-4">
		<Tipex
			body={$bioForm.bio}
			bind:tipex={editor}
			floating
			focal
			class="h-[40vh] border border-surface-200-800"
		/>
	</div>
{:else}
	<h3 class="label-text">Bio</h3>
	<div class="prose border border-surface-200-800 p-2 prose-invert">
		{plainTextContent}
	</div>
{/if}
