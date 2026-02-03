<script lang="ts">
	import type { PageProps } from './$types';
	import { PUBLIC_SITE_NAME } from '$env/static/public';
	import { Avatar, Pagination, type usePagination } from '@skeletonlabs/skeleton-svelte';
	import { resolve } from '$app/paths';
	import { ArrowLeft, ArrowRight, Check, UsersRound, X } from '@lucide/svelte';

	let props: PageProps = $props();
	let data = $state(props.data);

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

	// Pagination
	const PAGE_SIZE = 5;
	let page = $state(1);
	const start = $derived((page - 1) * PAGE_SIZE);
	const end = $derived(start + PAGE_SIZE);
	const paginated = $derived(filteredUsers.slice(start, end));

	type PaginationApi = ReturnType<typeof usePagination>;
</script>

<svelte:head>
	<title>User List - {PUBLIC_SITE_NAME}</title>
	<meta name="description" content="Browse and manage users on {PUBLIC_SITE_NAME}." />
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
					<span class="sr-only">Role</span>
					<select
						class="select text-sm"
						bind:value={role}
						onchange={() => ((page = 1), (search = ''))}
					>
						<option value="" selected>All roles</option>
						<option value="USER">User</option>
						<option value="REDACTEUR">Redacteur</option>
						<option value="ADMIN">Admin</option>
					</select>
				</label>
			</div>
			<div>
				<label class="label">
					<span class="sr-only">Search</span>
					<input
						type="search"
						class="input w-fit text-sm"
						bind:value={search}
						onkeydown={() => (page = 1)}
						placeholder="Search users"
					/></label
				>
			</div>
		</div>
	</header>
	{#if countUser}
		<dl>
			<dt
				class="my-4 grid grid-cols-5 border-b border-b-surface-200-800 py-2 text-center text-sm text-surface-600-400"
			>
				<span>&nbsp;</span> <span>username</span> <span>role</span>
				<span class="text-center">active</span>
				<span class="text-right">registred</span>
			</dt>
			{#each paginated as user (user.id)}
				<dd class="my-2 card preset-filled-surface-100-900 card-hover">
					<a
						class="grid grid-cols-5 items-center border-r-[.25em] border-l-[.25em] border-surface-100-900 py-2 text-center hover:border-primary-300-700"
						href={resolve(`/users/${user.username}`)}
					>
						<Avatar class="h-10 w-10 text-xs">
							<Avatar.Image src={user.avatar} alt="Avatar of the user {user.username}" />
							<Avatar.Fallback>
								{user.firstName?.at(0)}{user.lastName?.at(0)}
							</Avatar.Fallback>
						</Avatar>
						<span class="text-surface-100">{user.username}</span>
						<span
							class="lowercase"
							class:text-success-500={user.role === 'USER'}
							class:text-warning-500={user.role === 'REDACTEUR'}
							class:text-error-500={user.role === 'ADMIN'}>{user.role}</span
						>
						<div class="text-center {user.active ? 'text-success-300-700' : 'text-error-300-700'}">
							{#if user.active}
								<Check />
							{:else}
								<X />
							{/if}
						</div>
						<p class="text-right">
							<span class="text-xs text-surface-100">{user.createdAt}</span>
						</p>
					</a>
				</dd>
			{/each}
		</dl>
		<div
			class="my-4 flex flex-row-reverse items-center gap-4 border-t border-t-surface-200-800 pt-2"
		>
			<p class="">
				<span class="code">{countUser}</span> User{countUser === 1 ? '' : 's'}
			</p>
			{#if countUser > 5}
				<div class="flex-auto">
					<Pagination
						class="flex-auto"
						count={filteredUsers.length}
						pageSize={PAGE_SIZE}
						{page}
						onPageChange={(event) => (page = event.page)}
					>
						<Pagination.PrevTrigger>
							<ArrowLeft class="size-4" />
						</Pagination.PrevTrigger>
						<Pagination.Context>
							{#snippet children(pagination: PaginationApi)}
								{#each pagination().pages as page, index (page)}
									{#if page.type === 'page'}
										<Pagination.Item {...page}>
											{page.value}
										</Pagination.Item>
									{:else}
										<Pagination.Ellipsis {index}>&#8230;</Pagination.Ellipsis>
									{/if}
								{/each}
							{/snippet}
						</Pagination.Context>
						<Pagination.NextTrigger>
							<ArrowRight class="size-4" />
						</Pagination.NextTrigger>
					</Pagination>
				</div>
			{/if}
		</div>
	{:else}
		<p class="p-4 text-center text-sm text-surface-600-400">
			No resilts{search ? ' for "' + search + '"' : ''}{role ? ' as ' + role.toLowerCase() : ''}.
		</p>
	{/if}
</article>
