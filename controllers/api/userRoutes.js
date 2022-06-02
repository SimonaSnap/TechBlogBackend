const router = require('express').Router();
const { User, Post, Comments } = require('../../models');
const withAuth = require('../../utils/auth');

// these are the /api/users routes
router.post('/', async (req, res) =>
{
    try
    {
        const userData = await User.create(req.body);

        req.session.save(() =>
        {
            req.session.user_id = userData.id;
            req.session.logged_in = true;

            res.status(200).json(userData);
        })

    } catch
    {
        console.log(err);
        res.status(500).json(err);
    }
});

router.post('/login', async (req, res) =>
{
    try
    {
        const userCorrect = await User.findOne({ where: { username: req.body.username } });
        //finding a singular user with the username given through input

        if (!userCorrect)
        {
            res.status(400).json({ message: "Incorrect login information, please try again" });
            return;
        }
        //checks if the username is correct

        const passCorrect = await userCorrect.checkPassword(req.body.password);

        if (!passCorrect)
        {
            res.status(400).json({ message: "Incorrect login information, please try again" });
            return;
        }

        req.session.save(() =>
        {
            req.session.user_id = userCorrect.id;
            req.session.logged_in = true;

            res.json({ user: userCorrect, message: "Logged in successfully!" })
        })
    } catch
    {
        console.log(err);
        res.status(500).json(err);
    }
});

router.post("/logout", (req, res) =>
{
    if (req.session.logged_in)
    {
        req.session.destroy(() =>
        {
            res.status(204).end();
        });
    } else
    {
        res.status(404).end();
    }
});

module.exports = router;