<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { UsersRound } from '@lucide/svelte';
</script>

{#if page.data.authUser}
	<div class="flex flex-row-reverse flex-wrap items-center gap-4">
		<a
			class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
			class:preset-filled-primary-200-800={page.url.pathname === '/users'}
			class:preset-tonal-primary={page.url.pathname.includes('/users')}
			aria-current={page.url.pathname === '/users'}
			href={resolve('/users')}
		>
			<UsersRound size="16" />
			<span>Users</span>
		</a>
	</div>
{/if}
<p class="text-center">
	<a href="https://emil-devel.github.io/" target="_blank">
		<small>emil-devel.github.io</small>
	</a>
</p>
