import express from 'express'


router = express.Router();
/* TODO: make the event page, for now it's empty */
router.get("/events", (req, res) => {
    res.redirect("/dashboard");
})