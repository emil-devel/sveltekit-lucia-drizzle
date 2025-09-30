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
	const { enhance: bioEnhance, form: bioForm } = superForm(data.form.bioForm, {
		validators: valibot(profileBioSchema),
		dataType: 'json'
	});

	const errorsFirstName = $derived(($firstNameErrors.firstName ?? []) as string[]);
	const errorsLastName = $derived(($lastNameErrors.lastName ?? []) as string[]);
	const errorsPhone = $derived(($phoneErrors.phone ?? []) as string[]);

	// Use helper-based permission check like on the username page
	const isSelf = $derived(isSelfUtil(page.data.authUser.id, $form.userId));

	// Tipex
	import { Tipex } from '@friendofsvelte/tipex';

	// Initial HTML content from server form
	let body = $state($bioForm.bio ?? '');
	// Editor instance binding
	import type { Editor } from '@tiptap/core';
	let editor = $state<Editor | undefined>();
	// Always up-to-date HTML extracted from the editor
	const htmlContent = $derived(editor?.getHTML() ?? body);

	// Keep superform field in sync so JSON submission includes latest HTML
	$effect(() => {
		if (editor) {
			const current = editor.getHTML();
			if (current !== $bioForm.bio) {
				$bioForm.bio = current;
			}
		}
	});
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
			class="flex flex-row-reverse items-center justify-between gap-4 preset-filled-secondary-300-700 p-4"
		>
			<h1 class="h4">
				{#if isSelf}
					<UserRoundPen size={32} />
				{:else}
					<UserRound size={32} />
				{/if}
				<span>{$form.name}</span>
			</h1>
			<div class="mt-6 -mb-16 h-24 w-24 rounded-full border-6 border-secondary-300-700">
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
					<span>Profile</span>
				</h2>
				{#if isSelf}
					<form method="post" action="?/firstName" use:firstNameEnhance>
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
								spellcheck="false"
							/>
							<button class="ig-btn preset-tonal btn-sm" type="submit"> Submit </button>
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
					<form method="post" action="?/lastName" use:lastNameEnhance>
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
								spellcheck="false"
							/>
							<button class="ig-btn preset-tonal btn-sm" type="submit"> Submit </button>
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
					<form method="post" action="?/phone" use:phoneEnhance>
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
								spellcheck="false"
							/>
							<button class="ig-btn preset-tonal btn-sm" type="submit"> Submit </button>
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
				<div class="py-4">
					{#if isSelf}
						<form
							class="flex items-baseline justify-between gap-4"
							method="post"
							action="?/bio"
							use:bioEnhance
						>
							<input class="input" type="hidden" name="id" value={$bioForm.id} />
							<label class="label" for="id"><span class="label-text">Bio</span></label>
							<!-- bio value provided via superforms JSON (kept in sync in script) -->
							<button class="btn preset-tonal btn-sm" type="submit"> Submit </button>
						</form>
						<div class="pb-4">
							<Tipex
								body={$bioForm.bio}
								bind:tipex={editor}
								floating
								focal
								class="h-[40vh] border border-surface-200-800"
							/>
						</div>
					{:else}
						<h3 class="label-text">Bio</h3>
						<div class="prose border border-surface-200-800 p-2 prose-invert">
							{@html htmlContent}
						</div>
					{/if}
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
