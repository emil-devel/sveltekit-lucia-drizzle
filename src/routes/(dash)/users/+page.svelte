<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { users }: any = $state(data);
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
				<button class="btn preset-outlined-error-300-700 btn-sm"> Delete </button>
			</form>
		</li>
	{/each}
</ul>
