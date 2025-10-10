<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import { isSelf as isSelfUtil } from '$lib/permissions';
	import { valibot } from 'sveltekit-superforms/adapters';
	import {
		profileFirstNameSchema,
		profileLastNameSchema,
		profilePhoneSchema,
		profileBioSchema,
		profileAvatarSchema
	} from '$lib/valibot';
	import {
		ArrowBigLeft,
		CircleX,
		ImagePlus,
		Paperclip,
		Phone,
		Trash,
		UserRound,
		UserRoundPen,
		X
	} from '@lucide/svelte';
	import { Avatar } from '@skeletonlabs/skeleton-svelte/composed';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	const iconSize: number = 16;

	let { data }: PageProps = $props();

	// Destructure basic fields
	const { id, name, userId }: any = data;
	// Forms
	const {
		enhance: avatarEnhance,
		errors: avatarErrors,
		form: avatarForm
	} = superForm(data.avatarForm, {
		validators: valibot(profileAvatarSchema),
		validationMethod: 'onblur'
	});
	const {
		enhance: firstNameEnhance,
		form: firstNameForm,
		errors: firstNameErrors
	} = superForm(data.firstNameForm, { validators: valibot(profileFirstNameSchema) });
	const {
		enhance: lastNameEnhance,
		form: lastNameForm,
		errors: lastNameErrors
	} = superForm(data.lastNameForm, { validators: valibot(profileLastNameSchema) });
	const {
		enhance: phoneEnhance,
		form: phoneForm,
		errors: phoneErrors
	} = superForm(data.phoneForm, { validators: valibot(profilePhoneSchema) });
	const { enhance: bioEnhance, form: bioForm } = superForm(data.bioForm, {
		validators: valibot(profileBioSchema),
		dataType: 'json'
	});

	const errorsAvatar = $derived(($avatarErrors.avatar ?? []) as string[]);
	const errorsFirstName = $derived(($firstNameErrors.firstName ?? []) as string[]);
	const errorsLastName = $derived(($lastNameErrors.lastName ?? []) as string[]);
	const errorsPhone = $derived(($phoneErrors.phone ?? []) as string[]);

	// Use helper-based permission check like on the username page
	const isSelf = $derived(isSelfUtil(page.data.authUser.id, userId));

	// Normalized phone for "tel: link" after passing the schema.
	const normalizedPhone = $derived(() => {
		let raw = $phoneForm.phone?.trim();
		if (!raw) return '';
		// Remove spaces
		let val = raw.replace(/\s+/g, '');
		// Convert 00 international prefix to +
		if (val.startsWith('00')) {
			val = '+' + val.slice(2);
		}
		return val;
	});

	// Tipex
	import { Tipex } from '@friendofsvelte/tipex';

	// Initial HTML content from server form
	let body = $state($bioForm.bio ?? '');
	// Editor instance binding
	import type { Editor } from '@tiptap/core';
	import { FileUpload } from '@skeletonlabs/skeleton-svelte';
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

	// FileUpload Component (Avatar)
	let avatarEdit = $state(false);
	let avatarFormEl: HTMLFormElement | null = $state(null);
	let avatarPreview: string | undefined = $state();
	const avatarUpload = (details: any) => {
		// Normalize payload to support both CustomEvent and direct object usage
		const payload = details?.detail ?? details;
		avatarErrors.set({ avatar: [] });
		const file = payload?.files?.[0] ?? payload?.file ?? payload?.acceptedFiles?.[0];
		// If no file present, this is likely a remove/clear event from FileUpload
		if (!file) {
			avatarPreview = undefined;
			avatarErrors.set({ avatar: [] });
			return;
		}
		// Always build preview first, even if the file turns out invalid
		const reader = new FileReader();
		reader.onload = (e) => {
			avatarPreview = e.target?.result as string;
		};
		reader.readAsDataURL(file);
		// Validate after kicking off preview build
		const messages: string[] = [];
		if (file.size > 350000) messages.push('Avatar image too large (max ~250KB)!');
		const allowedFormats = ['.png', '.jpeg', '.jpg', '.webp', '.gif', '.svg'];
		if (!allowedFormats.some((ext) => file.name?.toLowerCase().endsWith(ext))) {
			messages.push('Invalid file format. Allowed: PNG, JPEG, JPG, WEBP, GIF, SVG');
		}
		if (messages.length > 0) {
			avatarErrors.set({ avatar: messages });
			// Keep preview visible; do not submit
			return;
		}
		// Submit after preview is set and no validation errors
		setTimeout(() => {
			if (avatarPreview && errorsAvatar.length === 0) {
				avatarFormEl?.requestSubmit();
			}
		}, 100);
	};
</script>

<svelte:head>
	<title>Users Profile: {name}</title>
	<meta name="description" content="Seiten Beschreibung" />
</svelte:head>

