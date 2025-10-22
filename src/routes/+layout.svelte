<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/site/Header.svelte';
	import Footer from '$lib/site/Footer.svelte';
	import { page } from '$app/state';
	import { Toast } from '@skeletonlabs/skeleton-svelte';
	import { toaster } from '$lib/toaster';
	import { getFlash } from 'sveltekit-flash-message';
	import { fade } from 'svelte/transition';

	const outer = 'px-2 sm:py-4';
	const inner = 'w-full max-w-4xl mx-auto  py-4 space-y-4';
	const border_t = 'border-t border-t-primary-200-800';
	const border_b = 'border-b border-b-primary-200-800';

	let { children, data } = $props();

	const flash = getFlash(page);

	const ms: number = 4000;

	$effect(() => {
		if (!$flash) return;

		const t = String($flash.type);
		if (t === 'error') toaster.error({ description: $flash.message, duration: ms });
		if (t === 'warning') toaster.warning({ description: $flash.message, duration: ms });
		if (t === 'success') toaster.success({ description: $flash.message, duration: ms });
		if (t === 'info') toaster.info({ description: $flash.message, duration: ms });

		$flash = undefined;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Toast.Group {toaster}>
	{#snippet children(toast)}
		<Toast {toast} class="w-sm">
			<Toast.Message>
				<Toast.Title>{toast.title}</Toast.Title>
				<Toast.Description>{toast.description}</Toast.Description>
			</Toast.Message>
			<Toast.CloseTrigger />
		</Toast>
	{/snippet}
</Toast.Group>

<header class={outer}>
	<div class="{inner} {border_b}">
		<Header />
	</div>
</header>
<main class="flex-auto {outer}">
	{#key data.url}
		<div class={inner} out:fade={{ duration: 300 }} in:fade={{ delay: 300, duration: 300 }}>
			{@render children?.()}
		</div>
	{/key}
</main>
<footer class={outer}>
	<div class="{inner} {border_t}">
		<Footer />
	</div>
</footer>
