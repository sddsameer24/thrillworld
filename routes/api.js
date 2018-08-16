var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Category = require('../models/category');
var Product = require('../models/product');
var Event = require('../models/events');
var async = require('async');
var Order = require('../models/order');
var User = require('../models/user');
var Store = require('../models/store');
var Payment = require('../models/payment');
var Ticket = require('../models/ticket');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient
var taxConfig = require('../config/tax-config.js');
var Config = require('../config/config.js');
var taxCalc = require('../local_modules/tax-calculator');
var meanlogger = require('../local_modules/meanlogger');


router.get('/buckauto', function(req, res, next) {
	var options = { server: { socketOptions: { keepAlive: 1 } } };
	// var url = 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASS + '@localhost:27017/hackathon';
	var url = 'mongodb://localhost:27017/hackathon';
	MongoClient.connect(url, (err, db) => {
		Product.aggregate([{
			"$bucketAuto": {
				"$groupBy": "$price",
				"buckets": 4
			}
		}],function(err,product) {
			if (err) {
				console.log("Error: " + err.message);
				res.send(1000, "Problem fetching products");
			}
			res.json(product);
		})
	});
});

/**
 * Present statistics for various database objects
 * @constructor
 */
router.get('/graph/:userId', function(req, res, next) {
	var url = 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASS + '@localhost:27017/hackathon';
	var url = 'mongodb://localhost:27017/hackathon';
	console.log("URL: " + url)
	MongoClient.connect(url, (err, db) => {
		products = db.collection('products');
		
		products.aggregate([
			{$match: {_id: '58a4aa9c6a6fd84826e79cdd'}},
			{$lookup: {
				from: 'users',
				localField: 'usersBought',
				foreignField: '_id',
				as: 'user_who_purchased'
			}},
			{$unwind: '$user_who_purchased'},
			{$lookup: {
				from: 'products',
				localField: 'user_who_purchased.purchased',
				foreignField: '_id', as: 'related_item'
			}},
			{$unwind: "$related_item"},
			{$group: {_id: "$related_item"}}
		],function(err, results) {
			console.dir(results);
			res.json(results);
			db.close();
		});

		// products.aggregate([
		// 	{$match: {_id: '58a4aa9c6a6fd84826e79cdd'}},
		// 	{$lookup: {
		// 		from: 'users',
		// 		localField: 'usersBought',
		// 		foreignField: '_id',
		// 		as: 'user_who_purchased'
		// 	}},
		// 	{$unwind: '$user_who_purchased'},
		// 	{$lookup: {
		// 		from: 'products',
		// 		localField: 'user_who_purchased.purchased',
		// 		foreignField: '_id', as: 'related_item'
		// 	}},
		// 	{$unwind: "$related_item"},
		// 	{$group: {_id: "$related_item"}}
		// ],function(err, results) {
		// 	console.dir(results);
		// 	res.json(results);
		// 	db.close();
		// });
	});
})
/**
 * Present statistics for various database objects
 * @constructor
 */
/* GET user */
router.get('/stores', function(req, res, next) {
	Store.find({},function(err,stores) {
		res.json(stores);
	})
});
/**
 * Present statistics for various database objects
 * @constructor
 */
router.get('/stats', function(req, res, next) {
	var url = 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASS + '@localhost:27017/hackathon';
	MongoClient.connect(url, (err, db) => {
		db.stats((err, stats) => {

			console.dir(stats);
			res.json(stats);
			db.close();
		});
	});
})

/**
 * GET all categories
 * @constructor
 */
router.get('/categories', function(req, res, next) {
	Category.find({},function(err,categories) {
		res.json(categories);
	})
});

/**
 * Get a single category
 * @constructor
 */
router.get('/categories/:id', function(req, res, next) {
	Category.findById(req.params.id,function(err,category) {
		res.json(category);
	})
});

