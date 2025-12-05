<script lang="ts">
	import { profileBioSchema } from '$lib/valibot';
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';

	let props = $props();
	let { id, isSelf } = props;
	let data = $state(props.data);

	const { enhance: bioEnhance, form: bioForm } = superForm(data.bioForm, {
		validators: valibot(profileBioSchema),
		dataType: 'json'
	});

	// Tipex
	import { Tipex } from '@friendofsvelte/tipex';
	// Initial HTML content from server form
	let body = $state($bioForm.bio ?? '');
	// Editor instance binding (use a permissive type to avoid tiptap version type mismatches)
	let editor = $state<any>();
	// Always up-to-date HTML extracted from the editor
	const htmlContent = $derived.by(() => editor?.getHTML() ?? body);

	// Keep superform field in sync so JSON submission includes latest HTML
	$effect(() => {
		if (editor) {
			const current = editor.getHTML();
			if (current !== $bioForm.bio) {
				$bioForm.bio = current;
			}
		}
	});
</script>

{#if isSelf}
	<form
		class="flex items-baseline justify-between gap-4 pb-1"
		method="post"
		action="?/bio"
		use:bioEnhance
	>
		<input class="input" type="hidden" name="id" value={id} />
		<label class="label" for="id"><span class="label-text">Bio</span></label>
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
		{@html htmlContent}
	</div>
{/if}
