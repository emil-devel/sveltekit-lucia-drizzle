<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { canManageUser, isAdmin as isAdminUtil, isSelf as isSelfUtil } from '$lib/permissions';
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { userEmailSchema, userNameSchema } from '$lib/valibot';
	import { scale, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	import {
		ArrowBigLeft,
		Mail,
		UserRound,
		UserRoundCheck,
		UserRoundPen,
		UserRoundX
	} from '@lucide/svelte';

	const iconSize: number = 16;

	import { ROLES } from '$lib/permissions';
	const roles = ROLES;

	let { data }: PageProps = $props();

	const {
		enhance: usernameEnhance,
		form: usernameForm,
		errors: usernameErrors
	} = superForm(data.form.usernameForm, {
		validators: valibot(userNameSchema)
	});
	const {
		enhance: emailEnhance,
		form: emailForm,
		errors: emailErrors
	} = superForm(data.form.emailForm, {
		validators: valibot(userEmailSchema)
	});
	const { enhance: activeEnhance, form: activeForm } = superForm(data.form.activeForm);
	const { enhance: roleEnhance, form: roleForm } = superForm(data.form.roleForm);
	const { enhance: deleteEnhance, form: deleteForm } = superForm(data.form.deleteForm);
	const { form: updatedForm } = superForm(data.form.updatedForm);
	const { form: createdForm } = superForm(data.form.createdForm);

	const errorsUsername = $derived(($usernameErrors.username ?? []) as string[]);
	const errorsEmail = $derived(($emailErrors.email ?? []) as string[]);

	// Dismissible error messages without mutating superforms' $errors
	let dismissedUsername = $state<Set<string>>(new Set());
	let dismissedEmail = $state<Set<string>>(new Set());

	const visibleErrorsUsername = $derived(errorsUsername.filter((m) => !dismissedUsername.has(m)));
	const visibleErrorsEmail = $derived(errorsEmail.filter((m) => !dismissedEmail.has(m)));

	function dismissUsernameError(message: string) {
		const next = new Set(dismissedUsername);
		next.add(message);
		dismissedUsername = next;
	}

	function dismissEmailError(message: string) {
		const next = new Set(dismissedEmail);
		next.add(message);
		dismissedEmail = next;
	}

	// Reset dismissals per field when new validation results arrive
	$effect(() => {
		void errorsUsername;
		dismissedUsername = new Set();
	});
	$effect(() => {
		void errorsEmail;
		dismissedEmail = new Set();
	});

	// Avoid direct $roleForm usage in template to prevent SSR reference errors
	let roleValue = $state($roleForm.role);

	const isAdmin = $derived(isAdminUtil(page.data.authUser));
	const isSelf = $derived(isSelfUtil(page.data.authUser.id, $deleteForm.id));
	const canAdminManage = $derived(canManageUser(page.data.authUser, $deleteForm.id));

	let deleteConfirm = $state(false);
</script>

<svelte:head>
	<title>Seiten Titel</title>
	<meta name="description" content="Seiten Beschreibung" />
</svelte:head>

<section class="m-auto max-w-sm space-y-4">
	<div
		class="block max-w-md divide-y divide-surface-200-800 card border-[1px] border-surface-200-800 preset-filled-surface-100-900"
	>
		<header
			class="flex flex-row-reverse items-center gap-4 p-4"
			class:preset-filled-primary-300-700={$activeForm.active}
			class:opacity-60={!$activeForm.active}
		>
			<h2 class="h4">{roleValue}</h2>
			<p>
				{#if $activeForm.active}
					<UserRoundCheck />
				{:else}
					<UserRoundX />
				{/if}
			</p>
		</header>
		<article class="p-4 pb-8">
			<div class="space-y-8">
				<h1 class="h-10 text-right h6">
					{$usernameForm.username}
				</h1>
				{#if isSelf}
					<form method="post" action="?/username" use:usernameEnhance>
						<input class="input" type="hidden" name="id" value={$deleteForm.id} />
						<label class="label label-text" for="username">Username</label>
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal py-1.5">
								<UserRound size={iconSize} />
							</div>
							<input
								class="ig-input text-sm"
								type="text"
								name="username"
								bind:value={$usernameForm.username}
								spellcheck="false"
							/>
							<button class="ig-btn preset-tonal btn-sm" type="submit"> Submit </button>
						</div>
					</form>
					<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm" aria-live="polite">
						{#each visibleErrorsUsername as message, i (i)}
							<div
								class="card preset-filled-error-300-700 p-2"
								transition:slide={{ duration: 140 }}
								animate:flip={{ duration: 160 }}
							>
								<div class="text-right">
									<button
										type="button"
										class="anchor"
										onclick={() => dismissUsernameError(message)}
									>
										Close message
									</button>
								</div>
								<div>
									<p>
										{message}
									</p>
								</div>
							</div>
						{/each}
					</div>
					<form method="post" action="?/email" use:emailEnhance>
						<input class="input" type="hidden" name="id" value={$deleteForm.id} />
						<label class="label label-text" for="email">Email</label>
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal py-1.5">
								<Mail size={iconSize} />
							</div>
							<input
								class="ig-input text-sm"
								type="email"
								name="email"
								bind:value={$emailForm.email}
								spellcheck="false"
							/>
							<button class="ig-btn preset-tonal btn-sm" type="submit"> Submit </button>
						</div>
					</form>
					<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm" aria-live="polite">
						{#each visibleErrorsEmail as message, i (i)}
							<div
								class="card preset-filled-error-300-700 p-2"
								transition:slide={{ duration: 140 }}
								animate:flip={{ duration: 160 }}
							>
								<div class="text-right">
									<button type="button" class="anchor" onclick={() => dismissEmailError(message)}>
										Close message
									</button>
								</div>
								<div>
									<p>
										{message}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div>
						<p class="label-text">Email</p>
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal py-1.5"><Mail /></div>
							<span class="ig-input text-sm">
								<a href="mailto:{$emailForm.email}">{$emailForm.email}</a>
							</span>
						</div>
					</div>
				{/if}
				{#if canAdminManage}
					<div class="flex justify-between gap-4">
						<form method="post" action="?/active" use:activeEnhance>
							<input class="input" type="hidden" name="id" value={$deleteForm.id} />
							<label class="label">
								<span class="label-text">Active</span>
								<input
									onchange={(e) => (e.currentTarget as HTMLInputElement).form?.requestSubmit()}
									class="checkbox"
									type="checkbox"
									name="active"
									bind:checked={$activeForm.active}
								/>
							</label>
						</form>
						<form method="post" action="?/role" use:roleEnhance>
							<input class="input" type="hidden" name="id" value={$deleteForm.id} />
							<label class="label">
								<span class="label-text">Role</span>
								<select
									onchange={(e) => (e.currentTarget as HTMLSelectElement).form?.requestSubmit()}
									bind:value={roleValue}
									class="select w-fit text-sm lowercase"
									name="role"
								>
									{#each roles as r}
										<option value={r}>{r}</option>
									{/each}
								</select>
							</label>
						</form>
					</div>
				{/if}
			</div>
			{#if canAdminManage}
				<div class="mt-8 h-16 overflow-y-hidden border-t-[1px] border-surface-200-800 py-8">
					<!-- {#key deleteConfirm} -->
					{#if deleteConfirm}
						<div
							class="flex items-center justify-center gap-2"
							out:scale={{ delay: 0, duration: 300 }}
							in:scale={{ delay: 300, duration: 300 }}
						>
							<span class="pr-4">Really delete the user?</span>
							<button
								class="btn preset-filled-surface-300-700 btn-sm"
								onclick={() => (deleteConfirm = false)}>Cancel</button
							>
							<form method="post" action="?/delete" use:deleteEnhance>
								<input type="hidden" name="id" value={$deleteForm.id} />
								<button
									class="btn preset-filled-error-300-700 btn-sm"
									type="submit"
									onclick={() => (deleteConfirm = false)}
								>
									Delete
								</button>
							</form>
						</div>
					{:else}
						<div
							class="flex justify-center"
							out:scale={{ delay: 0, duration: 300 }}
							in:scale={{ delay: 300, duration: 300 }}
						>
							<button
								onclick={() => (deleteConfirm = true)}
								class="btn preset-outlined-error-300-700 btn-sm"
							>
								Delete
							</button>
						</div>
					{/if}
					<!-- {/key} -->
				</div>
			{/if}
		</article>
		<footer class="mt-4 flex flex-row-reverse items-center justify-between gap-4 px-4 pb-4">
			<small class="opacity-60">Registered: {$createdForm.createdAt.toLocaleDateString()}</small>
			{#if $updatedForm.updatedAt !== $createdForm.createdAt}
				<small class="opacity-60">Updated: {$updatedForm.updatedAt.toLocaleDateString()}</small>
			{/if}
		</footer>
	</div>
	<div
		class="mt-8 flex items-center justify-between gap-4 border-t-[1px] border-surface-200-800 p-2"
	>
		<a class="btn preset-tonal btn-sm" href="/users">
			<ArrowBigLeft size={iconSize} />
			Users
		</a>
		{#if isAdmin || isSelf}
			<a class="btn preset-tonal btn-sm" href="/users/{$usernameForm.username}/profile">
				Profile
				<UserRoundPen size={iconSize} />
			</a>
		{/if}
	</div>
</section>
