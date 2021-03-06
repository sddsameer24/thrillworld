var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Category = require('../models/category');
var Message = require('../models/chatmessage');
var Configuration = require('../models/configuration');
var Product = require('../models/product');
var User = require('../models/user');
var Ticket = require('../models/ticket');
var Activity = require('../models/activity');
var Event = require('../models/events');
var nodemailer = require('nodemailer');
var async = require('async');
const { merge } = require('lodash');
var Order = require('../models/order');
var Store = require('../models/store');
var sigma = require('sigma');
var passport = require('passport');
var crypto = require('crypto');
var moment = require('moment');
var mongoose = require('mongoose');
var User = require('../models/user');
var Payment = require('../models/payment');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var csv = require('ya-csv');
var uuid = require('uuid');
var Config = require('../config/config');
var Stats = require('../local_modules/stats');
var meanlogger = require('../local_modules/meanlogger');
var q = new Date();
var m = q.getMonth();
var d = q.getDay();
var y = q.getFullYear();
var date = new Date(y, m, d);

/* Get Stores for geo map */
router.get('/stores', function(req, res, next) {
    errorMsg = req.flash('error')[0];
    successMsg = req.flash('success')[0];
    var tot = totalSales(function(err, next) {
        if (err) {
            //console.log(err.message);
            return res.error('err');
        }
    });
    Store.find({}, function(err, docs) {
        res.render('vendor/stores', {
            layout: 'vendor-map.hbs',
            stores: docs,
            errorMsg: errorMsg,
            successMsg: successMsg,
            noErrorMsg: !errorMsg,
            noMessage: !successMsg,
            totalSales: tot,
            GOOGLE_APIKEY: process.env.GOOGLE_APIKEY,
            orders: docs,
            noErrors: 1
        });
    });
})

// ..........................................messages...........................................................

router.get('/messages', function(req, res, next) {
    errorMsg = req.flash('error')[0];

    Message.distinct('form', (err, custresponse) => {
        //res.send(messages);
        custresponse_store = custresponse;
        // console.log(custresponse);

        res.render('vendor/messages', {
            layout: 'vendor-page.hbs',
            custresponse_store: custresponse_store,
        })
    });
})

/* Get Relations for graph map */

router.get('/relations', function(req, res, next) {
    errorMsg = req.flash('error')[0];
    var adminPageTitle = "Relationships";
    var adminPageUrl = "/vendor/relations";
    successMsg = req.flash('success')[0];
    var tot = totalSales(function(err, next) {
        if (err) {
            //console.log(err.message);
            return res.error('err');
        }
    });

    res.render('vendor/relations', {
        layout: 'vendor-relations.hbs',
        adminPageTitle: adminPageTitle,
        adminPageUrl: adminPageUrl,
        errorMsg: errorMsg,
        successMsg: successMsg,
        noErrorMsg: !errorMsg,
        noMessage: !successMsg,
        totalSales: tot,
        noErrors: 1
    });
})

/* GET home page. */

router.get('/', isAdmin, function(req, res, next) {
    errorMsg = req.flash('error')[0];
    successMsg = req.flash('success')[0];
    var tot = totalSales(function(err, next) {
        if (err) {
            //////console.log(err.message);
            return res.error('err');
        }
    });
    var custresponse_store;

    var today = new Date();
    var currDay = today.getDate();
    var currMonth = today.getMonth() + 1;
    var currYear = today.getFullYear();
    // console.log(currYear + "-" + currMonth + "-" + currDay);
    var date = (currYear + "-" + currMonth + "-" + currDay);
    qryFilter = { "cart.vendor_id": req.user._id.toString() }, { "checkin": date };
    qryFilter1 = { "cart.vendor_id": req.user._id.toString() }, { "checkout": date };
    qryFilter2 = { "cart.vendor_id": req.user._id.toString() }, { "created": { $gte: moment(date) } };
    Order.find(qryFilter, function(err, docs) {
        var bookings = docs.length;
        Order.find(qryFilter1, function(err, docs1) {
            var checkouts = docs1.length;
            Order.find(qryFilter2, function(err, docs3) {
                var bookingsno = docs3.length;
                res.render('vendor/Activity', {
                    layout: 'vendor-page.hbs',
                    errorMsg: errorMsg,
                    successMsg: successMsg,
                    noErrorMsg: !errorMsg,
                    noMessage: !successMsg,
                    totalSales: tot,
                    docs: docs,
                    docs1: docs1,
                    docs3: docs3,
                    bookingsno: bookingsno,
                    noErrors: 1,
                    date: date,
                    user: req.user,
                    bookings: bookings,
                    checkouts: checkouts,
                    custresponse_store: custresponse_store
                });
            });
        });
    });
});
//     errorMsg = req.flash('error')[0];
//     successMsg = req.flash('success')[0];
//     var tot = totalSales(function (err, next) {
//         if (err) {
//             //console.log(err.message);
//             return res.error('err');
//         }
//     });
//     var custresponse_store;
//     Message.distinct('form' ,(err, custresponse)=> {
//         //res.send(messages);
//         custresponse_store=custresponse;
// 		console.log(custresponse);
//       })

