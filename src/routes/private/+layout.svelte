<script>
  import Sidebar from '../../lib/components/sidebar.svelte';

  let { data, children } = $props()
  let { supabase } = $derived(data)

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error(error)
    }
  }
</script>

<div class="layout-container">
  <Sidebar/>
  <div class="main-content">
    <header>
      
    </header>
    <main>
      {@render children()}
    </main>
    <footer>
      <!-- <button onclick={logout}>Logout</button> -->
    </footer>
  </div>
</div>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');


.layout-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  background-color: #f0f2f5;
  box-sizing: border-box;
}

.main-content {
  flex: 1;
  padding: .5rem;
  transition: margin-left 0.2s; /* El sidebar ya ocupa su espacio */
}
</style>
