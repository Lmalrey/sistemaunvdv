// src/params/userRole.ts
import type { ParamMatcher } from '@sveltejs/kit';

// Esta función valida que el parámetro [role] sea uno de los dos valores permitidos.
export const match: ParamMatcher = (param) => {
	return param === 'doctor' || param === 'secretaria';
};