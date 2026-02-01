<script lang="ts">
	import { page } from '$app/state';
</script>

<section class="mx-auto max-w-xs">
	<h1 class="flex items-center justify-end gap-2 h4">
		<span>Startpage</span>
	</h1>
	<p>authUser: {page.data.authUser?.username}</p>
</section>
