<script lang="ts">
	import { profileLastNameSchema } from '$lib/valibot';
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { UserRound } from '@lucide/svelte';

	let props = $props();
	let { id, isSelf, iconSize } = props;
	let data = $state(props.data);

	const {
		enhance: lastNameEnhance,
		form: lastNameForm,
		errors: lastNameErrors
	} = superForm(data.lastNameForm, { validators: valibot(profileLastNameSchema) });

	const errorsLastName = $derived(($lastNameErrors.lastName ?? []) as string[]);

	let lastNameEdit = $state(false);
	let lastNameFormEl: HTMLFormElement | null = $state(null);
</script>

{#if isSelf}
	<form bind:this={lastNameFormEl} method="post" action="?/lastName" use:lastNameEnhance>
		<input class="input" type="hidden" name="id" value={id} />
		<label class="label label-text" for="lastName">Last Name</label>
		<div class="input-group grid-cols-[auto_1fr_auto]">
			<div class="ig-cell preset-tonal py-1.5 {lastNameEdit ? 'text-warning-500' : ''}">
				<UserRound size={iconSize} />
			</div>
			<input
				class="ig-input text-sm"
				type="text"
				name="lastName"
				bind:value={$lastNameForm.lastName}
				onkeyup={() => (lastNameEdit = true)}
				onfocusout={() => {
					if (lastNameEdit && lastNameFormEl) {
						lastNameFormEl.requestSubmit();
						lastNameEdit = false;
					}
				}}
				id="lastName"
				spellcheck="false"
			/>
		</div>
	</form>
	{#if errorsLastName && $lastNameForm.lastName}
		<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm" aria-live="polite">
			{#each errorsLastName as message, i (i)}
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
		<p class="label-text">Last Name</p>
		<div class="input-group grid-cols-[auto_1fr_auto]">
			<div class="ig-cell preset-tonal py-1.5"><UserRound size={iconSize} /></div>
			<span class="ig-input text-sm">{$lastNameForm.lastName}</span>
		</div>
	</div>
{/if}
