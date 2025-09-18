<script lang="ts">
	import type { PageProps } from './$types';
	import { loginSchema } from '$lib/valibot';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms';
	import { ArrowRight, Lock, LogIn, UserRound } from '@lucide/svelte';
	import { scale } from 'svelte/transition';

	let { data }: PageProps = $props();

	const { enhance, errors, form, message } = superForm(data.form, {
		validators: valibot(loginSchema)
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
		</fieldset>

		<button class="btn w-full preset-filled-primary-300-700" type="submit">
			<span>Login</span>
		</button>
	</form>
	<p
		class="my-2 flex items-center justify-center gap-1 border-t-[.1rem] border-t-primary-200-800 py-1 text-xs"
	>
		<span>Haven't Account?</span>
		<ArrowRight size="12" />
		<a href="/register" class="anchor">register</a>
	</p>
	<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm">
		{#if $errors.username}
			<p class="card preset-outlined-error-300-700 p-2" transition:scale>
				{$errors.username}
			</p>
		{/if}
		{#if $errors.password}
			<p class="card preset-outlined-error-300-700 p-2" transition:scale>
				{$errors.password}
			</p>
		{/if}

		{#if $message}
			<p class="card preset-outlined-error-300-700 p-2" transition:scale>{$message}</p>
		{/if}
	</div>
</section>
