/* Prevent multiple logins, it’s 2025, we do session checks now. */
/* Will be useful for admin/encoder/regular user/volunteer checks  */

import { userModel } from "../model/model.js";
import accessConfig from '../model/config.js';

/**
 * Redirects invalid sessions to the sign-in page, or responds with a JSON error object.
 * @param {Request} req
 * @param {Response} res
 * @param {number} status_code
 */
function redirectInvalidSession(req, res, status_code) {
    if (req.accepts("html")) {
        return req.session.destroy(() => res.redirect("/login"));
    } else {
        return res.status(status_code).json({
            success: false,
            redirectUrl: "/login",
            error: "Session error",
        });
    }
}

/**
 * Checks if a valid session exists and stores user data for that session in `res.locals.user`.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @param {Function} if_invalid
 */
async function getSession(req, res, next, if_invalid) {
    if (!req.session?.user?._id) return if_invalid();

    try {
        // Use userModel to find user by _id
        const user = await userModel.findById(req.session.user._id).lean();

        if (!user || user.deleted) return if_invalid();

        res.locals.user = user; // pass to views or downstream middleware
        next();
    } catch (error) {
        console.error("Session validation error:", error);
        return if_invalid();
    }
}

/**
 * Middleware: Requires active user session
 */
export async function getActiveUser(req, res, next) {
    getSession(req, res, next, () => redirectInvalidSession(req, res, 401));
}

/**
 * Prevents already logged-in users from accessing sign-in/register pages
 */
export function checkExistingSession(req, res, next) {
    if (req.session?.user?.name) {
        if (req.accepts("html")) {
            return res.status(403).redirect("/dashboard");
        } else {
            return res.json({
                success: false,
                message: "Session already exists. Redirecting to /dashboard",
                sessionExists: true,
                redirectUrl: "/dashboard",
            });
        }
    }

    next();
}


export function authorizeUser(req, res, next) {
    // The user is guaranteed to be set in res.locals.user here
    const user = res.locals.user; 
    const path = req.path;

    if (!accessConfig.allRoutes.some(rx => rx.test(path))) {
        // 404: page does not exist
        return res.status(404).render('error', { title: 'Page not Found', url: req.originalUrl });
    }

    if (!accessConfig.expandedRoles[user.role].some(rx => rx.test(path))) {
        // 403: page exists but user forbidden
        return res.status(403).render('error', { title: 'Forbidden', url: req.originalUrl });
    }

    next();
}


/* Route based access control */
export async function accessControl(req, res, next) {
    const path = req.path;

    // 1. Public routes (no login required)
    if (accessConfig.public.some(pub => path.startsWith(pub))) {
        // Run check_existing_session to ensure already logged-in users 
        // don't access /signup, /login, etc. 
        // If not logged in, it calls next() and proceeds to the public page.
        return checkExistingSession(req, res, next);
    }

    // 2. Protected routes (require login)
    // get_active_user will handle unauthorized access by redirecting/sending 401.
    // If it calls next(), res.locals.user is guaranteed to be set.
    getActiveUser(req, res, () => authorizeUser(req, res, next));
}