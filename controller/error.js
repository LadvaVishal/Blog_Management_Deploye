exports.get404 = (req, res, next) => {
  console.log('404 page')
    res.status(404).render('404', 
        { 
      isAuthenticated: req.session.isLoggedIn 
     });
  };