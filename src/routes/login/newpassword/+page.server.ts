import type { Actions } from "./$types";
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
  changepassword: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const password = formData.get('password') as string

    // Obtén el usuario autenticado y validado desde Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'No autorizado o usuario no encontrado.' }
    }

    // Cambia la contraseña del usuario autenticado
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      return { error: error.message }
    }else {
      redirect(303, '/login')
    }
  }
};