<script lang="ts">
	import { FileUpload } from '@skeletonlabs/skeleton-svelte';
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { profileAvatarSchema } from '$lib/valibot';
	import { scale, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { ImagePlus, Trash, UserRoundPen, X } from '@lucide/svelte';

	let props = $props();
	let { id, isSelf, iconSize } = props;
	let data = $state(props.data);

	const {
		enhance: avatarEnhance,
		errors: avatarErrors,
		form: avatarForm
	} = superForm(data.avatarForm, {
		validators: valibot(profileAvatarSchema),
		validationMethod: 'onblur'
	});

	const errorsAvatar = $derived(($avatarErrors.avatar ?? []) as string[]);

	// FileUpload Component (Avatar)
	let avatarEdit = $state(false);
	let avatarDelete = $state(false);
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

{#if isSelf}
	<div>
		<button onclick={() => (avatarEdit = !avatarEdit)} class="btn preset-tonal btn-sm"
			><UserRoundPen size={iconSize} /> Avatar Edit</button
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
					<div class="relative flex items-center justify-center">
						{#if avatarPreview || $avatarForm.avatar}
							{#key avatarPreview && avatarPreview.length > 0 ? avatarPreview : $avatarForm.avatar}
								<img
									src={avatarPreview && avatarPreview.length > 0
										? avatarPreview
										: $avatarForm.avatar}
									alt="Avatar Preview"
									class="max-w-full object-cover"
								/>
							{/key}
							{#if !avatarPreview && $avatarForm.avatar}
								{#if avatarDelete}
									<div class="absolute top-1 left-0 w-full" transition:scale>
										<p class="text-center">Really delete?</p>
										<div class="flex justify-center gap-2">
											<button
												class="mt-2 btn preset-filled-error-300-700 btn-sm"
												type="submit"
												onclick={() => (avatarDelete = false)}
											>
												<Trash size={iconSize} />
												<span>Yes, Remove</span>
											</button>
											<button
												class="mt-2 btn preset-filled-surface-300-700 btn-sm"
												type="button"
												onclick={() => (avatarDelete = false)}
											>
												<X size={iconSize} />
												<span>Cancel</span>
											</button>
										</div>
									</div>
								{:else}
									<button
										class="absolute top-1.5 right-2.5 mt-2 btn-icon btn rounded-full preset-filled-error-300-700 p-1.5"
										type="submit"
										onclick={(e) => {
											e.preventDefault();
											avatarDelete = true;
										}}
										aria-label="Delete Avatar"
										transition:scale
									>
										<Trash />
									</button>
								{/if}
							{/if}
						{:else}
							<p>No Avatar.</p>
						{/if}
					</div>
					<div class="flex items-center justify-center">
						<FileUpload onFileChange={avatarUpload}>
							<FileUpload.Dropzone>
								<ImagePlus class="size-8" />
								<span>Select file or drag here.</span>
								<FileUpload.Trigger class="skb:btn-sm">Browse Files</FileUpload.Trigger>
								<FileUpload.HiddenInput />
							</FileUpload.Dropzone>
							<FileUpload.ItemGroup>
								<FileUpload.Context>
									{#snippet children(fileUpload)}
										{#each fileUpload().acceptedFiles as file (file.name)}
											<FileUpload.Item {file}>
												<FileUpload.ItemName>{file.name}</FileUpload.ItemName>
												<FileUpload.ItemSizeText>{file.size} bytes</FileUpload.ItemSizeText>
												<FileUpload.ItemDeleteTrigger />
											</FileUpload.Item>
										{/each}
									{/snippet}
								</FileUpload.Context>
							</FileUpload.ItemGroup>
						</FileUpload>
					</div>
				</div>
			</form>
		</div>
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
	{/if}
{/if}
