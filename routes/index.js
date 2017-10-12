let express = require('express');
let router = express.Router();

router.get('/', function (req, res, next) {
    if (!res.locals.partials) {
        res.locals.partials = {};
    }
    res.render('index', {
        title: 'Express',
        partials: {
            test: '这是一个附加的值'
        }
    });
});

module.exports = router;