//     Order.find({}, function (err, docs) {
//         meanlogger.log("check", "Viewed", req.user);
//         Product.find(function (err, products) {
//             productChunks = [];
//             chunkSize = 5;
//             for (var i = (5 - chunkSize); i < products.length; i += chunkSize) {
//                 productChunks.push(docs.slice(i, i + chunkSize))
//             }
//             // res.render('shop/index', {
//             // 	title: 'MEAN Store',
//             // 	products: productChunks,
//             // 	user: user
//             //   	});
//             res.render('vendor/Activity', {
//                 layout: 'vendor-page.hbs',
//                 products: productChunks,
//                 errorMsg: errorMsg,
//                 successMsg: successMsg,
//                 noErrorMsg: !errorMsg,
//                 noMessage: !successMsg,
//                 totalSales: tot,
//                 orders: docs,
//                 noErrors: 1,
//                 user: req.user,
//                 custresponse_store:custresponse_store
//             });
//         });
//     });
// });

router.get('/orders:filter?', isAdmin, function(req, res, next) {
    var filter = req.query.filter;
    meanlogger.log("check", "Viewed orders", req.user);

    if (!filter || filter == 'allOrders') {
        var allOrders = true;
        var pendingOrders = false;
        var pickedUpOrders = false;
        //console.log(req.user._id);


        qryFilter = { "cart.vendor_id": req.user._id.toString() };

    } else {
        if (filter == 'pendingOrders') {
            //console.log("pending");
            var allOrders = false;
            var pendingOrders = true;
            var pickedUpOrders = false;
            qryFilter = { "cart.vendor_id": req.user._id.toString() }, { receipt_status: 'pending' }, { receipt_status: 'partial' }, { receipt_status: 'New' }, { receipt_status: '' }, { "user.id": req.user._id };
        } else {
            if (filter == 'pickedUpOrders' || filter == 'complete') {
                //console.log("picked");
                var allOrders = false;
                var pendingOrders = false;
                var pickedUpOrders = true;
                qryFilter = { receipt_status: 'complete' }, { "user.id": req.user._id }, { "cart.vendor_id": req.user._id.toString() };
            }
        }
    }
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var adminPageTitle = "Bookings";
    var adminPageUrl = "/vendor/orders";

    Order.find(qryFilter).sort({ "created": -1 }).exec(function(err, orders) {
        Stats.getStats(function(err, stats) {
            if (err) {
                //console.log(error.message);
                res.send(500, "error fetching orders");
            }
            // console.log(orders.created);
            // this.orders.forEach(function (orders) {
            //     console.log(item.created);
            // });
            // console.log(cart.vendor_id);
            res.render('vendor/orders', {
                adminPageTitle: adminPageTitle,
                adminPageUrl: adminPageUrl,
                layout: 'vendor-page.hbs',
                // csrfToken: req.csrfToken(),
                noMessage: !successMsg,
                noErrorMsg: !errorMsg,
                allOrders: allOrders,
                pendingOrders: pendingOrders,
                pickedUpOrders: pickedUpOrders,
                errorMsg: errorMsg,
                user: req.user,
                stats: stats,
                orders: orders,
                isLoggedIn: req.isAuthenticated(),
                successMsg: successMsg

            });
        })

    })
});

