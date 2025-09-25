<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import { isSelf as isSelfUtil } from '$lib/permissions';
	import { valibot } from 'sveltekit-superforms/adapters';
	import {
		profileSchema,
		profileFirstNameSchema,
		profileLastNameSchema,
		profilePhoneSchema,
		profileBioSchema
	} from '$lib/valibot';
	import { ArrowBigLeft, Phone, UserRound, UserRoundPen, X } from '@lucide/svelte';
	import { Avatar } from '@skeletonlabs/skeleton-svelte/composed';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	const iconSize: number = 16;

	let { data }: PageProps = $props();

	const { form } = superForm(data.form.profileForm, { validators: valibot(profileSchema) });
	const {
		enhance: firstNameEnhance,
		form: firstNameForm,
		errors: firstNameErrors
	} = superForm(data.form.firstNameForm, { validators: valibot(profileFirstNameSchema) });
	const {
		enhance: lastNameEnhance,
		form: lastNameForm,
		errors: lastNameErrors
	} = superForm(data.form.lastNameForm, { validators: valibot(profileLastNameSchema) });
	const {
		enhance: phoneEnhance,
		form: phoneForm,
		errors: phoneErrors
	} = superForm(data.form.phoneForm, { validators: valibot(profilePhoneSchema) });
	const {
		enhance: bioEnhance,
		form: bioForm,
		errors: bioErrors
	} = superForm(data.form.bioForm, {
		validators: valibot(profileBioSchema)
	});

	const errorsFirstName = $derived(($firstNameErrors.firstName ?? []) as string[]);
	const errorsLastName = $derived(($lastNameErrors.lastName ?? []) as string[]);
	const errorsPhone = $derived(($phoneErrors.phone ?? []) as string[]);

	// Dismissible error messages per field (same pattern as Username page)
	let dismissedFirstName = $state<Set<string>>(new Set());
	let dismissedLastName = $state<Set<string>>(new Set());
	let dismissedPhone = $state<Set<string>>(new Set());

	const visibleErrorsFirstName = $derived(
		errorsFirstName.filter((m) => !dismissedFirstName.has(m))
	);
	const visibleErrorsLastName = $derived(errorsLastName.filter((m) => !dismissedLastName.has(m)));
	const visibleErrorsPhone = $derived(errorsPhone.filter((m) => !dismissedPhone.has(m)));

	// Show errors only after user interaction (typed) or a submit attempt
	let dirtyFirstName = $state(false);
	let attemptedFirstName = $state(false);
	let dirtyLastName = $state(false);
	let attemptedLastName = $state(false);
	let dirtyPhone = $state(false);
	let attemptedPhone = $state(false);

	const showFirstNameErrors = $derived(
		(dirtyFirstName || attemptedFirstName) && visibleErrorsFirstName.length > 0
	);
	const showLastNameErrors = $derived(
		(dirtyLastName || attemptedLastName) && visibleErrorsLastName.length > 0
	);
	const showPhoneErrors = $derived((dirtyPhone || attemptedPhone) && visibleErrorsPhone.length > 0);

	function dismissFirstNameError(message: string) {
		const next = new Set(dismissedFirstName);
		next.add(message);
		dismissedFirstName = next;
	}
	function dismissLastNameError(message: string) {
		const next = new Set(dismissedLastName);
		next.add(message);
		dismissedLastName = next;
	}
	function dismissPhoneError(message: string) {
		const next = new Set(dismissedPhone);
		next.add(message);
		dismissedPhone = next;
	}

	// Reset dismissals when validation results change
	$effect(() => {
		void errorsFirstName;
		dismissedFirstName = new Set();
	});
	$effect(() => {
		void errorsLastName;
		dismissedLastName = new Set();
	});
	$effect(() => {
		void errorsPhone;
		dismissedPhone = new Set();
	});

	// Use helper-based permission check like on the username page
	const isSelf = $derived(isSelfUtil(page.data.authUser.id, $form.userId));
</script>

<svelte:head>
	<title>Users Profile: {$form.name}</title>
	<meta name="description" content="Seiten Beschreibung" />
</svelte:head>

