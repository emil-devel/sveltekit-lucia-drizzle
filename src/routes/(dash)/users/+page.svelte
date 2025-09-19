<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { ArrowBigRightDash, Check, UsersRound, X } from '@lucide/svelte';

	const roles = ['USER', 'REDACTEUR', 'ADMIN'];

	let { data }: PageProps = $props();

	const { enhance: activeEnhance } = superForm(data.activeForm, { resetForm: true });
	const { enhance: roleEnhance } = superForm(data.roleForm, { resetForm: true });

	let { users }: any = $state([]);
	$effect(() => {
		users = data.users;
	});
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<article class="">
	<h2 class="flex items-center justify-end gap-2 h4">
		<UsersRound />
		<span>Users</span>
	</h2>

	<ul class="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
		{#each users as user, i (user.id)}
			<li
				class="flex items-center justify-between gap-2 card preset-filled-surface-300-700 p-4"
				out:fade
				animate:flip
			>
				{#if user.avatar}
					<img class="h-8 w-8" src={user.avatar} alt="Avatar {user.username}" />
				{/if}
				<h2 class="h5">{user.username}</h2>
				{#if page.data.authUser.role === 'ADMIN' && page.data.authUser.id !== user.id}
					<form method="post" action="?/active" use:activeEnhance>
						<input class="input" type="hidden" name="id" bind:value={user.id} />
						<label class="label">
							<input
								onchange={(e) => (e.currentTarget as HTMLInputElement).form?.requestSubmit()}
								class="checkbox"
								type="checkbox"
								name="active"
								checked={user.active}
							/>
						</label>
					</form>
					<form method="post" action="?/role" use:roleEnhance>
						<input class="input" type="hidden" name="id" value={user.id} />
						<label class="label">
							<select
								onchange={(e) => (e.currentTarget as HTMLSelectElement).form?.requestSubmit()}
								value={user.role}
								class="select rounded-container"
								name="role"
							>
								<option selected>{user.role}</option>
								{#each roles as role}
									{#if role !== user.role}
										<option value={role}>{role}</option>
									{/if}
								{/each}
							</select>
						</label>
					</form>
				{:else}
					<p>
						Active:
						{#if user.active}
							<Check class="text-success-500" />
						{:else}
							<X class="text-error-500" />
						{/if}, Role: {user.role}
					</p>
				{/if}
				<a href="/users/{user.username}">
					<ArrowBigRightDash class="text-primary-500" />
				</a>
			</li>
		{/each}
	</ul>
</article>
