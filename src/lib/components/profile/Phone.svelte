<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { profilePhoneSchema } from '$lib/valibot';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { Phone } from '@lucide/svelte';

	let props = $props();
	let { id, isSelf, iconSize } = props;
	let data = $state(props.data);

	const {
		enhance: phoneEnhance,
		form: phoneForm,
		errors: phoneErrors
	} = superForm(data.phoneForm, { validators: valibot(profilePhoneSchema) });

	const errorsPhone = $derived(($phoneErrors.phone ?? []) as string[]);

	// Normalized phone for "tel: link" after passing the schema.
	const normalizedPhone = $derived.by(() => {
		let raw = $phoneForm.phone?.trim();
		if (!raw) return '';
		// Remove spaces
		let val = raw.replace(/\s+/g, '');
		// Convert 00 international prefix to +
		if (val.startsWith('00')) {
			val = '+' + val.slice(2);
		}
		return val;
	});

	let phoneEdit = $state(false);
	let phoneFormEl: HTMLFormElement | null = $state(null);
</script>

{#if isSelf}
	<form bind:this={phoneFormEl} method="post" action="?/phone" use:phoneEnhance>
		<input class="input" type="hidden" name="id" value={id} />
		<label class="label label-text" for="phone">Phone</label>
		<div class="input-group grid-cols-[auto_1fr_auto]">
			<div class="ig-cell preset-tonal py-1.5 {phoneEdit ? 'text-warning-500' : ''}">
				<Phone size={iconSize} />
			</div>
			<input
				class="ig-input text-sm"
				type="tel"
				name="phone"
				bind:value={$phoneForm.phone}
				onkeyup={() => (phoneEdit = true)}
				onfocusout={() => {
					if (phoneEdit && phoneFormEl) {
						phoneFormEl.requestSubmit();
						phoneEdit = false;
					}
				}}
				id="phone"
				spellcheck="false"
			/>
		</div>
	</form>
	{#if errorsPhone && $phoneForm.phone}
		<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm" aria-live="polite">
			{#each errorsPhone as message, i (i)}
				<p
					class="card preset-filled-error-300-700 p-2"
					transition:slide={{ duration: 140 }}
					animate:flip={{ duration: 160 }}
				>
					{message}
				</p>
			{/each}
		</div>
	{/if}
{:else}
	<div>
		<p class="label-text">Phone</p>
		<div class="input-group grid-cols-[auto_1fr_auto]">
			<div class="ig-cell preset-tonal py-1.5"><Phone size={iconSize} /></div>
			<span class="ig-input text-sm">
				{#if normalizedPhone}
					<a href={'tel:' + normalizedPhone}>{$phoneForm.phone}</a>
				{:else}
					{$phoneForm.phone}
				{/if}
			</span>
		</div>
	</div>
{/if}
