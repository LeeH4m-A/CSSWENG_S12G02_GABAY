import { userModel } from "../model/model.js";

/**
 * Redirects invalid sessions to the sign-in page, or responds with a JSON error object.
 * @param {Request} req
 * @param {Response} res
 * @param {number} status_code
 */
function redirect_invalid_session(req, res, status_code) {
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
async function get_session(req, res, next, if_invalid) {
    if (!req.session?.user_id) return if_invalid();

    try {
        // Use userModel to find user by _id
        const user = await userModel.findById(req.session.user_id).lean();

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
export async function get_active_user(req, res, next) {
    get_session(req, res, next, () => redirect_invalid_session(req, res, 401));
}

/**
 * Prevents already logged-in users from accessing sign-in/register pages
 */
export function check_existing_session(req, res, next) {
    if (req.session?.name) {
        if (req.accepts("html")) {
            return res.redirect("/login");
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
