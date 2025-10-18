<script lang="ts">
	import type { PageProps } from './$types';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { Avatar } from '@skeletonlabs/skeleton-svelte/composed';
	import { Check, UsersRound, X } from '@lucide/svelte';

	let { data }: PageProps = $props();
	let { users } = data;

	let role: string = $state('');
	let search: string = $state('');

	const filteredUsers = $derived(
		users.filter((user) => {
			if (role && role !== '' && user.role !== role) return false;
			const term = search?.trim().toLowerCase();
			if (!term) return true;
			const username = (user.username || '').toLowerCase();
			return username.includes(term);
		})
	);
	const countUser: number = $derived(filteredUsers.length);
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<article class="">
	<header class="flex flex-row-reverse items-center gap-4 pb-4">
		<h2 class="flex items-center justify-end gap-2 h4">
			<UsersRound />
			<span>Users</span>
		</h2>
		<div class="flex flex-auto items-center gap-4">
			<div>
				<label class="label">
					<select class="select" bind:value={role}>
						<option value="" selected>All roles</option>
						<option value="USER">User</option>
						<option value="REDACTEUR">Redacteur</option>
						<option value="ADMIN">Admin</option>
					</select>
				</label>
			</div>
			<div>
				<label class="label"
					><input
						type="search"
						class="input w-fit"
						bind:value={search}
						placeholder="Search users"
					/></label
				>
			</div>
		</div>
	</header>

	<dl>
		<dt
			class="my-4 grid grid-cols-5 gap-2 border-b border-b-surface-200-800 p-2 text-sm text-surface-600-400"
		>
			<span>&nbsp;</span> <span>username</span> <span>role</span>
			<span class="text-center">active</span>
			<span class="text-right">registred</span>
		</dt>
		{#each filteredUsers as user (user.id)}
			<dd class="my-2 card preset-filled-surface-100-900 card-hover">
				<a
					class="grid grid-cols-5 items-center gap-2 border-r-[.25em] border-l-[.25em] border-surface-100-900 p-2 hover:border-primary-300-700"
					href="/users/{user.username}"
				>
					<Avatar class="h-10 w-10 text-xs">
						<Avatar.Image src={user.avatar} />
						<Avatar.Fallback>{user.firstName?.at(0)}{user.lastName?.at(0)}</Avatar.Fallback>
					</Avatar>
					<span class="opacity-80">{user.username}</span>
					<span
						class="lowercase"
						class:text-success-300-700={user.role === 'USER'}
						class:text-warning-300-700={user.role === 'REDACTEUR'}
						class:text-error-300-700={user.role === 'ADMIN'}>{user.role}</span
					>
					<Switch
						checked={user.active}
						controlWidth="w-6 mx-auto"
						controlActive="preset-filled-primary-300-700"
						compact
					>
						{#snippet inactiveChild()}<X size="14" />{/snippet}
						{#snippet activeChild()}<Check size="14" />{/snippet}
					</Switch>
					<p class="text-right">
						<span class="code">{user.createdAt}</span>
					</p>
				</a>
			</dd>
		{/each}
	</dl>
	<div class="my-4 flex items-center justify-between border-t border-t-surface-200-800 pt-2">
		<p class="flex-auto opacity-50">Pagination comes here</p>
		<p class="">
			<span class="code">{countUser}</span> User{countUser === 1 ? '' : 's'}
		</p>
	</div>
</article>
