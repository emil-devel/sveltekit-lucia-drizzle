<script lang="ts">
	import type { PageProps } from './$types';
	import { PUBLIC_SITE_NAME } from '$env/static/public';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	import { isSelf as isSelfUtil } from '$lib/permissions';
	import AvatarUpload from '$lib/components/profile/Avatar.svelte';
	import FirstName from '$lib/components/profile/FirstName.svelte';
	import LastName from '$lib/components/profile/LastName.svelte';
	import Phone from '$lib/components/profile/Phone.svelte';
	import Bio from '$lib/components/profile/Bio.svelte';
	import { ArrowBigLeft, UserRound, UserRoundPen } from '@lucide/svelte';
	const iconSize: number = 16;

	let props: PageProps = $props();
	let data = $state(props.data);

	// Destructure basic fields
	const { id, name, userId } = data;
	// Forms
	const { form: avatarForm } = superForm(data.avatarForm, { warnings: { duplicateId: false } });
	const { form: firstNameForm } = superForm(data.firstNameForm, {
		warnings: { duplicateId: false },
	});
	const { form: lastNameForm } = superForm(data.lastNameForm, { warnings: { duplicateId: false } });

	// Use helper-based permission check
	const isSelf = $derived(isSelfUtil(page.data.authUser.id, userId));
</script>

<svelte:head>
	<title>User {name} Profile - {PUBLIC_SITE_NAME}</title>
	<meta name="description" content="Profile and details for user {name} on {PUBLIC_SITE_NAME}." />
</svelte:head>

<section class="m-auto max-w-xl space-y-4">
	<div
		class="divide-y divide-surface-200-800 card border border-surface-200-800 preset-filled-surface-100-900"
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
						<Avatar.Image src={$avatarForm.avatar} alt="Avatar of the user {name}" />
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
				<AvatarUpload {id} {data} {isSelf} {iconSize} />
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					<FirstName {id} {data} {isSelf} {iconSize} />
					<LastName {id} {data} {isSelf} {iconSize} />
				</div>
				<Phone {id} {data} {isSelf} {iconSize} />
				<div class="py-4">
					<Bio {id} {data} {isSelf} />
				</div>
			</div>
		</article>
		<footer class="mt-4 flex flex-row-reverse items-center justify-between gap-4 px-4 pb-4">
			<small class="opacity-60">Footer</small>
		</footer>
	</div>
	<div class="mt-8 flex items-center justify-between gap-4 border-t border-surface-200-800 p-2">
		<a class="btn preset-tonal btn-sm" href={resolve(`/users/${name}`)}>
			<ArrowBigLeft size={iconSize} />
			{name}
		</a>
	</div>
</section>
