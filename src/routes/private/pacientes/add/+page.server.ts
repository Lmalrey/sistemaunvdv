import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { patientFormSchema } from './schema';
import { db } from '$lib/server/database';
import { redirect } from '@sveltejs/kit';
import type { ServerLoad, Actions } from "@sveltejs/kit";

export const load: ServerLoad = async () => {
  // 1. Cargar datos para los <select> del formulario
  const genders = await db.selectFrom('gender').selectAll().execute();
  const provinces = await db.selectFrom('province').selectAll().execute();
  const states = await db.selectFrom('state').selectAll().execute();

  // 2. Cargar las preguntas para los antecedentes
  const personalQuestions = await db.selectFrom('personal_background_question').selectAll().execute();
  const familyQuestions = await db.selectFrom('family_background_question').selectAll().execute();

  // 3. Crear una instancia del formulario con valores por defecto
  const form = await superValidate(zod(patientFormSchema));

  // 4. Poblar las preguntas en los datos del formulario para que se rendericen
  form.data.personal_background.answers = personalQuestions.map(q => ({
    question_id: Number(q.id),
    question_text: q.question,
    answer: false
  }));
  form.data.family_background.answers = familyQuestions.map(q => ({
    question_id: Number(q.id),
    question_text: q.question,
    answer: false
  }));

  // 5. Devolver todo a la página
  return {
    form,
    genders,
    provinces,
    states,
  };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(patientFormSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      // Usamos una transacción para asegurar la integridad de los datos
      await db.transaction().execute(async (trx) => {
        // 1. Insertar el antecedente personal y obtener su ID
        const personalBg = await trx
          .insertInto('personal_background')
          .values({ description: form.data.personal_background.description })
          .returning('id')
          .executeTakeFirstOrThrow();

        // 2. Insertar las respuestas a las preguntas personales
        const personalAnswersData = form.data.personal_background.answers.map(ans => ({
          background_id: personalBg.id,
          question_id: BigInt(ans.question_id),
          answer: ans.answer
        }));
        await trx.insertInto('personal_background_question_junction').values(personalAnswersData).execute();

        // 3. Insertar el antecedente familiar y obtener su ID
        const familyBg = await trx
          .insertInto('family_background')
          .values({ description: form.data.family_background.description })
          .returning('id')
          .executeTakeFirstOrThrow();
        
        // 4. Insertar las respuestas a las preguntas familiares
        const familyAnswersData = form.data.family_background.answers.map(ans => ({
            background_id: familyBg.id,
            question_id: BigInt(ans.question_id),
            answer: ans.answer
        }));
        await trx.insertInto('family_background_question_junction').values(familyAnswersData).execute();

        // 5. Finalmente, insertar el paciente con los IDs de los antecedentes
        await trx.insertInto('patient').values({
            ci: form.data.ci,
            name: form.data.name,
            lastName: form.data.lastName,
            birthDate: form.data.birthDate,
            phone: form.data.phone,
            email: form.data.email,
            gender_id: form.data.gender_id,
            province_id: form.data.province_id,
            state_id: form.data.state_id,
            city: form.data.city,
            parent_fullname: form.data.parent_fullname,
            parent_ci: form.data.parent_ci,
            personal_background_id: personalBg.id,
            family_background_id: familyBg.id,
        }).execute();
      });
    } catch (error) {
      console.error('Error al crear el paciente:', error);
      // Aquí puedes añadir un mensaje de error más amigable en el formulario
      return fail(500, { form, message: 'Hubo un error en el servidor. Inténtalo de nuevo.' });
    }

    // Si todo va bien, redirigir a una página de éxito
    throw redirect(303, '/private/pacientes');
  }
};