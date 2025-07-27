<script lang="ts">
	let { title, value, description, icon } = $props();

	const icons = {
		users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
		calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
		document: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
		link: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>`
	}
</script>

<div class="stat-card">
	<div class="card-content">
		<h3 class="card-title">{title}</h3>
		<p class="card-value">{value}</p>
		<p class="card-description">{description}</p>
	</div>
	<div class="card-icon">
		{@html icons[icon]}
	</div>
</div>

<style>
	.stat-card {
		background-color: #ffffff;
		border-radius: 0.75rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.06);
		border: 1px solid #e2e8f0;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.card-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: #64748b;
		margin: 0;
	}

	.card-value {
		font-size: 2.25rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0.25rem 0;
	}

	.card-description {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0;
	}

	.card-icon {
		color: #94a3b8;
	}
</style>