router.get('/orderdate:filter?', isAdmin, function(req, res, next) {
    var filter = req.query.filter;


    if (!filter || filter == 'allOrders') {
        var allOrders = true;
        var pendingOrders = false;
        var pickedUpOrders = false;
        //console.log(req.user._id);


        qryFilter = { "cart.vendor_id": req.user._id.toString() };

    } else {
        if (filter == 'pendingOrders') {
            qryFilter = { "cart.vendor_id": req.user._id.toString() }, { receipt_status: 'pending' }, { receipt_status: 'partial' }, { receipt_status: 'New' }, { receipt_status: '' }, { "user.id": req.user._id };
        } else {
            if (filter == 'pickedUpOrders' || filter == 'complete') {
                qryFilter = { receipt_status: 'complete' }, { "user.id": req.user._id }, { "cart.vendor_id": req.user._id.toString() };
            }
        }
    }
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];

    Order.find(qryFilter).sort({ "created": -1 }).exec(function(err, orders) {
        Stats.getStats(function(err, stats) {
            if (err) {
                res.send(500, "error fetching orders");
            }
            res.render('vendor/orders', {
                adminPageTitle: adminPageTitle,
                adminPageUrl: adminPageUrl,
                layout: 'vendor-page.hbs',
                noMessage: !successMsg,
                noErrorMsg: !errorMsg,
                allOrders: allOrders,
                pendingOrders: pendingOrders,
                pickedUpOrders: pickedUpOrders,
                errorMsg: errorMsg,
                user: req.user,
                stats: stats,
                orders: orders,
                isLoggedIn: req.isAuthenticated(),
                successMsg: successMsg
            });
        })
    })
});


router.post('/delete-order', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var order_id = req.body._id;
    meanlogger.log("trash", "Deleting Order " + order_id, req.user);

    Order.remove({ _id: order_id }, function(err) {
        if (err) {
            res.send(500, 'Error deleting order.');
        }
        return res.redirect('/vendor/orders');
    })
})

/* Display all tickets purchased */
router.get('/tickets', isAdmin, function(req, res, next) {

    Ticket.find({}, function(err, tickets) {
        if (err) {
            //console.log("Error: " + err.message);
        }
        res.render('vendor/tickets', {
            layout: 'vendor-page.hbs',
            // csrfToken: req.csrfToken(),
            noMessage: !successMsg,
            noErrorMsg: !errorMsg,
            errorMsg: errorMsg,
            user: req.user,
            isLoggedIn: req.isAuthenticated(),
            successMsg: successMsg
        });
    })

});

/* display logger activities */
router.get('/activities:filter?', isAdmin, function(req, res, next) {
    var filter = req.query.filter;
    //console.log("Filter " + filter);
    if (!filter || filter == 'allOrders') {
        var allOrders = true;
        var pendingOrders = false;
        var pickedUpOrders = false;
        qryFilter = {};
    } else {
        if (filter == 'pendingOrders') {
            var allOrders = false;
            var pendingOrders = true;
            var pickedUpOrders = false;
            qryFilter = { $or: [{ receipt_status: 'pending' }, { receipt_status: 'partial' }, { receipt_status: 'New' }, { receipt_status: '' }] };
        } else {
            if (filter == 'pickedUpOrders' || filter == 'complete') {
                var allOrders = false;
                var pendingOrders = false;
                var pickedUpOrders = true;
                qryFilter = { receipt_status: 'complete' };
            }
        }
    }
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var adminPageTitle = "Activity Log";
    var adminPageUrl = "/vendor/activities";

    Activity.find(qryFilter).sort({ time: 'desc' }).exec(function(err, activities) {
        Stats.getStats(function(err, stats) {
            if (err) {
                //console.log(error.message);
                res.send(500, "error fetching orders");
            }
            res.render('vendor/activities', {
                adminPageTitle: adminPageTitle,
                adminPageUrl: adminPageUrl,
                layout: 'vendor-page.hbs',
                // csrfToken: req.csrfToken(),
                noMessage: !successMsg,
                noErrorMsg: !errorMsg,
                allOrders: allOrders,
                pendingOrders: pendingOrders,
                pickedUpOrders: pickedUpOrders,
                errorMsg: errorMsg,
                user: req.user,
                stats: stats,
                activities: activities,
                isLoggedIn: req.isAuthenticated(),
                successMsg: successMsg
            });
        });
    });
});

router.post('/delete-activity', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var activity_id = req.body._id;
    meanlogger.log("trash", "Deleting Activity " + activity_id, req.user);

    Activity.remove({ _id: activity_id }, function(err) {
        if (err) {
            res.send(500, 'Error deleting activity.');
        }
        return res.redirect('/vendor/activities');
    })
})


