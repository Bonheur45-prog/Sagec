'use client';

import { createContext, useContext } from 'react';

/**
 * Header and footer content published in the CMS (Header / Footer), plus the company names,
 * provided once by the public layout. Before anything is published, the CMS starter versions
 * are used, which match the old hard-coded menu and footer.
 */
export const SiteChromeContext = createContext({ header: null, footer: null, companyName: 'SAGEC Ltd', legalName: 'SAGEC Ltd', services: [], turnstileSiteKey: null });

export const useSiteChrome = () => useContext(SiteChromeContext);
