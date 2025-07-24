import { db } from "$lib/server/database";
import { fail } from "@sveltejs/kit";
import type { ServerLoad, Actions } from "@sveltejs/kit";

export const load: ServerLoad = async({url})=>{
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = 10; // O el número de items por página que prefieras
    const searchTerm = url.searchParams.get('search');

    // 1. CONSULTA BASE CON JOINS
    // Empezamos desde 'medical_record' y unimos las otras tablas.
    let queryBase = db.selectFrom('medical_record')
        .innerJoin('patient', 'patient.id', 'medical_record.patient_id')
        .innerJoin('doctor', 'doctor.id', 'medical_record.doctor_id')
        .innerJoin('doctor_specialty', 'doctor_specialty.id', 'doctor.specialty_id');
    
    // 2. LÓGICA DE BÚSQUEDA
    if (searchTerm) {
        queryBase = queryBase.where((eb) => eb.or([
            // Buscamos en los campos de las tablas unidas
            eb('patient.name', 'ilike', `%${searchTerm}%`),
            eb('patient.lastName', 'ilike', `%${searchTerm}%`),
            eb('doctor.name', 'ilike', `%${searchTerm}%`),
            eb('doctor_specialty.name', 'ilike', `%${searchTerm}%`),
            eb(eb.cast('medical_record.emmited_at', 'text'), 'ilike', `%${searchTerm}%`)
        ]));
    }

    // 3. PRIMERA CONSULTA: OBTENER EL CONTEO TOTAL DE RESULTADOS
    // Usamos el id de medical_record para el conteo
    const totalResult = await queryBase
        .select(db.fn.count('medical_record.id').as('total'))
        .executeTakeFirst();
    
    const totalItems = Number(totalResult?.total ?? 0);
    const pageCount = Math.ceil(totalItems / pageSize);

    // 4. SEGUNDA CONSULTA: OBTENER LOS DATOS DE LA PÁGINA ACTUAL
    const informes = await queryBase
        .select([
            'medical_record.id', // ID del informe para las acciones
            'patient.name as patient_name',
            'patient.lastName as patient_lastName',
            'doctor.name as doctor_name',
            'doctor_specialty.name as specialty_name',
            'medical_record.emmited_at'
        ])
        .orderBy('medical_record.emmited_at', 'desc') // Ordenar por fecha de emisión
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .execute();

    // 5. DEVOLVER TODOS LOS DATOS
    return {
        informes,
        pageCount,
        currentPage: page,
        pageSize,
        totalItems,
        searchTerm
    };
}

export const actions: Actions = {
    delete: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id');

        if (!id) {
            return fail(400, { message: 'ID no proporcionado' });
        }

        const selectedItemId = Number(id);

        try {
            const deleteResult = await db
                .deleteFrom('medical_record')
                .where('medical_record.id', '=', selectedItemId)
                .executeTakeFirst();

            if (deleteResult.numDeletedRows === 0n) {
                return fail(404, { message: `Informe con ID ${selectedItemId} no encontrado.` });
            }

            return { success: true, message: `Informe con ID ${selectedItemId} eliminado.` };

        } catch (error) {
            console.error("Error al eliminar informe:", error);
            // Podrías tener un error de clave foránea si el informe está referenciado en otro lugar.
            if (error instanceof Error && error.message.includes('foreign key constraint')) {
                 return fail(409, { message: 'No se puede eliminar. El informe está siendo utilizado en otras partes del sistema.' });
            }
            return fail(500, { message: 'Error interno del servidor.' });
        }
    }
};