/* display logger events */
router.get('/events:filter?', isAdmin, function(req, res, next) {

    var filter = req.query.filter;

    if (!filter || filter == 'allEvents') {
        var allEvents = true;
        var likeEvents = false;
        var viewEvents = false;
        var purchaseEvents = false;
        qryFilter = {};
    } else {
        if (filter == 'likeEvents') {
            var allEvents = false;
            var likeEvents = true;
            var viewEvents = false;
            var purchaseEvents = false;
            qryFilter = { action: 'like' };
        } else {
            if (filter == 'viewEvents') {
                var allEvents = false;
                var likeEvents = false;
                var viewEvents = true;
                var purchaseEvents = false;
                qryFilter = { action: 'view' };
            } else {
                var allEvents = false;
                var likeEvents = false;
                var viewEvents = false;
                var purchaseEvents = true;
                qryFilter = { action: 'purchase' };
            }
        }
    }
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var adminPageTitle = "Event Log";
    var adminPageUrl = "/vendor/events";
    /* main admin stats chart is as follows
    
    data: [
        {x: '2016 Q1', tickets: 3, banquet: 7},
        {x: '2016 Q2', tickets: 3, banquet: 4},
        {x: '2016 Q3', tickets: null, banquet: 1},
        {x: '2015 Q4', tickets: 2, banquet: 5},
        {x: '2015 Q3', tickets: 8, banquet: 2},
        {x: '2015 Q2', tickets: 4, banquet: 4}
      ],
    
      */
    Event.aggregate([
        {
            "$group": {
                "_id": {
                    "year": { "$year": "$when" },
                    "month": { "$month": "$when" }
                },
                "count": { "$sum": 1 }
            }
        },
    ], function(err, yearmos) {
        var data = [];

        if (err) {
            //console.log("error: " + err.message);
        } else {
            var i = 0;
            async.each(yearmos, function(yearmo, next) {
                data.push({
                    x: yearmo._id.year + '-' + yearmo._id.month,
                    purchases: yearmo.count
                })
            })
        }



        Event.find(qryFilter).sort({ when: 'desc' }).exec(function(err, events) {
            Stats.getStats(function(err, stats) {
                if (err) {
                    //console.log(error.message);
                    res.send(500, "error fetching orders");
                }
                res.render('vendor/events', {
                    adminPageTitle: adminPageTitle,
                    adminPageUrl: adminPageUrl,
                    layout: 'vendor-page.hbs',
                    // csrfToken: req.csrfToken(),
                    yearmo: data,
                    noMessage: !successMsg,
                    noErrorMsg: !errorMsg,
                    allEvents: allEvents,
                    likeEvents: likeEvents,
                    viewEvents: viewEvents,
                    purchaseEvents: purchaseEvents,
                    errorMsg: errorMsg,
                    user: req.user,
                    stats: stats,
                    events: events,
                    isLoggedIn: req.isAuthenticated(),
                    successMsg: successMsg
                });
            });
        });
    });
});

router.post('/delete-event', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    meanlogger.log("trash", "Deleting Event " + req.body.id, req.user);
    Event.remove({ _id: req.body.id }, function(err) {
        if (err) {
            res.send(500, 'Error deleting event.');
        }
        return res.redirect('/vendor/events');
    })
})


/* Render file upload for data input */
router.get('/import', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0]
    res.render('vendor/import', {
        layout: 'vendor-page.hbs',
        // csrfToken: req.csrfToken(),
        noMessage: !successMsg,
        noErrorMsg: !errorMsg,
        errorMsg: errorMsg,
        user: req.user,
        isLoggedIn: req.isAuthenticated(),
        successMsg: successMsg
    });
});

/* Recieve posted CSV */
router.post('/import', isAdmin, function(req, res, next) {
    var sampleFile;
    //console.log('File name is ' + req.files.csvFile.name);
    //console.log('File size is ' + req.files.csvFile.size);
    //console.log('File size is ' + req.files.csvFile.path);
    var firstHeaders = req.body.header;
    if (!req.files) {
        if (!req.body.csvPaste) {
            res.send('No files were uploaded and no data pasted.');
            return;
        }
    }
    csvFile = req.files.csvFile;
    tmpFile = uuid.v4() + '.csv'
    csvFile.mv('/var/tmp/' + tmpFile, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            // req.flash('success','File successfully uploaded');
            // res.send('File uploaded!');
            var reader = csv.createCsvFileReader('/var/tmp/' + tmpFile, {
                'separator': ',',
                'quote': '"',
                'escape': '"',
                'comment': '',
                'columnsFromHeader': firstHeaders
            });
            reader.addListener('data', function(data) {
                writer.writeRecord([data[0]]);
            });
            //console.log(data);
        }
    });
});

