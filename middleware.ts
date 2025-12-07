import { withAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

const locales = ["es", "en"];
const publicPages = ["/", "/login", "/register", "/servicios"];

const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale: 'es'
});

const authMiddleware = withAuth(
    // Note that this callback is only invoked if
    // the `authorized` callback has returned `true`.
    function onSuccess(req) {
        return intlMiddleware(req);
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                if (token?.role) {
                    return ["ADMIN", "DOCTOR", "ASSISTANT"].includes(token.role);
                }
                return false;
            },
        },
        pages: {
            signIn: "/login",
        },
    }
);

export default function middleware(req: NextRequest) {
    const publicPathnameRegex = RegExp(
        `^(/(${locales.join("|")}))?(${publicPages.flatMap((p) => (p === "/" ? ["", "/"] : p)).join("|")})/?$`,
        "i"
    );
    const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

    if (isPublicPage) {
        return intlMiddleware(req);
    } else {
        return (authMiddleware as any)(req);
    }
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