/**
 * POST add new category
 * @constructor
 */
 router.post('/categories', function(req, res, next) {
	category = new Category({
		name: req.params.name,
		slug: slug(req.params.name),
		description: req.params.description
	});
	categrory.save(function(err,category) {
		if (err) {
			res.send(1000,'Problem saving category.');
		}
		res.send(category);
	})
})

/**
 * DELETE a single category
 *
 */
router.delete('/categories/:id', function(req, res, next) {
	Category.remove({_id: req.params.id},function(err,category) {
		res.json(category);
	})
});


/**
 * GET facets for category
 * @constructor
 */
router.get('/facet/:category', function(req, res, next) {

// db.products.aggregate([{
//     $match: {
//         "Product_Group": "Television"
//     }
// }, {
//     $unwind: "$Attributes"
// }, {
//     $match: {
//         "Attributes.Name": "Price"
//     }
// },{
//     $bucket: {
//         groupBy: "$Attributes.Value",
//         boundaries: [0, 200, 300, 500, Infinity],
//         output: {
//             count: {
//                 $sum: 1
//             },
//             matches: {
//                 $push: "$Attribute.Value"
//             }
//         }
//     }
// }])






// 	db.products.aggregate([{
//         $match: {
//             $text: {
//                 $search: "sony"
//             },
//             category: 'Television'}
//         },
//         {
//             $unwind: "$Attributes"
//         },
//         {
//             $match: {
//                 "Attributes.Name": "Screen Size"
//             }
//         },
//         {
//             $sortByCount: "$Attributes.Value"
//         },
//         {
//             $limit: 5
//         },
//         { $project: {
//         	'Attribute.Name': 1,
//         	'Attribute.Value': 1
//         }}
//     ])

})


/**
 * GET all categories
 * @constructor
 */
 router.get('/products', function(req, res, next) {
	Product.find({},function(err,products) {
		res.json(products);
	})
});

/**
 * GET product.
 * @constructor
 */
router.get('/product/:id', function(req, res, next) {
	Product.findById(req.params.id,function(err,product) {
		res.json(product);
	})
});

/* GET product. */
router.get('/products/:id', function(req, res, next) {
	Product.findById(req.params.id,function(err,product) {
		res.json(product);
	})
});

/**
 * POST - Create a product
 * @constructor
 */
router.post('/api/products', function (req, res){
  var product;
  console.log(res);
  product = new Product({
    code: req.body.code,
    description: req.body.description,
    shipable: req.body.shipable,
    taxable: req.body.taxable,
    title: req.body.title,
    price: req.body.price,
    productType: req.body.productType,
    name: req.body.name,
    category: req.body.category
  });
  product.save(function (err) {
    if (!err) {
      return console.log("created");
    } else {
      return console.log(err);
    }
  });
  return res.send(product);
});

/* DELETE product. */
router.delete('/products/:id', function(req, res, next) {
	Product.remove({_id: req.params.id},function(err,product) {
		console.log("Deleting Product " + req.params.id);
		res.json(product);
	})
});

/* GET users. */
router.get('/users', function(req, res, next) {
	User.find({},function(err,users) {
		res.json(users);
	})
});

/* GET user */
router.get('/users/:id', function(req, res, next) {
	User.findById({},function(err,user) {
		res.json(user);
	})
});

router.get('/users/:id', function(req, res, next) {
	User.findById({},function(err,user) {
		res.json(user);
	})
});

/* UPDATE user */
router.put('/users/:id', function(req, res, next) {
	User.findById({},function(err,user) {
		res.json(user);
	})
});

/* DELETE user */
router.delete('/users/:id', function(req, res, next) {
	User.remove({_id: req.params.id},function(err,user) {
		res.json(user);
	})
});

/* get product facets */
router.get('/facets/:id', function(req, res, next) {
	Product.findById(req.params.id, function(req, res, next) {
		res.json
	})
});