/* GET home page. */
router.get('/products:filter?', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var adminPageTitle = "Products";
    var adminPageUrl = "/vendor/products";

    var filter = req.query.filter;
    //console.log("Filter " + filter);
    qryFilter = {};
    if (!filter || filter == 'allProducts') {
        var allProducts = true;
        var deletedProducts = false;
        // qryFilter = {status: { $ne: 'deleted'}};
        //console.log("req.user._id " + req.user._id);
        qryFilter = { "vendor_id": req.user._id };
    } else {
        if (filter == 'deletedProducts') {
            var allOrders = false;
            var deletedProducts = true;
            // qryFilter = { status: 'deleted'};
            qryFilter = {};
        }
    }
    Product.find(qryFilter, function(err, products) {
        Category.find({}, function(err, allcats) {

            Stats.getStats(function(err, stats) {
                if (err) {
                    //console.log(error.message);
                    res.send(500, "error fetching products");
                }
                res.render('vendor/products', {
                    adminPageTitle: adminPageTitle,
                    adminPageUrl: adminPageUrl,
                    layout: 'vendor-page.hbs',
                    allProducts: allProducts,
                    deletedProducts: deletedProducts,
                    // csrfToken: req.csrfToken(),
                    noMessage: !successMsg,
                    noErrorMsg: !errorMsg,
                    errorMsg: errorMsg,
                    user: req.user,
                    stats: stats,
                    products: products,
                    allcats: allcats,
                    isLoggedIn: req.isAuthenticated(),
                    successMsg: successMsg
                });
            })
        });
    });
});
router.get('/add-product', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var adminPageTitle = "Add Products";
    var adminPageUrl = "vendor/add-product";
    var filter = req.query.filter;
    //console.log("Filter " + filter);
    qryFilter = {};
    if (!filter || filter == 'allProducts') {
        var allProducts = true;
        var deletedProducts = false;
        // qryFilter = {status: { $ne: 'deleted'}};
        //console.log("req.user._id " + req.user._id);
        qryFilter = { "vendor_id": req.user._id };
    } else {
        if (filter == 'deletedProducts') {
            var allOrders = false;
            var deletedProducts = true;
            // qryFilter = { status: 'deleted'};
            qryFilter = {};
        }
    }
    Product.find(qryFilter, function(err, products) {
        Category.find({}, function(err, allcats) {

            Stats.getStats(function(err, stats) {
                if (err) {
                    //console.log(error.message);
                    res.send(500, "error fetching products");
                }
                res.render('vendor/add-product', {
                    adminPageTitle: adminPageTitle,
                    adminPageUrl: adminPageUrl,
                    layout: 'vendor-page.hbs',
                    allProducts: allProducts,
                    deletedProducts: deletedProducts,
                    // csrfToken: req.csrfToken(),
                    noMessage: !successMsg,
                    noErrorMsg: !errorMsg,
                    errorMsg: errorMsg,
                    user: req.user,
                    stats: stats,
                    products: products,
                    allcats: allcats,
                    isLoggedIn: req.isAuthenticated(),
                    successMsg: successMsg
                });
            })
        });
    });
});

router.get('/propertydetails', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var adminPageTitle = "My Events";
    var adminPageUrl = "/vendor/propertydetails";

    var filter = req.query.filter;
    //console.log("Filter " + filter);

    Product.find(function(err, products) {
        Category.find({}, function(err, allcats) {

            Stats.getStats(function(err, stats) {
                if (err) {
                    //console.log(error.message);
                    res.send(500, "error fetching products");
                }
                res.render('vendor/propertydetails', {
                    adminPageTitle: adminPageTitle,
                    adminPageUrl: adminPageUrl,
                    layout: 'vendor-page.hbs',

                    noMessage: !successMsg,
                    noErrorMsg: !errorMsg,
                    errorMsg: errorMsg,
                    user: req.user,
                    stats: stats,
                    products: products,
                    allcats: allcats,
                    isLoggedIn: req.isAuthenticated(),
                    successMsg: successMsg
                });
            })
        });
    });
});


router.post('/delete-activity', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var activity_id = req.body._id;
    meanlogger.log("trash", "Deleting Activity " + activity_id, req.user);

    Activity.remove({ _id: activity_id }, function(err) {
        if (err) {
            res.send(500, 'Error deleting activity.');
        }
        return res.redirect('/vendor/activities');
    })
})


router.post('/delete-product', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var product_id = req.body._id;
    meanlogger.log("trash", "Deleting Activity " + activity_id, req.user);
    Product.remove({ _id: product_id }, function(err, product) {
        if (err) {
            res.send(500, 'Error deleting order.');
        }
        product.status = 'deleted';
        product.save(function(err) {
            if (!err) {
                //console.log("updated");
            } else {
                //console.log(err);
            }

        });
        return res.redirect('/vendor/products');
    })
})

