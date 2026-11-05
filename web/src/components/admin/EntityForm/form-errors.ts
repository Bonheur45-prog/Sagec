'use client';

import { createContext, useContext } from 'react';
import type { Errors } from '@/lib/cms/settings-validation';

/**
 * Field errors from the last save of an editor form, keyed by field name. Shared by the text
 * fields (CField) and the photo fields (MediaField), so every field can show its own reason.
 * Outside an editor form it is empty.
 */
export const FormErrorsContext = createContext<Errors>({});

export const useFieldError = (name: string): string | undefined => useContext(FormErrorsContext)[name];
