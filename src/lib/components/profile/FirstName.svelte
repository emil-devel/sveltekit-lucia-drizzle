<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { profileFirstNameSchema } from '$lib/valibot';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { UserRound } from '@lucide/svelte';

	let props = $props();
	let { id, isSelf, iconSize } = props;
	let data = $state(props.data);

	const {
		enhance: firstNameEnhance,
		form: firstNameForm,
		errors: firstNameErrors
	} = superForm(data.firstNameForm, { validators: valibot(profileFirstNameSchema) });

	const errorsFirstName = $derived(($firstNameErrors.firstName ?? []) as string[]);

	let firstNameEdit = $state(false);
	let firstNameFormEl: HTMLFormElement | null = $state(null);
</script>

{#if isSelf}
	<form bind:this={firstNameFormEl} method="post" action="?/firstName" use:firstNameEnhance>
		<input class="input" type="hidden" name="id" value={id} />
		<label class="label label-text" for="firstName">First Name</label>
		<div class="input-group grid-cols-[auto_1fr_auto]">
			<div class="ig-cell preset-tonal py-1.5 {firstNameEdit ? 'text-warning-500' : ''}">
				<UserRound size={iconSize} />
			</div>
			<input
				class="ig-input text-sm"
				type="text"
				name="firstName"
				bind:value={$firstNameForm.firstName}
				onkeyup={() => (firstNameEdit = true)}
				onfocusout={() => {
					if (firstNameEdit && firstNameFormEl) {
						firstNameFormEl.requestSubmit();
						firstNameEdit = false;
					}
				}}
				id="firstName"
				spellcheck="false"
			/>
		</div>
	</form>
	{#if errorsFirstName && $firstNameForm.firstName}
		<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm" aria-live="polite">
			{#each errorsFirstName as message, i (i)}
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
		<p class="label-text">First Name</p>
		<div class="input-group grid-cols-[auto_1fr_auto]">
			<div class="ig-cell preset-tonal py-1.5"><UserRound size={iconSize} /></div>
			<span class="ig-input text-sm">{$firstNameForm.firstName}</span>
		</div>
	</div>
{/if}
