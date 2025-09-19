<script lang="ts">
	import type { PageProps } from './$types';
	import { loginSchema } from '$lib/valibot';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms';
	import { ArrowRight, Lock, LogIn, UserRound } from '@lucide/svelte';
	import { fly, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let { data }: PageProps = $props();

	const { enhance, errors, form } = superForm(data.form, {
		validators: valibot(loginSchema)
	});

	const formErrors = $derived(
		([$errors.username ?? [], $errors.password ?? []] as string[][]).flat()
	);
</script>

<svelte:head>
	<title>LogIn</title>
</svelte:head>

<section class="mx-auto max-w-xs">
	<h1 class="flex items-center justify-end gap-2 h4">
		<LogIn />
		<span>LogIn</span>
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
					aria-invalid={$errors.username ? true : undefined}
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
					aria-invalid={$errors.password ? true : undefined}
					placeholder="password"
					required
				/>
			</label>
		</fieldset>
		<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm">
			{#each formErrors as message, i (i)}
				<p class="card preset-filled-error-300-700 p-2" transition:slide animate:flip>
					{message}
				</p>
			{/each}
		</div>
		{#if formErrors.length === 0}
			<div transition:fly={{ y: 200 }}>
				<button class="btn w-full preset-filled-primary-300-700" type="submit">
					<span>Login</span>
				</button>
				<p
					class="my-2 flex items-center justify-center gap-1 border-t-[.1rem] border-t-primary-200-800 py-1 text-xs"
				>
					<span>Haven't Account?</span>
					<ArrowRight size="12" />
					<a href="/register" class="anchor">register</a>
				</p>
			</div>
		{/if}
	</form>
</section>