router.post('/edit-product', isAdmin, function(req, res, next) {
    errorMsg = req.flash('error')[0];
    successMsg = req.flash('success')[0];
    var imageFile;
    var updated = {
        name: req.body.name,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        Product_Group: req.body.Product_Group,
        taxable: req.body.taxable,
        shippable: req.body.shippable
    }
    if (req.files) {
        imageFile = req.files.imageFile;
        imageFile.mv('public/images/' + req.user._id + req.body.code + req.body.name + 'g1' + '.png', function(err) {
            if (err) {
                res.status(500).send(err);
            }
        });
        updated.imagePath = 'public/images/' + req.user._id + req.body.code + req.body.name + 'g1' + '.png'

    }
    Product.findOneAndUpdate({ _id: req.body._id }, { $set: updated }, function(err, product) {
        if (err) {
            //console.log("Unable to update product - " + err.message);
            req.flash('error', "Unable to update product - " + err.message);
            return res.redirect('/vendor/products');
        };
        //console.log("Product " + req.body.name + " Updated");
        req.flash('success', 'Product ' + req.body.name + ' Updated!');
        console.log("product: " + product);
          
            let transporter = nodemailer.createTransport({
				host: 'mail.zo-online.com',
				port: 587,
				secure: false, // true for 465, false for other ports
				auth: {
					user: 'admin@zo-online.com', // generated ethereal user
					pass: 'PI,FX%EsZ$EQ'  // generated ethereal password
				},
				tls: {
					rejectUnauthorized: false
				}
			});
			console.log("mailingtransporter: ");
			// setup email data with unicode symbols
			let mailOptions = {
				from: '"Thrillworld Confirmation" <admin@zo-online.com>', // sender address
				replyTo: '"Thrillworld Confirmation" <admin@zo-online.com>', // sender address
				to: 'sdsameer24@gmail.com', // list of receivers
				subject: 'New Event Added',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					'http://' + req.headers.host + '/admin/edit-product/' + token + '\n\n' +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			console.log("mailingtransporteroptions: "+mailOptions);
			// send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {

					console.log("ERRORsending" + error);
					return //////console.log(error);
				}


				//console.log("INFo" + info);
				//console.log('Message sent: %s', info.messageId);
				console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
				req.flash('success', "SENT MAIL, KINDLY CHECK!");
				// res.render('contact', { msg: 'Email has been sent' });
			});
            // end of order comnfirmation mail sending
            return res.redirect('/vendor/products');
    });
});

