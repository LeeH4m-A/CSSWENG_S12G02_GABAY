import { validationResult } from "express-validator";

/** Sends back {@link validationResult} errors if any are encountered */
export default (req, res, next) => {
    const result = validationResult(req);

    /* In case of validation error */
    if (result.errors.length > 0) {
        let msg = result.errors.map((x) => x.msg).join(". ") + ".";
        return res.redirect(`${req.originalUrl}?error=${encodeURIComponent(msg)}`);;
    }

    next();
};