<section class="m-auto max-w-sm space-y-4">
	<div
		class="divide-y divide-surface-200-800 card border-[1px] border-surface-200-800 preset-filled-surface-100-900"
	>
		<header
			class="flex flex-row-reverse items-center justify-between gap-4 preset-filled-primary-300-700 p-4"
		>
			<h1 class="h4">{$form.name}</h1>
			<div class="mt-6 -mb-16 h-24 w-24 rounded-full border-6 border-primary-300-700">
				<Avatar class="h-full w-full bg-surface-100-900">
					<Avatar.Image src={$form.avatar} />
					<Avatar.Fallback
						>{$firstNameForm.firstName?.at(0)}{$lastNameForm.lastName?.at(0)}</Avatar.Fallback
					>
				</Avatar>
			</div>
		</header>
		<article class="p-4 pb-8">
			<div class="space-y-8">
				<h2 class="py-4 text-right h6">
					<UserRoundPen />
					<span>Profile</span>
				</h2>
				{#if isSelf}
					<form
						method="post"
						action="?/firstName"
						use:firstNameEnhance
						onsubmit={() => (attemptedFirstName = true)}
					>
						<input class="input" type="hidden" name="id" value={$firstNameForm.id} />
						<label class="label label-text" for="firstName">First Name</label>
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal py-1.5">
								<UserRound size={iconSize} />
							</div>
							<input
								class="ig-input text-sm"
								type="text"
								name="firstName"
								bind:value={$firstNameForm.firstName}
								oninput={() => (dirtyFirstName = true)}
								spellcheck="false"
							/>
							<button class="ig-btn preset-tonal btn-sm" type="submit"> Submit </button>
						</div>
					</form>

					{#if showFirstNameErrors}
						<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm" aria-live="polite">
							{#each visibleErrorsFirstName as message, i (i)}
								<div
									class="card preset-filled-error-300-700 p-2"
									transition:slide={{ duration: 140 }}
									animate:flip={{ duration: 160 }}
								>
									<div class="text-right">
										<button
											type="button"
											class="anchor"
											onclick={() => dismissFirstNameError(message)}
										>
											<X class="text-white" />
										</button>
									</div>
									<div>
										<p>{message}</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
					<form
						method="post"
						action="?/lastName"
						use:lastNameEnhance
						onsubmit={() => (attemptedLastName = true)}
					>
						<input class="input" type="hidden" name="id" value={$lastNameForm.id} />
						<label class="label label-text" for="lastName">Last Name</label>
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal py-1.5">
								<UserRound size={iconSize} />
							</div>
							<input
								class="ig-input text-sm"
								type="text"
								name="lastName"
								bind:value={$lastNameForm.lastName}
								oninput={() => (dirtyLastName = true)}
								spellcheck="false"
							/>
							<button class="ig-btn preset-tonal btn-sm" type="submit"> Submit </button>
						</div>
					</form>
					{#if showLastNameErrors}
						<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm" aria-live="polite">
							{#each visibleErrorsLastName as message, i (i)}
								<div
									class="card preset-filled-error-300-700 p-2"
									transition:slide={{ duration: 140 }}
									animate:flip={{ duration: 160 }}
								>
									<div class="text-right">
										<button
											type="button"
											class="anchor"
											onclick={() => dismissLastNameError(message)}
										>
											<X class="text-white" />
										</button>
									</div>
									<div>
										<p>{message}</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
					<form
						method="post"
						action="?/phone"
						use:phoneEnhance
						onsubmit={() => (attemptedPhone = true)}
					>
						<input class="input" type="hidden" name="id" value={$phoneForm.id} />
						<label class="label label-text" for="phone">Phone</label>
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal py-1.5">
								<Phone size={iconSize} />
							</div>
							<input
								class="ig-input text-sm"
								type="tel"
								name="phone"
								bind:value={$phoneForm.phone}
								oninput={() => (dirtyPhone = true)}
								spellcheck="false"
							/>
							<button class="ig-btn preset-tonal btn-sm" type="submit"> Submit </button>
						</div>
					</form>
					{#if showPhoneErrors}
						<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm" aria-live="polite">
							{#each visibleErrorsPhone as message, i (i)}
								<div
									class="card preset-filled-error-300-700 p-2"
									transition:slide={{ duration: 140 }}
									animate:flip={{ duration: 160 }}
								>
									<div class="text-right">
										<button type="button" class="anchor" onclick={() => dismissPhoneError(message)}>
											<X class="text-white" />
										</button>
									</div>
									<div>
										<p>{message}</p>
									</div>
								</div>
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
					<div>
						<p class="label-text">Last Name</p>
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal py-1.5"><UserRound size={iconSize} /></div>
							<span class="ig-input text-sm">{$lastNameForm.lastName}</span>
						</div>
					</div>
					<div>
						<p class="label-text">Phone</p>
						<div class="input-group grid-cols-[auto_1fr_auto]">
							<div class="ig-cell preset-tonal py-1.5"><Phone size={iconSize} /></div>
							<span class="ig-input text-sm"
								><a href="tel:{$phoneForm.phone}">{$phoneForm.phone}</a></span
							>
						</div>
					</div>
				{/if}
				<div>
					<form method="post" action="?/bio" use:bioEnhance>
						<input class="input" type="hidden" name="id" value={$bioForm.id} />

						<div class="pb-4">
							<label class="label label-text" for="bio">Bio</label>
							<textarea
								class="textarea text-sm"
								name="bio"
								rows="4"
								bind:value={$bioForm.bio}
								spellcheck="false"
								readonly={page.data.authUser.username !== $form.name}
							></textarea>
						</div>
						<div class="flex justify-center">
							<button class="btn preset-tonal btn-sm" type="submit"> Submit </button>
						</div>
					</form>
				</div>
			</div>
		</article>
		<footer class="mt-4 flex flex-row-reverse items-center justify-between gap-4 px-4 pb-4">
			<small class="opacity-60">Footer</small>
		</footer>
	</div>
	<div
		class="mt-8 flex items-center justify-between gap-4 border-t-[1px] border-surface-200-800 p-2"
	>
		<a class="btn preset-tonal btn-sm" href="/users/{$form.name}">
			<ArrowBigLeft size={iconSize} />
			{$form.name}
		</a>
	</div>
</section>
