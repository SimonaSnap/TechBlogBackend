const router = require('express').Router();
const { User, Post, Comments } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) =>
{
    try
    {
        const postData = await Post.findAll({
            include: [
                {
                    model: User,
                    attributes: ['username'],
                },
            ],
        });
        //we are getting posts and creating an array with them (or an object)

        const posts = postData.map((post) => post.get({ plain: true }));
        //we are taking that array and converting it to plain javascript

        res.render('homepage', {
            posts,
            logged_in: req.session.logged_in,
        });
        //we are sending that plain javascript array to the homepage.handlebars
        //also sending in if this user is logged in or not
    } catch (err)
    {
        console.log(err);
        res.status(500).json(err);
    }
});
//this shall render the homepage handlebar with all of the posts and the person's username

router.get('/post/:id', async (req, res) =>
{
    try
    {
        const postData = await Post.findByPk(req.params.id, {
            //findByPk - find by Primary Key
            indlude: [
                {
                    model: User,
                    attributes: ['username'],
                },
                {
                    model: Comments,
                    include: {
                        model: User,
                        attributes: ['username'],
                    },
                },
            ],
        });
        //get all of the info for a single post and its attached comments

        const post = postData.get({ plain: true });
        //its only a single object so it doens't need map
        //converts it to simple javascript

        res.render('posts', {
            ...post,
            logged_in: req.session.logged_in,
        });
    } catch (err)
    {
        console.log(err);
        res.status(500).json(err);
    }
});
//this will render out a post at a give id number in the query

router.get('/profile', withAuth, async (req, res) =>
{
    try
    {
        const userData = await User.findByPk(req.session.user_id, {
            //the person going through the process of logging in with set a session that then become the req.session.user_id value
            attributes: { exclude: ['password'] },
            include: [{ model: Post }],
        });
        //get rid of password info, and also get all of the user's posts

        const user = userData.get({ plain: true });

        res.render('profile', {
            ...user,
            //triple dots - breaking up an existing array into a new array
            logged_in: true,
        });
    } catch (err)
    {
        console.log(err);
        res.status(500).json(err);
    }
});

router.get('/login', (req, res) =>
{
    if (req.session.logged_in)
    {
        //if you are logged in there is no point to going to the login page
        //force redirect to profile
        res.redirect('/profile');
        return;
    }

    res.render('login');
});

module.exports = router;
