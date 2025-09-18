<script lang="ts">
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
	$inspect(data);
</script>

<h2 class="h4">Startpage</h2>
