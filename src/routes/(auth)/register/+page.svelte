<script lang="ts">
	import type { PageServerData } from './$types';
	import { ArrowRight, Lock, LockOpen, LogIn, Mail, UserRound } from '@lucide/svelte';
	import { registerSchema } from '$lib/valibot';
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { scale } from 'svelte/transition';

	let { data }: { data: PageServerData } = $props();

	const { enhance, errors, form, message } = superForm(data.form, {
		validators: valibot(registerSchema)
	});
</script>

<svelte:head>
	<title>Register</title>
</svelte:head>

<section class="mx-auto max-w-xs">
	<h1 class="flex items-center justify-end gap-2">
		<LogIn size="16" />
		<span>Register</span>
	</h1>
	<form class="space-y-4 py-4" method="post" use:enhance>
		<fieldset class="space-y-2">
			<label class="input-group grid-cols-[auto_1fr_auto]">
				<div class="ig-cell preset-tonal" class:text-error-500={$errors.username}>
					<UserRound size="16" />
				</div>
				<input
					bind:value={$form.username}
					class="input text-sm"
					type="text"
					name="username"
					placeholder="username"
					spellcheck="false"
					required
				/>
			</label>
			<label class="input-group grid-cols-[auto_1fr_auto]">
				<div class="ig-cell preset-tonal" class:text-error-500={$errors.email}>
					<Mail size="16" />
				</div>
				<input
					bind:value={$form.email}
					class="input text-sm"
					type="email"
					name="email"
					placeholder="email"
					spellcheck="false"
					required
				/>
			</label>
			<label class="input-group grid-cols-[auto_1fr_auto]">
				<div class="ig-cell preset-tonal" class:text-error-500={$errors.password}>
					<Lock size="16" />
				</div>
				<input
					bind:value={$form.password}
					class="input text-sm"
					type="password"
					name="password"
					placeholder="password"
					required
				/>
			</label>
			<label class="input-group grid-cols-[auto_1fr_auto]">
				<div
					class="ig-cell preset-tonal"
					class:text-error-500={$errors.passwordConfirm &&
						$errors._errors?.[0] === 'Passwords dont match'}
				>
					<LockOpen size="16" />
				</div>
				<input
					bind:value={$form.passwordConfirm}
					class="input text-sm"
					type="password"
					name="passwordConfirm"
					placeholder="password confirm"
					required
				/>
			</label>
		</fieldset>

		<button class="btn w-full preset-filled-primary-300-700" type="submit">
			<span>Register</span>
		</button>
	</form>
	<p
		class="my-2 flex items-center justify-center gap-1 border-t-[.1rem] border-t-primary-200-800 py-1 text-xs"
	>
		<span>Have Account?</span>
		<ArrowRight size="12" />
		<a href="/login" class="anchor">login</a>
	</p>
	<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm">
		{#if $errors.username}<p class="card preset-outlined-error-300-700 p-2" transition:scale>
				{$errors.username}
			</p>{/if}
		{#if $errors.email}<p class="card preset-outlined-error-300-700 p-2" transition:scale>
				{$errors.email}
			</p>{/if}
		{#if $errors.password}<p class="card preset-outlined-error-300-700 p-2" transition:scale>
				{$errors.password}
			</p>{/if}
		{#if $errors.passwordConfirm}<p class="card preset-outlined-error-300-700 p-2" transition:scale>
				{$errors.passwordConfirm}
			</p>{/if}
		{#if $errors._errors}
			{#each $errors._errors as err}
				<p class="card preset-outlined-error-300-700 p-2" transition:scale>{err}</p>
			{/each}
		{/if}
		{#if $message}
			<p class="mt-4 rounded bg-green-200 p-2 text-sm text-green-800">{$message}</p>
		{/if}
	</div>
</section>
