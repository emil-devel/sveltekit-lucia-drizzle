<script lang="ts">
	import type { PageProps } from './$types';
	import { Avatar } from '@skeletonlabs/skeleton-svelte/composed';
	import {
		ArrowRight,
		Check,
		Funnel,
		FunnelX,
		Search,
		SearchX,
		UserRound,
		UsersRound,
		X
	} from '@lucide/svelte';

	let { data }: PageProps = $props();
	const users = $derived(data.users);
	const countUser: number = $derived(users.length);
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<article class="">
	<header class="flex flex-row-reverse items-center gap-4">
		<h2 class="flex items-center justify-end gap-2 h4">
			<UsersRound />
			<span>Users</span>
		</h2>
		<label class="label flex items-center gap-1">
			<input class="input w-fit" type="search" name="search" />
			<Search size="20" />
			<SearchX size="20" />
			<Funnel size="20" />
			<FunnelX size="20" />
		</label>
	</header>

	<div class="my-2 table-wrap border-[.1em] border-surface-300-700 p-4">
		<table class="table table-auto caption-bottom sm:table-fixed">
			<thead>
				<tr>
					<th>avatar</th>
					<th>username</th>
					<th>role</th>
					<th>active</th>
					<th>registred</th>
					<th>view</th>
				</tr>
			</thead>
			<tbody class="[&>tr]:hover:preset-tonal-primary">
				{#each users as user (user.id)}
					<tr>
						<td>
							<Avatar class="h-10 w-10 text-xs">
								<Avatar.Image src={user.avatar} />
								<Avatar.Fallback>{user.username}</Avatar.Fallback>
							</Avatar>
						</td>
						<td>
							<span
								class:text-success-500={user.role === 'USER'}
								class:text-warning-500={user.role === 'REDACTEUR'}
								class:text-error-500={user.role === 'ADMIN'}
							>
								{user.username}
							</span>
						</td>
						<td class="lowercase">
							<span
								class:text-success-500={user.role === 'USER'}
								class:text-warning-500={user.role === 'REDACTEUR'}
								class:text-error-500={user.role === 'ADMIN'}
							>
								{user.role}
							</span>
						</td>
						<td>
							{#if user.active}
								<Check class="text-success-500" />
							{:else}
								<X class="text-error-500" />
							{/if}
						</td>
						<td><span class="code">{user.createdAt}</span></td>
						<td>
							<a class="badge preset-filled-primary-500" href="/users/{user.username}">
								<UserRound size="20" />
								<ArrowRight size="20" />
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="4"></td>
					<td>Total:</td>
					<td class="text-right"
						><span class="code">{countUser}</span> User{countUser === 1 ? '' : 's'}</td
					>
				</tr>
			</tfoot>
		</table>
	</div>
</article>
