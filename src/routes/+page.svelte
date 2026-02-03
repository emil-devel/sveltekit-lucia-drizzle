<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_SITE_NAME } from '$env/static/public';
</script>

<svelte:head>
	<title>Start Page - {PUBLIC_SITE_NAME}</title>
	<meta name="description" content="Welcome to the start page of {PUBLIC_SITE_NAME}." />
</svelte:head>

<h1 class="h4">
	<span>Startpage</span>
</h1>
<p>authUser: {page.data.authUser?.username}</p>