/* calculate tax for a product purchase by a user */
router.get('/taxcalc/:id/:user', function(req, res, next) {
	productId = req.params.id;
	userId = req.params.user;
	taxjson = taxCalc.calculateTax(productId,userId,function(err,response) {
		res.json(response);
	});

});
/* GET tax for product based on user location and product taxable flag. */
router.get('/tax/:id/:user', function(req, res, next) {
	var productId = req.params.id;
	Product.findById(productId,function(err,product) {
		if (err) {
			res.send(1000,'Problem retrieving product.');
		}
		if (product.taxable == 'Yes' || product.taxable == true) {
			User.findById(req.params.user, function(err,user) {
				if (err) {
					return res.send(1000, 'Problem retrieiving user by id.');
				}
				if (!user.state || !user.city) {
					res.json({
						error: 'User does not have address.'
					})
				}
				if (user.state == taxConfig.ourStateCode || user.state == taxConfig.ourStateName) {
					taxRate = taxConfig.ourStateTaxRate;
					if (user.city.toLowerCase() == taxConfig.ourCityName.toLowerCase()) {
						taxRate = taxConfig.ourCityTaxRate;
					}
				} else {
					taxRate = 0;
				}
				var price = Number(product.price).toFixed(2);
				taxAmount = Math.round((price * taxRate) * 100) / 100;
				priceWithTax = (parseFloat(price) + parseFloat(taxAmount));
				res.json({
					productId: productId,
					taxable: product.taxable,
					price: parseFloat(price),
					taxRate: taxRate,
					taxAmount: taxAmount,
					priceWithTax: priceWithTax
				})
			})

		}
	})
});

router.get('/search', function(req, res, next) {
	var connectionstring = 'mongodb://' + Config.dbhost + ':' + Config.dbport + '/' + dbname;

	MongoClient.connect(connectionstring, function (err, db) {
	  if (err) throw err

	  db.collection('products').find().toArray(function (err, result) {
	    if (err) throw err
	  });
	});
});

/* get all categories */
router.get('/orders', function(req, res, next) {
	Order.find({},function(err,orders) {
		res.json(orders);
	})
});

/* Get a single category */
router.get('/order/:id', function(req, res, next) {
	Category.findById(req.params.id,function(err,category) {
		res.json(order);
	})
});

/* New order */
router.post('/order', function(req, res, next) {
	
	order = new Order({
		user: req.params.userId,
		cart: req.params.cart,
		address: req.params.address,
		city: req.params.city,
		state: req.params.state,
		zipcode: req.params.zipcode,
		telephone: req.params.phone,
		owner: {
			ticket_name: req.params.ticket_name,
			ticket_email: req.params.ticket_email
		},
		status: req.params.status
	});
	console.log(order);
	order.save(function(err,order) {
		if (err) {
			res.send(1000,'Problem saving order.');
		}
		res.send(category);
	})
});
router.get('/donut-chart', function(req, res, next) {
	Event.aggregate([
	// {
	// 	"$match": {
	// 		'action': 'purchase'
	// 	}
	// },
	{
		"$group": { 
			"_id": "$thing.category", "value": { "$sum": 1 } 
		}
	},{
		"$project": { "_id": -1, "value": 1}
	}], function(err,donuts) {
		var data = [];
		async.each(donuts, function(donut, next) {
			data.push({
				label: donut._id,
				value: donut.value
			})
		})
		res.json(data);
	});
})
router.get('/purchases-by-yearmo', function(req,res,next) {
	Event.aggregate([{
		"$match": {
			'action': 'purchase'
		}
	},
    { "$group": {
        "_id": {
            "year": {"$year": "$when" },
            "month": {"$month": "$when" }
            },
          "count": { "$sum": 1 }
        }
    },
  ], function(err,yearmos){
	    var data = [];

	    if (err) {
	        console.log("error: " + err.message);
	    } else {
	        var i = 0;
	        async.each(yearmos,function(yearmo,next) {
	            data.push({
	                x: yearmo._id.year + '-' + yearmo._id.month,
	                purchases: yearmo.count
	            })
	        })
	    }
		console.log(JSON.stringify(data));
    res.json(data);
    });
});
module.exports = router;
