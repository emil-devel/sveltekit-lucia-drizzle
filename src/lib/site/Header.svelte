<script lang="ts">
	import { page } from '$app/state';

	import { enhance } from '$app/forms';
	import favicon from '$lib/assets/favicon.svg';

	import { Popover } from '@skeletonlabs/skeleton-svelte';

	import { House, LogOut, Settings, UserRound, UsersRound, X } from '@lucide/svelte';

	let loggedUser: boolean = $state(false);
	const closeAuthUser = () => (loggedUser = false);

	const logo_class = 'flex items-center gap-2';
</script>

{#snippet siteName()}
	<img src={favicon} alt="Logo: EWDnet" width="32" height="32" />
	<span>Site Name</span>
{/snippet}

<div class="flex items-center justify-between gap-4">
	<h2 class="h6 lowercase">
		{#if !page.data.authUser || page.url.pathname === '/'}
			<span class={logo_class}>
				{@render siteName()}
			</span>
		{:else}
			<a class={logo_class} href="/" title="zur Startseite">
				{@render siteName()}
			</a>
		{/if}
	</h2>
	{#if page.data.authUser}
		<nav class="flex-auto" aria-label="Hauptnavigation">
			<ul class="flex items-center justify-center gap-4">
				<li>
					<a
						class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
						class:preset-filled-primary-200-800={page.url.pathname === '/'}
						aria-current={page.url.pathname === '/'}
						href="/"
					>
						<House size="16" />
						<span>Home</span>
					</a>
				</li>
				<li>
					<a
						class="btn preset-outlined-primary-200-800 btn-sm hover:preset-filled-primary-200-800"
						class:preset-filled-primary-200-800={page.url.pathname === '/users'}
						class:preset-tonal-primary={page.url.pathname.includes('/users')}
						aria-current={page.url.pathname === '/users'}
						href="/users"
					>
						<UsersRound size="16" />
						<span>Users</span>
					</a>
				</li>
			</ul>
		</nav>
	{/if}
	<div>
		{#if page.data.authUser}
			<Popover
				open={loggedUser}
				onOpenChange={(e) => (loggedUser = e.open)}
				positioning={{ placement: 'bottom' }}
				triggerBase="btn btn-sm {page.data.authUser.role === 'USER'
					? 'preset-filled-success-200-800'
					: ''} {page.data.authUser.role === 'REDACTEUR'
					? 'preset-filled-warning-200-800'
					: ''} {page.data.authUser.role === 'ADMIN' ? 'preset-filled-error-200-800' : ''}"
				contentBase="card bg-surface-200-800 p-4 space-y-4 max-w-sm"
				arrow
				arrowBackground="!bg-surface-200 dark:!bg-surface-800"
			>
				{#snippet trigger()}
					<UserRound size="16" />
					{page.data.authUser.username}
				{/snippet}
				{#snippet content()}
					<header class="flex flex-row-reverse">
						<button class="btn-icon hover:preset-tonal" onclick={closeAuthUser}><X /></button>
					</header>
					<article>
						<ul class="list space-y-2 pb-2 text-center text-sm">
							<li
								class:text-success-500={page.data.authUser.role === 'USER'}
								class:text-warning-500={page.data.authUser.role === 'REDACTEUR'}
								class:text-error-500={page.data.authUser.role === 'ADMIN'}
							>
								<UserRound size={16} />
								<span>{page.data.authUser.role.toLowerCase()}</span>
							</li>
							{#if page.url.pathname !== `/users/${page.data.authUser.username}`}
								<li>
									<a class="anchor" href="/users/{page.data.authUser.username}">
										<Settings size={16} />
										<span>Settings</span>
									</a>
								</li>
							{/if}
						</ul>
						<hr class="hr opacity-20" />
						<form
							class="border-t-2 border-t-primary-100-900 pt-2 text-center"
							method="post"
							action="/logout"
							use:enhance
						>
							<button class="btn preset-filled-secondary-200-800 btn-sm">
								abmelden <LogOut size="16" />
							</button>
						</form>
					</article>
				{/snippet}
			</Popover>
		{/if}
	</div>
</div>
