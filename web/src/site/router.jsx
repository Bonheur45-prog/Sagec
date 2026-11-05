'use client';

// The few React Router pieces the SAGEC components use, rebuilt on Next.js routing, so the
// components moved from the Vite app work unchanged (their imports point here instead of
// 'react-router-dom').
import NextLink from 'next/link';
import { useParams as useNextParams, usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/** <Link to="/about"> → Next.js link. */
export function Link({ to, href, children, ...rest }) {
  return (
    <NextLink href={to ?? href ?? '/'} {...rest}>
      {children}
    </NextLink>
  );
}

/** <NavLink to className={({ isActive }) => …} end> */
export function NavLink({ to, end = false, className, style, children, ...rest }) {
  const pathname = usePathname() || '/';
  const target = typeof to === 'string' ? to.split(/[?#]/)[0] : '/';
  const isActive = end || target === '/' ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);
  const cls = typeof className === 'function' ? className({ isActive }) : className;
  const st = typeof style === 'function' ? style({ isActive }) : style;
  return (
    <NextLink href={to} className={cls} style={st} aria-current={isActive ? 'page' : undefined} {...rest}>
      {typeof children === 'function' ? children({ isActive }) : children}
    </NextLink>
  );
}

export function useParams() {
  return useNextParams() ?? {};
}

export function useNavigate() {
  const router = useRouter();
  return (to, opts) => (opts?.replace ? router.replace(to) : router.push(to));
}

/** Only `pathname` and `search` are used by the components. */
export function useLocation() {
  const pathname = usePathname() || '/';
  const params = useNextSearchParams();
  const search = params?.toString() ? `?${params.toString()}` : '';
  return { pathname, search, hash: '' };
}

/** Read-only [params] like React Router's (setters are not used by the components). */
export function useSearchParams() {
  return [useNextSearchParams() ?? new URLSearchParams()];
}

/** <Navigate to replace /> — client-side redirect (the server pages already send 404s/redirects first). */
export function Navigate({ to, replace = false }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}
