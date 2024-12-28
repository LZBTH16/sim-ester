const auth = {
    checkAuthentication: function(req, res) {
        let authenticated = false;
    
        if (req.session.authenticatedUser) {
            authenticated = true;
        }
    
        if (!authenticated) {
            let loginMessage = "You are not logged in.";
            req.session.loginMessage = loginMessage;
            res.redirect("/login");
        }
    
        return authenticated;
    },
    checkAuthenticationRedirectToCart: function(req, res) {
        let authenticated = false;
    
        if (req.session.authenticatedUser) {
            authenticated = true;
        }
    
        if (!authenticated) {
            let loginMessage = "You are not logged in.";
            req.session.loginMessage = loginMessage;
            res.redirect("/login?redirectCart=true");
        }
    
        return authenticated;
    },
    checkAdmin: function(req, res) {
        if(req.session.admin == 0) {
            res.redirect("/not-authorized");
        }
        return req.session.admin;
    }
}

module.exports = auth;