router.post('/add-product', isAdmin, function(req, res, next) {
    errorMsg = req.flash('error')[0];
    successMsg = req.flash('success')[0];
    crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');

        var imageFile;
        if (!req.files) {
            res.send('No files were uploaded.');
            return; errorMsg = req.flash('error')[0];
            successMsg = req.flash('success')[0];
        }
        var imageFile, imageFile1, imageFile2, imageFile3;
        if (!req.files) {
            res.send('No files were uploaded.');
            return;
        }
        imageFile = req.files.imageFile;
        imageFile1 = req.files.imageFile1;
        imageFile2 = req.files.imageFile2;
        imageFile3 = req.files.imageFile3;
        imageFile.mv('public/images/' + req.user._id + req.body.code + req.body.name + '.png', function(err) {
            if (err) {
                res.status(500).send(err);
            }
        });
        imageFile1.mv('public/images/' + req.user._id + req.body.code + req.body.name + 'g1' + '.png', function(err) {
            if (err) {
                res.status(500).send(err);
            }
        });
        imageFile2.mv('public/images/' + req.user._id + req.body.code + req.body.name + 'g2' + '.png', function(err) {
            if (err) {
                res.status(500).send(err);
            }
        });
        imageFile3.mv('public/images/' + req.user._id + req.body.code + req.body.name + 'g3' + '.png', function(err) {
            if (err) {
                res.status(500).send(err);
            }
        });
        product = new Product({
            name: req.body.name,
            code: req.body.code,
            Wifi: req.body.Wifi,
            adminapproval: "false",
            campfire: req.body.campfire,
            Pool: req.body.Pool,
            parking: req.body.parking,
            title: req.body.title,
            Token: token,
            Product_Group: req.body.Product_Group,
            price: req.body.price,
            description: req.body.description,
            shippable: req.body.shippable,
            taxable: req.body.taxable,
            category: req.body.category,
            Longitude: req.body.Longitude,
            Latitude: req.body.Latitude,
            imagePath: '/images/' + req.user._id + req.body.code + req.body.name + '.png',
            imagePathg1: '/images/' + req.user._id + req.body.code + req.body.name + 'g1' + '.png',
            imagePathg2: '/images/' + req.user._id + req.body.code + req.body.name + 'g2' + '.png',
            imagePathg3: '/images/' + req.user._id + req.body.code + req.body.name + 'g3' + '.png',
            vendor_id: req.user._id
        });

        product.save(function(err) {
            if (err) {
                req.flash('error', 'Error: ' + err.message);
                return res.redirect('/vendor/products');
            }
            console.log("product: " + product);
          
            let transporter = nodemailer.createTransport({
				host: 'mail.zo-online.com',
				port: 587,
				secure: false, // true for 465, false for other ports
				auth: {
					user: 'admin@zo-online.com', // generated ethereal user
					pass: 'PI,FX%EsZ$EQ'  // generated ethereal password
				},
				tls: {
					rejectUnauthorized: false
				}
			});
			console.log("mailingtransporter: ");
			// setup email data with unicode symbols
			let mailOptions = {
				from: '"Thrillworld Confirmation" <admin@zo-online.com>', // sender address
				replyTo: '"Thrillworld Confirmation" <admin@zo-online.com>', // sender address
				to: 'sdsameer24@gmail.com', // list of receivers
				subject: 'New Event Added',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					'http://' + req.headers.host + '/admin/edit-product/' + token + '\n\n' +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			console.log("mailingtransporteroptions: "+mailOptions);
			// send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {

					console.log("ERRORsending" + error);
					return //////console.log(error);
				}


				//console.log("INFo" + info);
				//console.log('Message sent: %s', info.messageId);
				console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
				req.flash('success', "SENT MAIL, KINDLY CHECK!");
				// res.render('contact', { msg: 'Email has been sent' });
			});
            // end of order comnfirmation mail sending
            return res.redirect('/vendor/products');
        });
    });
});
router.post('/add-category', isAdmin, function(req, res, next) {
    //console.log(req.files);
    errorMsg = req.flash('error')[0];
    successMsg = req.flash('success')[0];
    var imageFile;

    category = new Category({
        description: req.body.description,
        name: req.body.name,
        slug: req.body.slug,
        layout: req.body.layout
    })
    category.save(function(err) {
        if (err) {
            req.flash('error', 'Error: ' + err.message);
            return res.redirect('/vendor/categories');
        }
        return res.redirect('/vendor/categories');
    });
});
router.get('/availability', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var adminPageTitle = "Availability";
    var adminPageUrl = "/vendor/availability";
    var filter = req.query.filter;
    meanlogger.log("check", "Viewed orders", req.user);

    if (!filter || filter == 'allOrders') {
        var allOrders = true;
        var pendingOrders = false;
        var pickedUpOrders = false;
        //console.log(req.user._id);


        qryFilter = { "cart.vendor_id": req.user._id.toString() };

    } else {
        if (filter == 'pendingOrders') {
            //console.log("pending");
            var allOrders = false;
            var pendingOrders = true;
            var pickedUpOrders = false;
            qryFilter = { "cart.vendor_id": req.user._id.toString() }, { receipt_status: 'pending' }, { receipt_status: 'partial' }, { receipt_status: 'New' }, { receipt_status: '' }, { "user.id": req.user._id };
        } else {
            if (filter == 'pickedUpOrders' || filter == 'complete') {
                //console.log("picked");
                var allOrders = false;
                var pendingOrders = false;
                var pickedUpOrders = true;
                qryFilter = { receipt_status: 'complete' }, { "user.id": req.user._id }, { "cart.vendor_id": req.user._id.toString() };
            }
        }
    }
    Order.find(qryFilter).sort({ "created": -1 }).exec(function(err, orders) {
        Stats.getStats(function(err, stats) {
            if (err) {
                //console.log(error.message);
                res.send(500, "error fetching orders");
            }
            res.render('vendor/availability', {
                adminPageTitle: adminPageTitle,
                adminPageUrl: adminPageUrl,
                layout: 'vendor-page.hbs',
                orders: orders,
                allOrders: allOrders,
                pendingOrders: pendingOrders,
                pickedUpOrders: pickedUpOrders,
            });
        });
    });
});
router.get('/categories:filter?', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var adminPageTitle = "Categories";
    var adminPageUrl = "/vendor/categories";

    var filter = req.query.filter;
    qryFilter = {};
    if (!filter || filter == 'allCategories') {
        var allCategories = true;
        var deletedCategories = false;
        qryFilter = {};
    } else {
        if (filter == 'deletedCategories') {
            var allCategories = false;
            var deletedCategories = true;
            qryFilter = { status: 'deleted' };
        }
    }
    Category.find(qryFilter, function(err, categories) {
        Stats.getStats(function(err, stats) {
            if (err) {
                //console.log(error.message);
                res.send(500, "error fetching categories");
            }
            res.render('vendor/categories', {
                adminPageTitle: adminPageTitle,
                adminPageUrl: adminPageUrl,
                layout: 'vendor-page.hbs',
                allCategories: allCategories,
                deletedCategories: deletedCategories,
                // csrfToken: req.csrfToken(),
                noMessage: !successMsg,
                noErrorMsg: !errorMsg,
                errorMsg: errorMsg,
                user: req.user,
                stats: stats,
                categories: categories,
                isLoggedIn: req.isAuthenticated(),
                successMsg: successMsg
            });
        });
    });
});

