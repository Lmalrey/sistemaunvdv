import type { Actions } from './$types'

export const actions: Actions = {
  restore: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/login/newpassword'
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  }
}