<section class="m-auto max-w-xl space-y-4">
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
				<span>{name}</span>
			</h1>
			<div class="mt-6 -mb-16 h-24 w-24 rounded-full border-6 border-secondary-300-700">
				<Avatar class="h-full w-full bg-surface-100-900">
					{#key $avatarForm.avatar}
						<Avatar.Image src={$avatarForm.avatar} />
					{/key}
					<Avatar.Fallback>
						{$firstNameForm.firstName?.at(0)}{$lastNameForm.lastName?.at(0)}
					</Avatar.Fallback>
				</Avatar>
			</div>
		</header>
		<article class="p-4 pb-8">
			<div class="space-y-8">
				<h2 class="py-4 text-right h6">
					<span>Profile</span>
				</h2>
				{#if isSelf}
					<div>
						<button onclick={() => (avatarEdit = !avatarEdit)} class="btn preset-tonal btn-sm"
							><UserRoundPen size={16} /> Avatar Edit</button
						>
					</div>
					{#if avatarEdit}
						<div class="border border-surface-200-800 p-2" transition:slide>
							<form
								bind:this={avatarFormEl}
								method="post"
								action="?/avatar"
								enctype="multipart/form-data"
								use:avatarEnhance={{
									onResult: ({ result }) => {
										const status = (result as any)?.status ?? 200;
										const isFailure = (result as any)?.type === 'failure' || status >= 400;
										if (!isFailure) {
											const newAvatar: unknown = (result as any)?.data?.form?.data?.avatar;
											// Update both the store and preview
											if (typeof newAvatar === 'string') {
												if (newAvatar.length > 0) {
													// Upload path: server returned the new avatar string
													$avatarForm.avatar = newAvatar;
													avatarPreview = newAvatar;
												} else {
													// Deletion path: explicit empty string means clear
													$avatarForm.avatar = '' as any;
													avatarPreview = undefined;
												}
											} else {
												// Server did not echo avatar back.
												// If we have a local preview, assume upload success and use it;
												// otherwise assume deletion success and clear immediately.
												if (avatarPreview && avatarPreview.length > 0) {
													$avatarForm.avatar = avatarPreview;
												} else {
													$avatarForm.avatar = '' as any;
													avatarPreview = undefined;
												}
											}
											// Clear the FileUpload chip by resetting the form after the state updates have propagated
											setTimeout(() => {
												avatarFormEl?.reset();
											}, 0);
										}
									}
								}}
							>
								<input type="hidden" name="id" value={id} />
								<input type="hidden" name="avatar" bind:value={avatarPreview} />
								<div class="grid grid-cols-2 gap-4">
									<div class="flex flex-col items-center justify-center">
										{#if avatarPreview || $avatarForm.avatar}
											{#key avatarPreview && avatarPreview.length > 0 ? avatarPreview : $avatarForm.avatar}
												<img
													src={avatarPreview && avatarPreview.length > 0
														? avatarPreview
														: $avatarForm.avatar}
													alt="Avatar Preview"
													class="max-h-32 max-w-full object-cover"
												/>
											{/key}
											{#if !avatarPreview && $avatarForm.avatar}
												<button
													class="mt-2 btn preset-filled-error-300-700 btn-sm"
													type="submit"
													onclick={(e) => !confirm('Are you sure?') && e.preventDefault()}
												>
													<Trash class="size-4" />
													<span>Remove Avatar</span>
												</button>
											{/if}
										{:else}
											<p>No Avatar.</p>
										{/if}
									</div>
									<FileUpload maxFiles={1} subtext="Attach your file." onFileChange={avatarUpload}>
										{#snippet iconInterface()}<ImagePlus class="size-8" />{/snippet}
										{#snippet iconFile()}<Paperclip class="size-4" />{/snippet}
										{#snippet iconFileRemove()}<CircleX class="size-4" />{/snippet}
									</FileUpload>
								</div>
							</form>
						</div>
					{/if}
					{#if avatarPreview && errorsAvatar.length > 0}
						<div class="mx-auto max-w-xs space-y-1.5 text-center text-sm" aria-live="polite">
							{#each errorsAvatar as message, i (i)}
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
					<form method="post" action="?/firstName" use:firstNameEnhance>
						<input class="input" type="hidden" name="id" value={id} />
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
						<input class="input" type="hidden" name="id" value={id} />
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
						<input class="input" type="hidden" name="id" value={id} />
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
							<span class="ig-input text-sm">
								{#if normalizedPhone}
									<a href={'tel:' + normalizedPhone}>{$phoneForm.phone}</a>
								{:else}
									{$phoneForm.phone}
								{/if}
							</span>
						</div>
					</div>
				{/if}
				<div class="py-4">
					{#if isSelf}
						<form
							class="flex items-baseline justify-between gap-4 pb-1"
							method="post"
							action="?/bio"
							use:bioEnhance
						>
							<input class="input" type="hidden" name="id" value={id} />
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
		<a class="btn preset-tonal btn-sm" href="/users/{name}">
			<ArrowBigLeft size={iconSize} />
			{name}
		</a>
	</div>
</section>
