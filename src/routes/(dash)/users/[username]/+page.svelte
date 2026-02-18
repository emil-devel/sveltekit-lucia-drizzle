<script lang="ts">
	import type { PageProps } from './$types';
	import { PUBLIC_SITE_NAME } from '$env/static/public';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { canManageUser, isAdmin as isAdminUtil, isSelf as isSelfUtil } from '$lib/permissions';
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { userEmailSchema, userNameSchema } from '$lib/valibot';
	import { Avatar, Switch } from '@skeletonlabs/skeleton-svelte';
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

	const { id, createdAt, firstName, lastName, updatedAt } = $derived(data);

	const {
		enhance: usernameEnhance,
		errors: usernameErrors,
		form: usernameForm
	} = $derived(
		superForm(data.usernameForm, {
			validators: valibot(userNameSchema),
			validationMethod: 'oninput'
		})
	);
	const {
		enhance: emailEnhance,
		errors: emailErrors,
		form: emailForm
	} = $derived(
		superForm(data.emailForm, {
			validators: valibot(userEmailSchema),
			validationMethod: 'oninput'
		})
	);
	const { enhance: activeEnhance, form: activeForm } = $derived(superForm(data.activeForm));
	const { enhance: roleEnhance, form: roleForm } = $derived(superForm(data.roleForm));
	const { enhance: deleteEnhance } = $derived(superForm(data.deleteForm));

	const errorsUsername = $derived(($usernameErrors.username ?? []) as string[]);
	const errorsEmail = $derived(($emailErrors.email ?? []) as string[]);

	const isAdmin = $derived(isAdminUtil(page.data.authUser));
	const isSelf = $derived(isSelfUtil(page.data.authUser.id, id));
	const canAdminManage = $derived(canManageUser(page.data.authUser, id));

	let deleteConfirm = $state(false);

	// Form element reference for the active Switch; we update the superform store directly
	let activeFormEl: HTMLFormElement | null = $state(null);
</script>

<svelte:head>
	<title>User {$usernameForm.username} - {PUBLIC_SITE_NAME}</title>
	<meta
		name="description"
		content="Profile and details for user {$usernameForm.username} on {PUBLIC_SITE_NAME}."
	/>
</svelte:head>

<section class="m-auto max-w-sm space-y-4">
	<div
		class="block max-w-md divide-y divide-surface-200-800 card border border-surface-200-800 preset-filled-surface-100-900"
	>
		<header
			class="flex flex-row-reverse items-center justify-between gap-4 p-4"
			class:preset-filled-success-300-700={$activeForm.active && $roleForm.role === 'USER'}
			class:preset-filled-warning-300-700={$activeForm.active && $roleForm.role === 'REDACTEUR'}
			class:preset-filled-error-300-700={$activeForm.active && $roleForm.role === 'ADMIN'}
			class:opacity-60={!$activeForm.active}
		>
			<h2 class="h4">
				<span>
					{#if $activeForm.active}
						<UserRoundCheck size={32} />
					{:else}
						<UserRoundX size={32} />
					{/if}
				</span>
				{$usernameForm.username}
			</h2>
			<div
				class="mt-6 -mb-16 h-24 w-24 rounded-full border-6"
				class:border-success-300-700={$roleForm.role === 'USER'}
				class:border-warning-300-700={$roleForm.role === 'REDACTEUR'}
				class:border-error-300-700={$roleForm.role === 'ADMIN'}
			>
				<Avatar class="h-full w-full bg-surface-100-900">
					<Avatar.Image src={data.avatar} alt="Avatar of the user {$usernameForm.username}" />
					<Avatar.Fallback>
						{firstName?.at(0)}{lastName?.at(0)}
					</Avatar.Fallback>
				</Avatar>
			</div>
		</header>
		<article class="p-4 pb-8">
			<div class="space-y-8">
				<h1 class="h-10 text-right h6 lowercase">
					{$roleForm.role}
				</h1>
				{#if isSelf}
					<form method="post" action="?/username" use:usernameEnhance>
						<input class="input" type="hidden" name="id" value={id} />
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
								id="username"
								spellcheck="false"
							/>
							<button class="ig-btn preset-tonal btn-sm" type="submit"> Submit </button>
						</div>
					</form>
					<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm" aria-live="polite">
						{#each errorsUsername as message, i (i)}
							<p
								class="card preset-filled-error-300-700 p-2"
								transition:slide={{ duration: 140 }}
								animate:flip={{ duration: 160 }}
							>
								{message}
							</p>
						{/each}
					</div>
					<form method="post" action="?/email" use:emailEnhance>
						<input class="input" type="hidden" name="id" value={id} />
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
								id="email"
								spellcheck="false"
							/>
							<button class="ig-btn preset-tonal btn-sm" type="submit"> Submit </button>
						</div>
					</form>
					<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm" aria-live="polite">
						{#each errorsEmail as message, i (i)}
							<p
								class="card preset-filled-error-300-700 p-2"
								transition:slide={{ duration: 140 }}
								animate:flip={{ duration: 160 }}
							>
								{message}
							</p>
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
						<form bind:this={activeFormEl} method="post" action="?/active" use:activeEnhance>
							<input class="input" type="hidden" name="id" value={id} />
							<div class="flex flex-col gap-2">
								<Switch
									checked={$activeForm.active}
									onCheckedChange={(e) => {
										$activeForm.active = e.checked;
										activeFormEl?.requestSubmit();
									}}
								>
									<Switch.Label>Active</Switch.Label>
									<Switch.Control>
										<Switch.Thumb />
									</Switch.Control>
									<Switch.HiddenInput name="active" />
								</Switch>
							</div>
						</form>
						<form method="post" action="?/role" use:roleEnhance>
							<input class="input" type="hidden" name="id" value={id} />
							<label class="label" for="role">
								<span class="label-text">Role</span>
								<select
									onchange={(e) => (e.currentTarget as HTMLSelectElement).form?.requestSubmit()}
									bind:value={$roleForm.role}
									class="select w-fit text-sm lowercase"
									name="role"
									id="role"
								>
									{#each roles as r, i (i)}
										<option value={r}>{r}</option>
									{/each}
								</select>
							</label>
						</form>
					</div>
				{/if}
			</div>
			{#if canAdminManage}
				<div class="mt-8 h-16 overflow-y-hidden border-t border-surface-200-800 py-8">
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
								<input type="hidden" name="id" value={id} />
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
				</div>
			{/if}
		</article>
		<footer class="mt-4 flex flex-row-reverse items-center justify-between gap-4 px-4 pb-4">
			<small class="opacity-60">Registered: {createdAt}</small>
			{#if updatedAt !== createdAt}
				<small class="opacity-60">Updated: {updatedAt}</small>
			{/if}
		</footer>
	</div>
	<div class="mt-8 flex items-center justify-between gap-4 border-t border-surface-200-800 p-2">
		<a class="btn preset-tonal btn-sm" href={resolve('/users')}>
			<ArrowBigLeft size={iconSize} />
			Users
		</a>
		{#if isAdmin || isSelf}
			<a
				class="btn preset-filled-secondary-300-700 btn-sm"
				href={resolve(`/users/${$usernameForm.username}/profile`)}
			>
				Profile
				<UserRoundPen size={iconSize} />
			</a>
		{/if}
	</div>
</section>
