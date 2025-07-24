import { db } from "$lib/server/database.js";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod/v4";

const schema = z.object({
  weight: z.int(),
  height: z.int(),
  cephalicPerimeter: z.int(),
  heartRate: z.int(),
  breathingRate: z.int(),
  bloodPressureLow: z.int(),
  bloodPressureHigh: z.int(),
});

export const load = async () => {
  return { form: await superValidate(zod4(schema)) };
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod4(schema));
    console.log(form);

    if (!form.valid) return fail(400, { form });

    await db
      .insertInto("physical_exam")
      .values({
        weight: form.data.weight,
        height: form.data.height,
        cephalic_perimeter: form.data.cephalicPerimeter,
        heard_rate: form.data.heartRate,
        blood_pressure: `[${form.data.bloodPressureLow} , ${form.data.bloodPressureHigh}]`,
        breathing_rate: form.data.breathingRate,
        date: new Date().toISOString(),
      })
      .execute();

    return message(form, "Form posted successfully!");
  },
};
