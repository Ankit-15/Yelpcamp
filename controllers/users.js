const User = require('../models/user')

module.exports.renderLoginForm = (req, res) => {
    res.render('./users/login');
}
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back');
    const returnt = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(returnt);
}
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds');
}
module.exports.register=async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const newuser = await User.register(user, password);
req.login(newuser,err=>{
    if(err)return next(err);


        req.flash('success', 'Welcome to YelpCamp!');
        res.redirect('/campgrounds')
    })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
}
module.exports.renderRegistrationForm=(req, res) => {
    res.render('./users/register')
}