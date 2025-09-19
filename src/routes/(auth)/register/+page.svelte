<script lang="ts">
	import type { PageServerData } from './$types';
	import { ArrowRight, Lock, LockOpen, LogIn, Mail, UserRound } from '@lucide/svelte';
	import { registerSchema } from '$lib/valibot';
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { fade, fly, scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let { data }: { data: PageServerData } = $props();

	const { enhance, errors, form, message } = superForm(data.form, {
		validators: valibot(registerSchema)
	});

	const errorStrings = $derived(
		(
			[
				$errors.username ?? [],
				$errors.email ?? [],
				$errors.password ?? [],
				$errors.passwordConfirm ?? [],
				$errors._errors ?? []
			] as string[][]
		).flat()
	);
	$inspect(errorStrings, 'errorStrings');
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
		<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm">
			{#each errorStrings as err, i (i)}
				<p class="card preset-filled-error-300-700 p-2" transition:fade animate:flip>
					{err}
				</p>
			{/each}
		</div>
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
</section>
