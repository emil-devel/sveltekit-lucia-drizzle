<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';

	let { data }: PageProps = $props();
	let { users }: any = $state([]);
	$effect(() => {
		users = data.users;
	});
</script>

<ul>
	{#each users as user (user.id)}
		<li class="mb-2 flex items-center">
			<form class="flex items-center gap-2" method="post" action="?/update" use:enhance>
				<fieldset>
					<input class="input" type="hidden" name="id" value={user.id} />
					<input class="input" type="text" name="username" value={user.username} />
				</fieldset>
				<button class="btn preset-outlined-primary-300-700 btn-sm"> Update </button>
			</form>
			<form class="flex items-center gap-2" method="post" action="?/delete" use:enhance>
				<fieldset>
					<input class="input" type="hidden" name="id" value={user.id} />
				</fieldset>
				<div class="flex items-center gap-2">
					<button class="btn preset-outlined-error-300-700 btn-sm"> Delete </button>
					<span class="text-sm text-gray-500">
						{#if user.updatedAt !== user.createdAt}
							Updated: {user.updatedAt},
						{/if}
						Created: {user.createdAt}
					</span>
					<img src={user.avatar} alt="{user.username}'s avatar" class="h-8 w-8" />
				</div>
			</form>
		</li>
	{/each}
</ul>