router.post('/edit-category', isAdmin, function(req, res, next) {
    errorMsg = req.flash('error')[0];
    successMsg = req.flash('success')[0];
    category = {};
    Category.findById(req.body.id, function(err, category) {

        if (err) {
            //console.log("ERROR: " + err.message);
        } else {
            if (!category) {
                category = new Category({
                    description: req.body.description,
                    name: req.body.name,
                    slug: req.body.slug,
                    layout: req.body.layout
                });
            } else {
                category.description = req.body.description || '';
                category.name = req.body.name || '';
                category.slug = req.body.slug || '';
                category.layout = req.body.layout || '';
                category.updated = Date.now();
            }
        }
        //console.log("Found: " + JSON.stringify(category));

        category.save(function(err) {
            if (!err) {
                //console.log("updated");
            } else {
                //console.log(err);
            }
            res.redirect('/vendor/categories');
        })
    });

});

router.post('/delete-category', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];

    Category.findOne({ _id: req.body.id }, function(err, category) {
        if (err) {
            res.send(500, 'Error deleting category.');
        }
        category.status = 'deleted';
        category.save(function(err) {
            if (!err) {
                //console.log("updated");
                req.flash('success', 'Category deleted.');

            } else {
                //console.log(err);
                req.flash('error', 'Unable to delete category');
            }
            return res.redirect('/vendor/categories');
        });
    })
})

router.get('/configuration', isAdmin, function(req, res, next) {
    errorMsg = req.flash('error')[0];
    successMsg = req.flash('success')[0];
    var adminPageTitle = "Configuration";
    var adminPageUrl = "/vendor/configuration";
    Configuration.findOne({}, function(err, config) {
        if (err) {
            req.flash('error', 'Error: ' + err.message);
            return res.redirect('/vendor');
        }
        res.render('vendor/configuration', {
            config: config,
            adminPageTitle: adminPageTitle,
            adminPageUrl: adminPageUrl,
            layout: 'vendor-page.hbs',
            errorMsg: errorMsg,
            successMsg: successMsg,
            noErrorMsg: !errorMsg,
            noMessage: !successMsg
        })
    });
})
router.get('/setup', isAdmin, function(req, res, next) {
    errorMsg = req.flash('error')[0];
    successMsg = req.flash('success')[0];
    res.render('vendor/setup', {
        config: Config
    })
})

/* display logger activities */
router.get('/dashboard', isAdmin, function(req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
    var adminPageTitle = "Dashboard";
    var adminPageUrl = "/vendor/dashboard";
    Stats.getStats(function(err, stats) {
        if (err) {
            //console.log(error.message);
            res.send(500, "error fetching orders");
        }
        res.render('vendor/dashboard', {
            adminPageTitle: adminPageTitle,
            adminPageUrl: adminPageUrl,
            layout: 'vendor-page.hbs',
            // csrfToken: req.csrfToken(),
            noMessage: !successMsg,
            noErrorMsg: !errorMsg,
            errorMsg: errorMsg,
            user: req.user,
            stats: stats,
            isLoggedIn: req.isAuthenticated(),
            successMsg: successMsg
        });
    });
});

module.exports = router;
function isAdmin(req, res, next) {
    if (!req.isAuthenticated() || !req.user) {
        return res.redirect('/');
    } else {
        if (req.user.role == 'vendor') {
            ////console.log(req.user._id)
            return next();
        } else {
            return res.redirect('/');
        }
    }
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

var totalSales = function() {
    Order.aggregate({
        $match: {
            "status": "approved"
        }
    }, {
            $group: {
                _id: null,
                'Total': {
                    $sum: 'cart.total'
                }
            }
        }, function(err, doc) {
            if (err) {
                //console.log("err: " + err.message);
                return err;
            }
            return doc;

        });
}
