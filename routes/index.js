var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var nodemailer = require('nodemailer');
var Category = require('../models/category');
var Product = require('../models/product');
var Event = require('../models/events');
var Purchase = require('../models/purchase');
var Order = require('../models/order');
var User = require('../models/user');
var Payment = require('../models/payment');
var Ticket = require('../models/ticket');
var passport = require('passport');
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validator = require('express-validator');
var util = require('util');
var Distance = require('geo-distance');
var NodeGeocoder = require('node-geocoder');
// var smtpConfig = require('../config/smtp-config.js');
var taxCalc = require('../local_modules/tax-calculator');
var shippingCalc = require('../local_modules/shipping-calculator');
var taxConfig = require('../config/tax-config.js');
var recommendations = require('../local_modules/recommendations');
var Config = require('../config/config.js');
const dotenv = require('dotenv');
const async = require('async');
const chalk = require('chalk');
const Nexmo = require('nexmo');
const socketio = require('socket.io');
var meanlogger = require('../local_modules/meanlogger');
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/hackathon';
// Use connect method to connect to the Server

// Instamojo Setup
var Insta = require('instamojo-nodejs');
Insta.setKeys("test_a3c5ddaf80ebda935933f83e311", "test_6d44edf82ee5b6627d0e938218d");
Insta.isSandboxMode(true);

var options = {
	provider: 'google',
   
	// Optional depending on the providers
	httpAdapter: 'https', // Default
	apiKey: 'AIzaSyAidN5MszkfMW2VYcES7uoePsX1qQmuG7M', // for Mapquest, OpenCage, Google Premier
	formatter: null         // 'gpx', 'string', ...
  };
   
  var geocoder = NodeGeocoder(options);
// dotenv.load({
// 	path: '.env.hackathon'
// });
// distance.apiKey = 'AIzaSyAidN5MszkfMW2VYcES7uoePsX1qQmuG7M';
var title = process.env.title;

var fs = require('fs');

"use strict";

var useFacets = (process.env.facets === true);
var viewTour = (process.env.viewTour === true);
useFacets = true;
var frontPageCategory = process.env.frontPageCategory;
if (frontPageCategory) {
	if (!catExists(frontPageCategory)) {
		frontPageCategory = false;
	}
}
var viewDocuments = process.env.viewDocuments;

if (useFacets == true) {
	shopPage = 'shop/facet';
	shopLayout = 'facet.hbs';
} else {
	shopPage = 'shop/shop';
	shopLayout = 'layout.hbs';
}
var paypal = require('paypal-rest-sdk');
require('../config/pp-config.js');
var config = {};



/* PayPal Info Page */
router.get('/whypaypal', function (req, res, next) {
	res.render('shop/whypaypal');
});
/* host main Info Page */
router.get('/listing', function (req, res, next) {
	res.render('shop/listing'),{
		layout: 'eshop/blank'
	}
	
});
router.get('/signup', function (req, res, next) {
	var messages = req.flash('error');
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	res.render('user/signup', {
		layout: 'eshop/blank',
		//csrfToken: req.csrfToken(),
		"successMsg": successMsg,
		"noMessage": !successMsg,
		"message": messages,
		"errorMsg": messages[0],
		"noErrorMsg": !messages,
	});
});

router.get('/shop', function (req, res, next) {
	
		Product.find(function (err, products) {
            productChunks = [];
            chunkSize = 5;
            for (var i = (5 - chunkSize); i < products.length; i += chunkSize) {
                productChunks.push(products.slice(i, i + chunkSize))
            }
           
            res.render('shop/shop', {
                layout: 'eshop/blank',
                products: productChunks,
			});
			// console.log(products);
			// window.onload = function getLocation() {
			// 	var Latitude=position.coords.latitude; 
			// 	var Longitude=position.coords.longitude; 
			// 	console.log(Longitude);
			// };
			// function getLocation() {
			// 	if (navigator.geolocation) {
			// 		navigator.geolocation.getCurrentPosition(showPosition);
			// 	} else { 
			// 		x.innerHTML = "Geolocation is not supported by this browser.";
			// 	}
			// }
			// function showPosition(){
			// 	navigator.geolocation.getCurrentPosition(function(position){
			// 		return Latitude=position.coords.latitude;
			// 		return Longitude=position.coords.longitude;
				 
			// 	});
			// }

			// var Latitude=getLocation().Latitude;
			// var Longitude=getLocation().Longitude;

			// console.log(Longitude);

			for (var i = 0; i < products.length; i ++) {
				 console.log(products[i].Latitude);
				 var dest = {
					lat: products[i].Latitude,
					lon: products[i].Longitude
				  };
				  var userloc = {
					lat: 12,
					lon: 13
				  };
				  var destTouserloc = Distance.between(dest, userloc);
				  
				  console.log('' + destTouserloc.human_readable());
				  
				// distance.get(
				// 	{
				// 	  index: 1,
				// 	  origin: '12.9245184,77.6347648',
				// 	  destination: '37.871601,-122.269104'
				// 	},
				// 	function(err, data) {
				// 	  if (err) return console.log(err);
				// 	  console.log(data);
				// 	});
			
			}
			
			// res.products.forEach(function(products) {
			// 	console.log(products.latitude);
			//   });
			
		
        });
	});

// Get Shop Mobile
router.get('/shop-mobile', function (req, res, next) {
   
	Product.find(function (err, products) {
		productChunks = [];
		chunkSize = 5;
		for (var i = (5 - chunkSize); i < products.length; i += chunkSize) {
			productChunks.push(products.slice(i, i + chunkSize))
		}
	   
		res.send(products);
	});
});


/* GET home page. */
router.get('/', function (req, res, next) {
	var orderid = req.param('orderid');
	var payment_id = req.param('payment_id');
	var payment_request_id = req.param('payment_request_id');

	console.log(orderid + "    " +payment_id+ "    "+payment_request_id);

	if(payment_id && payment_request_id){
		console.log("TRUE PAYMENT NEED TO GET DATA");

		Insta.getPaymentDetails(payment_request_id, payment_id, function(error, response) {
			if (error) {
			  // Some error
			} else {
			  console.log(response);
			 // response = JSON.parse(response);
			  console.log(response.payment_request.status);

			  if(response.payment_request.status=="Completed"){
				console.log("STORE SUCESS");
				Order.update({_id:orderid}, 
					{ "status": "Paid", "paymentId": payment_id}, function (e) {
						if (e) {
							error(e);
							return;
						}
				
					});
			  }
			}
		  });


	
	}else if(req.session.group) {
		////console.log(req);
		return res.redirect('/group/SIMPLE?q=');
	}
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	var tutorial = req.params.tutorial;
	if (tutorial == 1) {
		req.session.tutorial = true;
	} else {
		req.session.tutorial = false;
	}
	var categoryrecord = {
		"_id": "ObjectId('58485813edf44d95fb117223')",
		"name": "Television",
		"slug": "Television",
		"attributes": [],
		"ancestors": [],
		"__v": 0
	};
	Product.aggregate(
		[{
			$group: {
				_id: "$Product_Group",
				count: {
					$sum: 1
				}
			}
		}, {
			$sort: {
				order: 1
			}
		}],
		function (err, Product_Group) {
			if (frontPageCategory) {
				categCondition = {
					"$match": {
						"$and": [{
							"status": {
								$ne: 'deleted'
							}
						},
						{
							"category": frontPageCategory
						},
						{
							$or: [{
								"inventory.onHand": {
									$gt: 0
								}
							}, {
								"inventory.disableOnZero": false
							}]
						}
						]
					}
				}
			} else {
				// categCondition = { $sample: { size: 40 } };
				categCondition = {
					"$match": {
						"$and": [{
							"status": {
								"$ne": 'deleted'
							}
						}, {
							$or: [{
								"inventory.onHand": {
									"$gt": 0
								}
							}, {
								"inventory.disableOnZero": false
							}]
						}]
					}
				}
			}
			// Product.find(categCondition, function(err, docs) {

			// Product.aggregate([
			// 	categCondition,
			// 	{
			// 		"$sample": {
			// 			size: 40
			// 		}
			// 	}
			// ]
			
			Product.find({
				"$and": [{
					"status": {
						"$ne": 'deleted'
					}
				}, {
					$or: [{
						"inventory.onHand": {
							"$gt": 0
						}
					}, {
						"inventory.disableOnZero": false
					}]
				}]
			}

				, function (err, docs) {
					if (err) {
						products = {}
					}

					productChunks = [];
					productJSON = [];
					chunkSize = 1;
					for (var i = (4 - chunkSize); i < docs.length; i += chunkSize) {
						productChunks.push(docs.slice(i, i + chunkSize));
					}
					
					res.render('shop/eshop', {
						layout: 'eshop/eshop',
						title: title,
						navcats: req.app.get('navcats'),
						navgroups: req.app.get('navgroups'),
						salegroups: req.app.get('salegroups'),
						categoryrecord: JSON.stringify(categoryrecord),
						showRecommendations: eval(res.locals.showRecommendations),
						allcategories: res.locals.allcategories,
						keywords: Config.keywords,
						products: productChunks,
						recommended: docs,
						Product_Group: Product_Group,
						user: req.user,
						errorMsg: errorMsg,
						noErrorMsg: !errorMsg,
						successMsg: successMsg,
						viewDocuments: viewDocuments,
						tutorial: tutorial,
						noMessage: !successMsg,
						viewTour: viewTour,
						isLoggedIn: req.isAuthenticated()

					});
				});
		});
});

/* Get sale items */
router.get('/sale', function (req, res, next) {

	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	var navcats = req.app.get('navcats');
	var navgroups = req.app.get('navgroups');

	// ////console.log("Local navcats " + res.locals.navcats);

	var tutorial = req.params.tutorial;
	if (tutorial == 1) {
		req.session.tutorial = true;
	} else {
		req.session.tutorial = false;
	}
	Product.aggregate(
		[{
			$match: {
				"$sale_attributes.sale": true
			}
		}, {
			$group: {
				_id: "$Product_Group",
				count: {
					$sum: 1
				}
			}
		}, {
			$sort: {
				_id: 1
			}
		}],
		function (err, Product_Group) {
			if (frontPageCategory) {
				categCondition = {
					category: frontPageCategory
				};
			} else {
				categCondition = {};
			}
			Product.Product.find(categCondition, function (err, docs) {
				productChunks = [];
				productJSON = [];
				chunkSize = 4;
				for (var i = (4 - chunkSize); i < docs.length; i += chunkSize) {
					productChunks.push(docs.slice(i, i + chunkSize));
				}
				res.render('shop/eshop', {
					layout: 'eshop/eshop',
					title: title,
					navcats: req.app.get('navcats'),
					navgroups: req.app.get('navgroups'),
					salegroups: req.app.get('salegroups'),
					showRecommendations: eval(res.locals.showRecommendations),
					keywords: Config.keywords,
					products: productChunks,
					recommended: docs,
					Product_Group: Product_Group,
					user: req.user,
					navcats: navcats,
					errorMsg: errorMsg,
					noErrorMsg: !errorMsg,
					successMsg: successMsg,
					viewDocuments: viewDocuments,
					tutorial: tutorial,
					noMessage: !successMsg,
					viewTour: viewTour,
					isLoggedIn: req.isAuthenticated()
				});
			});
		});
});


/* Mobile Get sale items */
router.get('/sale-mobile', function (req, res, next) {

	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	var navcats = req.app.get('navcats');
	var navgroups = req.app.get('navgroups');

	// ////console.log("Local navcats " + res.locals.navcats);

	var tutorial = req.params.tutorial;
	if (tutorial == 1) {
		req.session.tutorial = true;
	} else {
		req.session.tutorial = false;
	}
	Product.aggregate(
		[{
			$match: {
				"$sale_attributes.sale": true
			}
		}, {
			$group: {
				_id: "$Product_Group",
				count: {
					$sum: 1
				}
			}
		}, {
			$sort: {
				_id: 1
			}
		}],
		function (err, Product_Group) {
			if(err){
				res.send({
					message:  "Error",
					status: false
				});

			}else{

				if (frontPageCategory) {
					categCondition = {
						category: frontPageCategory
					};
				} else {
					categCondition = {};
				}
				Product.Product.find(categCondition, function (err, docs) {
	
					if(err){
						res.send({
							message:  "Error",
							status: false
						});
	
					}else{
						productChunks = [];
						productJSON = [];
						chunkSize = 4;
						for (var i = (4 - chunkSize); i < docs.length; i += chunkSize) {
							productChunks.push(docs.slice(i, i + chunkSize));
						}
						res.send(productChunks);
					}
					
				});

			}
			
		});
});


/* GET home page. */
router.get('/group/:slug?', function (req, res, next) {
	var group_slug = req.params.slug;
	req.session.group = req.params.slug; // Save Group for later
	var q = req.query.q;
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	if (group_slug == '' || !group_slug) {
		var group_search = {}
	} else {
		var group_search = {
			Product_Group: group_slug
		}
	}
	Product.find(
		group_search,
		function (err, products) {
			if (err) {
				////console.log("Error finding group " + group_slug);
				req.flash('error', 'Cannot find group');
				res.send({
					message:  "Error",
					status: false
				});

			}
			if (!products) {
				////console.log("Error finding group " + group_slug);
				req.flash('error', 'Cannot find group');
				res.send({
					message:  "Error",
					status: false
				});

			}
			productChunks = [];
			chunkSize = 4;
			for (var i = (4 - chunkSize); i < products.length; i += chunkSize) {
				productChunks.push(products.slice(i, i + chunkSize))
			};
			products = productChunks;
			res.send(products);
		});
});


/* Mobile GET home page. */
router.get('/group/:slug?', function (req, res, next) {
	var group_slug = req.params.slug;
	req.session.group = req.params.slug; // Save Group for later
	var q = req.query.q;
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	if (group_slug == '' || !group_slug) {
		var group_search = {}
	} else {
		var group_search = {
			Product_Group: group_slug
		}
	}
	Product.find(
		group_search,
		function (err, products) {
			if (err) {
				////console.log("Error finding group " + group_slug);
				req.flash('error', 'Cannot find group');
				return res.redirect('/');
			}
			if (!products) {
				////console.log("Error finding group " + group_slug);
				req.flash('error', 'Cannot find group');
				return res.redirect('/');
			}
			productChunks = [];
			chunkSize = 4;
			for (var i = (4 - chunkSize); i < products.length; i += chunkSize) {
				productChunks.push(products.slice(i, i + chunkSize))
			};
			products = productChunks;
			res.render('shop/eshop', {
				layout: 'eshop/eshop',
				navcats: req.app.get('navcats'),
				navgroups: req.app.get('navgroups'),
				group: group_slug,
				viewDocuments: viewDocuments,
				products: productChunks,
				productChunks: productChunks,
				user: req.user,
				q: q,
				errorMsg: errorMsg,
				noErrorMsg: !errorMsg,
				successMsg: successMsg,
				noMessage: !successMsg,
				isLoggedIn: req.isAuthenticated()
			});
		});
});

/* GET home page. */
router.get('/category/', function (req, res, next) {
	var category_slug = req.params.slug;
	req.session.category = req.params.slug;
	var q = req.query.q;
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	var url = 'mongodb://localhost:27017/hackathon';
	navcats = {};
	navgroups = {};
	if (req.params.q) {
		search = {
			$match: {
				$and: [{
					$text: {
						$search: q
					}
				}
					// { category: new RegEx(category_slug, 'i')}
				]
			}
		}
	} else {
		search = {
			$match: {
				// category: new RegExp(category_slug, 'i')
			}
		}
	}
	MongoClient.connect(url, function (err, db) {
		var collection = db.collection('products');
		collection.aggregate([{
			"$match": { category: "Television" }
		},
		{ "$unwind": "$Attributes" },
		{
			"$facet": {
				price: [
					{
						$bucket: {
							groupBy: {
								"$divide": ["$price", 100]
							},
							boundaries: [0, 200, 400, 500, 600, 700, 1000, 2000, 5000],
							default: "Over 5000.00",
							output: { "count": { $sum: 1 } }
						}
					},
					{
						"$project": {
							lowerPriceBound: "$_id",
							count: 1,
							_id: 0
						}
					}
				],
				brands: [
					{
						"$sortByCount": "$brand"
					},
					{
						"$project": {
							brand: "$_id",
							count: 1,
							_id: 0
						}
					}
				],
				ScreenSize: [
					{
						"$match": { "Attributes.Name": "ScreenSize" }
					},
					{
						"$sortByCount": "$Attributes.Value"
					},
					{
						"$project": {
							ScreenSize: "$_id",
							count: 1,
							_id: 0
						}
					}
				],
				resolution: [
					{
						"$match": { "Attributes.Name": "Resolution" }
					},
					{
						"$sortByCount": "$Attributes.Value"
					},
					{
						"$project": {
							resolution: "$_id",
							count: 1,
							_id: 0
						}
					}
				],
				number_of_ports: [
					{
						"$match": {
							"Attributes.Name": "NumberofPorts"
						}
					},
					{
						"$sortByCount": "$Attributes.Value"
					},
					{
						"$project": {
							ports: "$_id",
							count: 1,
							_id: 0
						}
					}
				]
			}
		}
		], function (err, results) {
			////console.log("Product-unwound: " + JSON.stringify(results));
			////console.log("Err-unwound: " + JSON.stringify(err));
			Product.aggregate([{
				$sortByCount: "$category"
			}], function (err, allcats) {
				Product.aggregate([
					search, {
						$sortByCount: "$category"
					}
				], function (err, navcats) {
					Category.findOne({
						// slug: new RegExp(category_slug, 'i')
						$or: [{
							'slug': new RegExp(category_slug, 'i')
						}, {
							'name': new RegExp(category_slug, 'i')
						}],

					}, function (err, category) {
						if (err) {
							////console.log("Error finding category " + category_slug);
							req.flash('error', 'Cannot find category');
							return res.redirect('/');
						}
						if (!category) {
							////console.log("Error finding category " + category_slug);
							req.flash('error', 'Cannot find category');
							return res.redirect('/');
						}
						Product.aggregate([search, {
							$sortByCount: "$Product_Group"
						}], function (err, navgroups) {
							if (q) {
								srch = {
									$text: {
										search: q
									}
								}
							} else {
								srch = {}
							}
							/* find all products in category selected */
							categCondition = {
								$match: {
									$and: [{
										$or: [{
											'category': 'Television'
										}, {
											'category': new RegExp(category.name, 'i')
										}]
									},
									{
										status: {
											$ne: 'deleted'
										}
									},
									{
										$or: [{
											"inventory.onHand": {
												$gt: 0
											}
										}, {
											"inventory.disableOnZero": false
										}]
									}
									]
								}
							}
							categCondition = {
								$and: [{
									$or: [{
										'category': new RegExp(category.slug, 'i')
									}, {
										'category': new RegExp(category.name, 'i')
									}]
								},
								{
									status: {
										$ne: 'deleted'
									}
								},
								{
									$or: [{
										"inventory.onHand": {
											$gt: 0
										}
									}, {
										"inventory.disableOnZero": false
									}]
								}
								]
							}
							Product.find({ category: "Television" }, function (err, products) {
								if (err || !products || products === 'undefined') {
									////console.log("Error: " + err.message);
									req.flash('error', 'Problem finding products');
									res.redirect('/');
								}
								if (category.format != 'table') {
									productChunks = [];
									chunkSize = 4;
									for (var i = (4 - chunkSize); i < products.length; i += chunkSize) {
										productChunks.push(products.slice(i, i + chunkSize))
									};
								}
								res.render('shop/eshop', {
									layout: 'eshop/television',
									navcats: navcats,
									results: results,
									navgroups: navgroups,
									viewDocuments: viewDocuments,
									category: category,
									products: productChunks,
									productChunks: productChunks,
									user: req.user,
									q: q,
									errorMsg: errorMsg,
									noErrorMsg: !errorMsg,
									successMsg: successMsg,
									noMessage: !successMsg,
									isLoggedIn: req.isAuthenticated()
								});
							});
						});
					});
				})
			})
		})
	})
})

router.get('/category/:slug', function (req, res, next) {
	var category_slug = req.params.slug;
	req.session.category = req.params.slug;
	var q = req.query.q;
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	if (req.params.q) {
		search = {
			$match: {
				$and: [{
					$text: {
						$search: q
					}
				}
					// { category: new RegEx(category_slug, 'i')}
				]
			}
		}
	} else {
		search = {
			$match: {
				// category: new RegExp(category_slug, 'i')
			}
		}
	}
	/* Create a list of categories and product counts within CAMERAS (100) */

	Product.aggregate([{
		$sortByCount: "$category"
	}], function (err, allcats) {
		Product.aggregate([
			search, {
				$sortByCount: "$category"
			}
		], function (err, navcats) {
			Category.findOne({
				// slug: new RegExp(category_slug, 'i')
				$or: [{
					'slug': new RegExp(category_slug, 'i')
				}, {
					'name': new RegExp(category_slug, 'i')
				}],

			}, function (err, category) {
				if (err) {
					////console.log("Error finding category " + category_slug);
					req.flash('error', 'Cannot find category');
					return res.redirect('/');
				}
				if (!category) {
					////console.log("Error finding category " + category_slug);
					req.flash('error', 'Cannot find category');
					return res.redirect('/');
				}
				Product.aggregate([search, {
					$sortByCount: "$Product_Group"
				}], function (err, navgroups) {
					if (q) {
						srch = {
							$text: {
								search: q
							}
						}
					} else {
						srch = {}
					}
					/* find all products in category selected */

					categCondition = {
						$match: {
							$and: [{
								$or: [{
									'category': new RegExp(category.slug, 'i')
								}, {
									'category': new RegExp(category.name, 'i')
								}]
							},
							{
								status: {
									$ne: 'deleted'
								}
							},
							{
								$or: [{
									"inventory.onHand": {
										$gt: 0
									}
								}, {
									"inventory.disableOnZero": false
								}]
							}
							]
						}
					}
					categCondition = {
						$and: [{
							$or: [{
								'category': new RegExp(category.slug, 'i')
							}, {
								'category': new RegExp(category.name, 'i')
							}]
						},
						{
							status: {
								$ne: 'deleted'
							}
						},
						{
							$or: [{
								"inventory.onHand": {
									$gt: 0
								}
							}, {
								"inventory.disableOnZero": false
							}]
						}
						]
					}
					Product.find(categCondition, function (err, products) {
						// Product.aggregate([
						// 	// $match: {
						// 	//     $and: [{
						// 	//         $or: [{
						// 	//             'category': new RegExp(category.slug, 'i')
						// 	//         }, {
						// 	//             'category': new RegExp(category.name, 'i')
						// 	//         }]
						// 	//     }, srch]
						// 	// }
						// 	categCondition
						// ], function(err, products) {
						if (err || !products || products === 'undefined') {
							////console.log("Error: " + err.message);
							req.flash('error', 'Problem finding products');
							res.redirect('/');
						}
						if (category.format != 'table') {
							productChunks = [];
							chunkSize = 4;
							for (var i = (4 - chunkSize); i < products.length; i += chunkSize) {
								productChunks.push(products.slice(i, i + chunkSize))
							};
							// products = productChunks
						}
						res.render('shop/eshop', {
							layout: 'eshop/eshop',
							navcats: navcats,
							navgroups: navgroups,
							viewDocuments: viewDocuments,
							category: category,
							products: productChunks,
							productChunks: productChunks,
							user: req.user,
							q: q,
							errorMsg: errorMsg,
							noErrorMsg: !errorMsg,
							successMsg: successMsg,
							noMessage: !successMsg,
							isLoggedIn: req.isAuthenticated()
						});
					});
				});
			});
		})
	})
});

// Mobile Category Slug
router.get('/category-mobile/:slug', function (req, res, next) {
	var category_slug = req.params.slug;
	req.session.category = req.params.slug;
	var q = req.query.q;
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	if (req.params.q) {
		search = {
			$match: {
				$and: [{
					$text: {
						$search: q
					}
				}
					// { category: new RegEx(category_slug, 'i')}
				]
			}
		}
	} else {
		search = {
			$match: {
				// category: new RegExp(category_slug, 'i')
			}
		}
	}
	/* Create a list of categories and product counts within CAMERAS (100) */

	Product.aggregate([{
		$sortByCount: "$category"
	}], function (err, allcats) {
		Product.aggregate([
			search, {
				$sortByCount: "$category"
			}
		], function (err, navcats) {
			Category.findOne({
				// slug: new RegExp(category_slug, 'i')
				$or: [{
					'slug': new RegExp(category_slug, 'i')
				}, {
					'name': new RegExp(category_slug, 'i')
				}],

			}, function (err, category) {
				if (err) {
					////console.log("Error finding category " + category_slug);
					req.flash('error', 'Cannot find category');
					res.send({
						message:  "Error",
						status: false
					});
				}
				if (!category) {
					////console.log("Error finding category " + category_slug);
					req.flash('error', 'Cannot find category');
					res.send({
						message:  "Error",
						status: false
					});
				}
				Product.aggregate([search, {
					$sortByCount: "$Product_Group"
				}], function (err, navgroups) {
					if (q) {
						srch = {
							$text: {
								search: q
							}
						}
					} else {
						srch = {}
					}
					/* find all products in category selected */

					categCondition = {
						$match: {
							$and: [{
								$or: [{
									'category': new RegExp(category.slug, 'i')
								}, {
									'category': new RegExp(category.name, 'i')
								}]
							},
							{
								status: {
									$ne: 'deleted'
								}
							},
							{
								$or: [{
									"inventory.onHand": {
										$gt: 0
									}
								}, {
									"inventory.disableOnZero": false
								}]
							}
							]
						}
					}
					categCondition = {
						$and: [{
							$or: [{
								'category': new RegExp(category.slug, 'i')
							}, {
								'category': new RegExp(category.name, 'i')
							}]
						},
						{
							status: {
								$ne: 'deleted'
							}
						},
						{
							$or: [{
								"inventory.onHand": {
									$gt: 0
								}
							}, {
								"inventory.disableOnZero": false
							}]
						}
						]
					}
					Product.find(categCondition, function (err, products) {
						// Product.aggregate([
						// 	// $match: {
						// 	//     $and: [{
						// 	//         $or: [{
						// 	//             'category': new RegExp(category.slug, 'i')
						// 	//         }, {
						// 	//             'category': new RegExp(category.name, 'i')
						// 	//         }]
						// 	//     }, srch]
						// 	// }
						// 	categCondition
						// ], function(err, products) {
						if (err || !products || products === 'undefined') {
							////console.log("Error: " + err.message);
							req.flash('error', 'Problem finding products');
							res.send({
								message:  "Error",
								status: false
							});
						}
						if (category.format != 'table') {
							productChunks = [];
							chunkSize = 4;
							for (var i = (4 - chunkSize); i < products.length; i += chunkSize) {
								productChunks.push(products.slice(i, i + chunkSize))
							};
							// products = productChunks
						}
						res.send(productChunks);
					});
				});
			});
		})
	})
});



router.post('/add-to-cart', isLoggedIn, function (req, res, next) {
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	var ticket_name = req.body.ticket_name || null;
	var ticket_email = req.body.ticket_email || null;
	var price = req.body.price || null;
	var type = req.body.Product_Group || null;

	/* new product to be added to cart */
	var productId = req.body.productId || null;
	/* tickets need to have name and email recorded */
	if (type == 'TICKET') {
		req.checkBody("ticket_email", "Enter a valid email address.").isEmail();
	}

	if (type == 'DONATION') {
		if (price >= 1000) {
			errors = 1;
			req.flash('error', 'Unable to accept donations greater than $1000.00');
			return res.redirect('/');
		}
		if (price < 1 || price == 0) {
			req.flash('error', 'Unable to process negative donations.');
			return res.redirect('/');
		}
	}
	var errors = req.validationErrors();
	if (errors) {
		returnObject = {
			errorMsg: errors,
			noErrorMsg: false,
			noMessage: true
		};
		req.flash('error', 'Invalid email address.  Please re-enter.');
		return res.redirect('/');
	}

	var option = req.body.option || null;
	// if we have a cart, pass it - otherwise, pass an empty object
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	Product.findById(productId, function (err, product) {
		if (err || product === 'undefined' || product == null) {
			// replace with err handling
			var errorMsg = req.flash('error', 'unable to find product');
			return res.redirect('/');
		}
		if (product.Product_Group == 'DONATION') {
			////console.log("PRICE: " + parseFloat(price * 100));
			theprice = parseFloat(price * 100);
		} else {
			theprice = product.price;
		}
		added = cart.add(product, product.id, theprice, option, ticket_name, ticket_email, product.Product_Group, product.taxable, product.shippable, req.user._id);
		// cart.totalTax = 0;
		meanlogger.log('plus', 'Added ' + product.name + ' to cart', req.user);

		if (added) {
			req.flash('error', added.message);
			res.redirect('/');
		} else {
			cart.totalShipping = 0;
			req.session.cart = cart;
			req.flash('success', 'Item successfully added to cart. ');
			if (!req.session.group === null) {
				res.redirect('/group/' + req.session.group);
			} else {
				if (!req.session.category === null) {
					res.redirect('/category/' + req.session.category);
				}
			}
			if (!req.session.category === null) {
				res.redirect('/category/' + req.session.category);
			} else {
				if (!req.session.group === null) {
					res.redirect('/group/' + req.session.group);
				}
			}
			res.redirect('/');
		}
		// });
	});
});

router.get('/add-to-cart/:id/', function (req, res, next) {
	var ticket_name = req.body.ticket_name || "";
	var ticket_email = req.body.ticket_email || "";
	var option = req.body.option || "";
	var productId = req.params.id;
	// if we have a cart, pass it - otherwise, pass an empty object
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	Product.findById(productId, function (err, product) {
		if (err) {
			// replace with err handling
			req.flash('error', err.message);
			res.redirect('/');
		}
		taxCalc.calculateTax(productId, req.user._id, function (err, taxInfo) {
			if (err) {
				taxAmount = 0;
			} else {
				taxAmount = taxInfo.taxAmount;
			}
			cart.add(product, product.id, product.price, taxAmount, option, ticket_name, ticket_email, product.type, product.taxable, product.shippable, req.user._id);
			req.session.cart = cart;
			meanlogger.log('plus', 'Added ' + product.name + ' to cart', req.user);
			// store cart in session

			req.flash('success', 'Item Successfully added to cart.' + JSON.stringify(cart));
			res.redirect('/');
		});
	});
});

router.get('/empty-cart', isLoggedIn, function (req, res, next) {
	var cart = new Cart({});
	cart.empty();
	req.session.cart = cart;
	meanlogger.log('trash', 'Emptied cart', req.user);

	res.redirect('/');

});

router.get('/reduce-qty/:id/', function (req, res, next) {
	var productId = req.params.id;
	// if we have a cart, pass it - otherwise, pass an empty object
	var cart = new Cart(req.session.cart ? req.session.cart : {});
	Product.findById(productId, function (err, product) {
		if (err) {
			// replace with err handling
			return res.redirect('/');
		}

		if (!product) {
			//res.render('shop/shopping-cart',{products: null, errorMsg: "Product not found.",noErrorMsg:0})
			req.flash('error', 'Cannot locate product');
			return res.redirect('/');
		}
		cart.reduce(product, product.id, product.price);
		req.session.cart = cart; // store cart in session
		res.redirect('/shopping-cart');
	});
});

router.get('/shopping-cart', isLoggedIn, function (req, res, next) {

	if (res.locals.needsAddress || req.user.addr1 === 'undefined' || req.user.addr1 == null) {
		req.flash('error', 'Please complete your profile with your address information');
	}
	errorMsg = req.flash('error')[0];
	successMsg = req.flash('success')[0];
	if (!req.session.cart) {
		return res.render('shop/shopping-cart', {
			layout: 'eshop/blank',
			products: null,
			user: req.user
		});
	}
	var cart = new Cart(req.session.cart);
	var cartJSON = cart;
	var totalTax = parseFloat(Number(cart.totalTax).toFixed(2));
	var totalPrice = parseFloat(Number(cart.totalPrice).toFixed(2));
	var totalShipping = parseFloat(Number(cart.totalShipping).toFixed(2));
	var totalPriceWithTax = parseFloat(Number(cart.totalPriceWithTax).toFixed(2));
	var totalTax = parseFloat(Number(cart.totalTax).toFixed(2));
	var grandTotal = parseFloat(Number(cart.grandTotal).toFixed(2));
	var products = cart.generateArray();

	recommendations.GetRecommendations(cart, function (err, recommendations) {
		if (err) {
			errorMsg = req.flash('error', err.message);
		}
		if (!recommendations && res.locals.showRecommendations) {
			recommendations = [{
				code: 'cam1000',
				title: 'Gorgeous Fresh Hat Camera',
				description: 'Error ea velit et explicabo.',
				price: 973,
				imagePath: '/images/lumix-camera.jpg'
			}, {
				code: 'cam1001',
				title: 'Tasty Metal Chicken Camera',
				description: 'Lumix Incredible orchid Tasty Metal Chicken Camera',
				price: 360,
				imagePath: '/images/sony-camera.jpg'
			}]
		}
		////console.log("error: " + errorMsg);
		res.render('shop/shopping-cart', {
			layout: 'eshop/blank',
			products: cart.generateArray(),
			items: cart.generateObject(),
			allcats: req.session.allcats,
			totalTax: totalTax,
			viewDocuments: viewDocuments,
			totalPrice: totalPrice,
			cartJSON: cartJSON,
			totalShipping: totalShipping,
			grandTotal: cart.grandTotal,
			recommendations: recommendations,
			user: req.user,
			localUser: (req.user.state == taxConfig.ourStateCode),
			errorMsg: errorMsg,
			noErrorMsg: !errorMsg,
			successMsg: successMsg,
			noMessage: !successMsg
		});
	})
	//    Category.find({}, function(err,allcats) {
	//  if (err) {
	//      req.flash.error('error','Error retrieiving categories');
	//      res.redirect('/');
	//  }
	//  if (!allcats) {
	//      req.flash.error('error','Error retrieving categories.');
	//      res.redirect('/');

	//  }
	//  req.session.allcats = allcats
	// });

})

router.post('/update_shipping', isLoggedIn, function (req, res, next) {
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	errorMsg = req.flash('error')[0];
	successMsg = req.flash('success')[0];
	var cart = new Cart(req.session.cart);
	var errorMsg = req.flash('error')[0];

	res.render('shop/checkout', {
		layout: 'eshop/blank',
		products: cart.generateArray(),
		totalPrice: cart.totalPrice.toFixed(2),
		user: req.user,
		successMsg: successMsg,
		noMessage: !successMsg,
		errorMsg,
		noErrorMsg: !errorMsg
	});
});

router.get('/checkout', isLoggedIn, function (req, res, next) {

	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];

	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	var shipping_flag = req.body.shipping_flag;

	var cart = new Cart(req.session.cart);
	meanlogger.log('shopping-cart', 'Viewed checkout', req.user);

	res.render('shop/checkout', {
		layout: 'eshop/blank',
		products: cart.generateArray(),
		totalPrice: cart.totalPrice.toFixed(2),
		user: req.user,
		shipping_flag: shipping_flag,
		enableShipping: process.env.enableShipping,
		enableTax: process.env.enableTax,
		successMsg: successMsg,
		noMessage: !successMsg,
		errorMsg: errorMsg,
		noErrorMsg: !errorMsg
	});
});

router.post('/checkout', function (req, res, next) {
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	var email = req.body.email;
	var telephone = req.body.telephone;

	var method = req.body.method;
	var item_name = req.body.item_name;

	var shipping_addr1 = req.body.shipping_addr1;
	var shipping_city = req.body.shipping_city;
	var shipping_state = req.body.shipping_state;
	var shipping_zip = req.body.shipping_zip;
	var shipping_flag = req.body.shipping_flag;
	var shipping_flags = req.body.shipping_flags;

	var cart = new Cart(req.session.cart);
	if (shipping_flag && process.env.enableShipping) {
		req.checkBody("shipping_addr1", "Enter a valid shipping address.");
		req.checkBody("shipping_city", "Enter a valid shipping city.");
		req.checkBody("shipping_state", "Enter a valid shipping state.");
		req.checkBody("shipping_zip", "Enter a valid shipping address.");
	}
	req.check("email", "Enter a valid email address.");
	req.check("telephone", "Enter a valid telephone number.");

	meanlogger.log('shopping-cart', 'Viewed checkout', req.user);
	var errors = req.validationErrors();
	if (errors) {
		if (shipping_flag && process.env.enableShipping) {
			req.flash('error', 'Invalid shipping information.');
			return res.redirect('/shopping-cart');
		}
		returnObject = {
			errorMsg: errors,
			noErrorMsg: false,
			noMessage: true
		};
		req.flash('error', 'Invalid contact information.  Please ensure that you have an email and telephone number.');
		return res.redirect('/shopping-cart');
	}

	if (telephone || email) {
		if (!req.user.telephone) {
			User.findOneAndUpdate({
				_id: req.user._id
			}, {
					$set: {
						telephone: telephone
					}
				}, function (err, user) {
					if (err) {
						////console.log("unable to update user telephone");
					}
					req.user.telephone = telephone;
				});
		}
		if (!req.user.email && email) {
			User.findOneAndUpdate({
				_id: req.user._id
			}, {
					$set: {
						email: email
					}
				}, function (err, user) {
					if (err) {
						////console.log("unable to update user telephone");
					}
					req.user.email = email;
				});
		}
	}
	taxDesc = "";
	var subtotal = parseFloat(req.body.amount).toFixed(2);
	var shippingtotal = 0;
	errorMsg = req.flash('error')[0];
	successMsg = req.flash('success')[0];
	products = cart.generateArray();
	shippingCalc.calculateShipping(products, function (err, result) {
		if (err) {
			////console.log("Unable to calculate shipping " + err);
			errorMsg = req.flash('error', err.message);
			return res.redirect('/');
		}
		if (!shipping_flag || shipping_flag == null) {
			shippingtotal = 0;
		} else {
			shippingtotal = result.totalShipping;
		}
		if ((shipping_state == taxConfig.ourStateCode) && process.env.enableTax == true) {
			taxDesc = "PA and Philadelphia Sales Tax Applies";
			products = cart.generateArray();
			taxCalc.calculateTaxAll(products, req.user._id, function (err, results) {
				if (err) {
					////console.log(err);
					res.redirect('/');
				}
				if (!req.session.cart) {
					return res.redirect('/shopping-cart');
				}
				var totalTax = results.taxAmount.toFixed(2);
				var grandtotal = ((parseFloat(subtotal) + parseFloat(totalTax) + parseFloat(shippingtotal))).toFixed(2);
				var errorMsg = req.flash('error')[0];
				res.render('shop/checkout', {
					user: req.user,
					layout: 'eshop/blank',
					shipping_addr1: shipping_addr1,
					shipping_city: shipping_city,
					shipping_state: shipping_state,
					shipping_zip: shipping_zip,
					shipping_flag: shipping_flag,
					email: email,
					telephone: telephone,
					taxDesc: taxDesc,
					products: cart.generateArray(),
					subtotal: subtotal,
					enableTax: process.env.enableTax,
					enableShipping: process.env.enableShipping,
					totalTax: totalTax,
					shippingtotal: shippingtotal,
					grandtotal: grandtotal,
					successMsg: successMsg,
					noMessage: !successMsg,
					errorMsg: errorMsg,
					noErrorMsg: !errorMsg
				});
			})
		} else {
			var totalTax = 0;
			var grandtotal = (parseFloat(subtotal) + parseFloat(shippingtotal));
			res.render('shop/checkout', {
				user: req.user,
				layout: 'eshop/blank',
				shipping_addr1: shipping_addr1,
				shipping_city: shipping_city,
				shipping_state: shipping_state,
				shipping_zip: shipping_zip,
				taxDesc: taxDesc,
				products: cart.generateArray(),
				subtotal: subtotal,
				totalTax: totalTax,
				enableTax: process.env.enableTax,
				enableShipping: process.env.enableShipping,
				shippingtotal: shippingtotal,
				grandtotal: grandtotal,
				successMsg: successMsg,
				noMessage: !successMsg,
				errorMsg: errorMsg,
				noErrorMsg: !errorMsg
			});
		}
	});
});

router.post('/create', function (req, res, next) {
	// reference: https://github.com/paypal/PayPal-node-SDK/search?p=2&q=tax&utf8=%E2%9C%93
	var method = req.body.method;
	var telephone = req.body.telephone;
	var email = req.body.email;
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var amount = parseFloat(req.body.amount / 100);
	var shippingtotal = parseFloat(req.body.shippingtotal / 100);
	var subtotal = parseFloat(req.body.subtotal / 100);
	var taxAmount = parseFloat(req.body.totalTax / 100);
	req.check("email", "Enter a valid email address.");
	req.check("telephone", "Enter a valid telephone number.");
	var errors = req.validationErrors();
	if (errors) {
		returnObject = {
			errorMsg: errors,
			noErrorMsg: false,
			noMessage: true
		};
		req.flash('error', 'Invalid contact or shipping information.  Please ensure that you have an email and telephone number.');
		return res.redirect('/checkout');
	}
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	

	var cart = new Cart(req.session.cart);
	products = cart.generateArray();
	tax = taxCalc.calculateTaxReturn(products, req.user._id);
	var create_payment = {
		"intent": "sale",
		"payer": {
			"payment_method": "instamojo"
		},
		"transactions": [{
			"amount": {
				"currency": "Rupees",
				"total": String(amount.toFixed(2)),
				"details": {
					"subtotal": String(subtotal.toFixed(2)),
					"tax": String(taxAmount.toFixed(2)),
					"shipping": String(shippingtotal.toFixed(2)),
					"handling_fee": "0.00",
					"shipping_discount": "0.00"
				}
			},
			"description": "Purchase",
			"item_list": {
				"items": []
			}
		}]
	};
	var custom = {}
	var item_list = [];
	var orders = [];
	for (var i = 0, len = products.length; i < len; i++) {
		var extprice = parseFloat(products[i].price / 100);
		extprice = String((extprice).toFixed(2));
		intprice = String(parseFloat(products[i].price));
		qty = Number(products[i].qty);
		tname = 'ticket_name_' + i;
		oname = 'option_' + i;
		var ticket_name = req.body['ticket_name_' + i];
		var ticket_email = req.body['ticket_email_' + i];
		var option = req.body['option_' + i];
		custom[i] = {
			"ticket_name": ticket_name,
			"ticket_email": ticket_email,
			"option": option
		};
		item = {
			"name": products[i].item.title,
			"price": extprice,
			"quantity": qty,
			"currency": "USD",
			"sku": products[i].item.code
		}

		// if (products[i].item.Product_Group=="TICKET") {
		//     item.ticket_name = ticket_name;
		//     item.ticket_email = ticket_email;
		//     ////console.log("TICKET_NAME: " + item.ticket_name);
		// }
		create_payment.transactions[0].item_list.items.push(item)
		order = {
			productId: products[i].item._id,
			product_name: products[i].item.title,
			Product_Group: products[i].item.Product_Group,
			product_price: intprice,
			product_price_double: parseFloat(products[i].price / 100),
			product_qty: qty,
			paidBy: 'instamojo',
			ticket_name: ticket_name,
			ticket_email: ticket_email,
			option: option,
			category: products[i].item.category,
			code: products[i].item.code,
			vendor_id: products[i].item.vendor_id
		}
		orders.push(order);
	}
	if (method === 'instamojo') {
		create_payment.payer.payment_method = 'instamojo';
		return_url = "http://" + req.headers.host + "/execute";
		cancel_url = "http://" + req.headers.host + "/cancel";
		create_payment.redirect_urls = {
			"return_url": return_url,
			"cancel_url": cancel_url
		};
	} else if (method === 'credit_card') {
		var funding_instruments = [{
			"credit_card": {
				"type": req.body.type.toLowerCase(),
				"number": req.body.number,
				"expire_month": req.body.expire_month,
				"expire_year": req.body.expire_year,
				"first_name": req.body.first_name,
				"last_name": req.body.last_name
			}
		}];
		create_payment.payer.payment_method = 'credit_card';
		create_payment.custom = custom;
		create_payment.payer.funding_instruments = funding_instruments;
	}
	// order comnfirmation mail sending  ..........................................
	const output = `
		<p>Booking Confirmation</p>
		<h3>Details</h3>
		<ul>  
		  <li>Name: ${req.user.first_name}</li>		 
		  <li>Email: ${res.locals.fromEmail}</li>
		  <li>Phone: ${req.user.telephone}</li>
		</ul>
		<p>Our executive will get in touch with you</p>
	  `;
	let transporter = nodemailer.createTransport({
		host: 'mail.zo-online.com',
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: 'admin@zo-online.com', // generated ethereal user
			pass: '22watch22@DS'  // generated ethereal password
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	// setup email data with unicode symbols
	let mailOptions = {
		from: '"Thrillworld Confirmation" <admin@zo-online.com>', // sender address
		replyTo: '"Thrillworld Confirmation" <admin@zo-online.com>', // sender address
		to: req.user.email, // list of receivers
		subject: 'booking', // Subject line
		text: 'Hello world?', // plain text body
		html: output // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			
			console.log("ERROR"+error);
			return ////console.log(error);
		}
		
		
		console.log("INFo"+info);
		console.log('Message sent: %s', info.messageId);
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		req.flash('success', "SENT MAIL, KINDLY CHECK!");
	//	res.render('contact', { msg: 'Email has been sent' });
	});
	// end of order comnfirmation mail sending  ..........................................
	// order comnfirmation sms sending  ..........................................
	var number = req.user.telephone;
	console.log(number);
	// const text = req.body.text;
	const text = "Booking successfull Thank You, Thrillworld";
	console.log("NUMBRER"+number);
	console.log("NUMBRER"+number[0]+number[1]);
	console.log("TEXT"+text);

	if(number.length<=10){
		 number="91"+number;
		console.log("NEW"+ number);
	}

	// Init Nexmo
const nexmo = new Nexmo({
	apiKey: '38d2edbc',
	apiSecret: 'grzR4xHCJDGhDqi2'
	}, {debug: true})

	nexmo.message.sendSms(
		'917795565771', number, text, { type: 'unicode' },
		(err, responseData) => {
			if (err) {
				console.log("SMS"+err);
			} else {
				console.dir(responseData);
				// Get data from response
				const data = {
					id: responseData.messages[0]['your booking successful'],
					number: responseData.messages[0]['number']
				}

				// Emit to the client
			//	io.emit('smsStatus', data);
			}
		}
	);
	// end of order comnfirmation sms sending  ..........................................
	//
	// Send the payment request to paypal
	// PP will respond with a payment record that includes a redirect url
	// We'll store the payment in a document and then redirect the user
	// When the user authorizes, paypal will callback our /execute route and we'll complete the transaction
	//

	// STORE THE ORDER DATA TO DB
	// Create Order Record with a pending status.
	var order = new Order({
		user: {
			id: req.user._id,
			first_name: req.user.first_name,
			last_name: req.user.last_name,
			email: req.user.email,
			telephone: req.user.telephone
		},
		cart: orders,
		shipping_address: req.body.shipping_addr1,
		shipping_city: req.body.shipping_city,
		shipping_state: req.body.shipping_state,
		shipping_zipcode: req.body.shipping_zipcode,
		billing_address: req.body.shipping_addr1,
		billing_city: req.body.shipping_city,
		billing_state: req.body.shipping_state,
		billing_zipcode: req.body.shipping_zipcode,
		paymentId: 1234, // Adding Dummmy payment id
		status: 'pending',
		total: parseFloat(cart.grandTotal)
	});
	order.save(function (err,orderdata) {
		if (err) {
			////console.log("Error: " + err.message)
			req.flash('error', 'Unable to save order... ' + err.message);
			res.redirect('/');
		}

		req.flash('success', "Order Successful!");
		console.log("HERE REDIRECT");

		var data = new Insta.PaymentData();

	data.purpose = "Test";            // REQUIRED
	data.amount = parseFloat(cart.grandTotal);                  // REQUIRED
	data.currency                = 'INR';
	data.buyer_name              = req.user.first_name;
	data.email                   = req.user.email;
	data.phone                   = req.user.telephone;
	data.send_sms                = 'True';
	data.send_email              = 'True';
	data.allow_repeated_payments = 'False';
	data.setRedirectUrl("http://localhost:3000/?orderid="+orderdata.id+"&");

	Insta.createPayment(data, function(error, response) {
  	if (error) {
	// some error
	console.log("instamojo ERROR"+error);
 	 } else {
    // Payment redirection link at response.payment_request.longurl
		
		response = JSON.parse(response);
		
		//console.log(response.success);
		console.log("instamojo SUCESS"+response);
		console.log(response.payment_request.longurl);
		//console.log("REQUIRED URL"+JSON.stringify(response));
	//	console.log(response['payment_request']);
	//	console.log(JSON.parse(response['payment_request']));
		return res.redirect(response.payment_request.longurl);
		
 	 }
	});
		// return res.redirect('/');
	})


	// create reusable transporter object using the default SMTP transport



	// paypal.payment.create(create_payment, function(err, payment) {
	// 	if (err) {
	// 		////console.log("ERROR HIT");
	// 		errorMsg = req.flash('error', err.message);
	// 		res.redirect('/')
	// 	} else {
	// 		req.session.paymentId = payment.id;
	// 		var ourPayment = payment;
	// 		ourPayment.user = req.user._id;
	// 		var newPayment = new Payment(ourPayment);
	// 		newPayment.save(function(err, newpayment) {
	// 			if (err) {
	// 				errorMsg = req.flash('error', err.message);
	// 				////console.log('error: ' + err.message);
	// 				return res.redirect('/shopping-cart');
	// 			}
	// 			// Create Order Record with a pending status.
	// 			var order = new Order({
	// 				user: {
	// 					id: req.user._id,
	// 					first_name: req.user.first_name,
	// 					last_name: req.user.last_name,
	// 					email: req.user.email,
	// 					telephone: req.user.telephone
	// 				},
	// 				cart: orders,
	// 				shipping_address: req.body.shipping_addr1,
	// 				shipping_city: req.body.shipping_city,
	// 				shipping_state: req.body.shipping_state,
	// 				shipping_zipcode: req.body.shipping_zipcode,
	// 				billing_address: req.body.shipping_addr1,
	// 				billing_city: req.body.shipping_city,
	// 				billing_state: req.body.shipping_state,
	// 				billing_zipcode: req.body.shipping_zipcode,
	// 				paymentId: payment.id,
	// 				status: 'pending',
	// 				total: parseFloat(cart.grandTotal)
	// 			});
	// 			order.save(function(err) {
	// 				if (err) {
	// 					////console.log("Error: " + err.message)
	// 					req.flash('error', 'Unable to save order... ' + err.message);
	// 					res.redirect('/');
	// 				}
	// 			})
	// 			var redirectUrl;
	// 			if (payment.payer.payment_method === 'paypal') {
	// 				var done = 0;
	// 				for (var i = 0; i < payment.links.length; i++) {
	// 					done++;
	// 					var link = payment.links[i];
	// 					if (link.method === 'REDIRECT') {
	// 						redirectUrl = link.href;
	// 					}
	// 					if (done == payment.links.length) {
	// 						return res.redirect(redirectUrl);
	// 					}
	// 				}
	// 			}
	// 		});
	// 	}
	// });


	
});

router.get('/like/:id', isLoggedIn, function (req, res, next) {
	var theId = new ObjectId(req.params.id);
	Product.findOneAndUpdate({
		_id: theId
	}, {
			$addToSet: {
				"likes": req.user._id
			}
		}, {
			safe: true,
			upsert: false
		}, function (err, product) {
			event = new Event({
				namespace: 'products',
				person: {
					id: req.user._id,
					first_name: req.user.first_name,
					last_name: req.user.last_name,
					email: req.user.email,
				},
				action: 'like',
				thing: {
					type: "product",
					id: product._id,
					name: product.name,
					category: product.category,
					Product_Group: product.Product_Group
				}
			});
			event.save(function (err, eventId) {
				if (err) {
					////console.log("Error: " + err.message);
					return -1;
				}
			})
		});
	res.redirect('/');
});
router.post('/reviews', isLoggedIn, function (req, res, next) {
	var theId = new ObjectId(req.params.id);
	
	
	console.log(req.body.review);
	// console.log(product._id);
	var review={
		"review":req.body.review,
	};

	Product.findOneAndUpdate({
		_id: req.body.productId
	}, {
			"$push": {
				reviews: review
			}
		}, function (err, newprod) {
			if (err) {
				console.log("Error updating product with users bought: " + JSON.stringify(err));
			}
		})
});

router.get('/execute', function (req, res, next) {
	////console.log("Completing Order: " + res.locals.fromEmail);
	var paymentId = req.query.paymentId;
	var token = req.query.token;
	var PayerID = req.query.PayerID

	var details = {
		"payer_id": PayerID
	};
	var cart = new Cart(req.session.cart);
	products = cart.generateArray();
	var payment = paypal.payment.execute(paymentId, details, function (error, payment) {
		if (error) {
			////console.log(error);
			res.render('error', {
				'error': error
			});

		} else {
			// Update payment record with new state - should be approved.
			Payment.find({
				id: paymentId
			}, function (err, paymentDocument) {
				if (err) {
					res.render('error', {
						'error': error
					});
				}
				Payment.update({
					id: paymentId
				}, {
						state: payment.state
					}, function (err, numAffected) {
						if (err) {
							res.render('error', {
								'error': err
							});
							exit();
						}
						Order.findOneAndUpdate({
							paymentId: payment.id
						}, {
								status: payment.state
							}, {
								new: true,
								safe: true,
								upsert: true
							}, function (err, newOrder) {
								if (err) {
									req.flash('error', 'Unable to save order.');
									return res.redirect('/');
								}
								/* Update Users Bought Array */
								async.each(products, function (product, next) {
									event = new Event({
										namespace: 'products',
										person: {
											id: req.user._id,
											first_name: req.user.first_name,
											last_name: req.user.last_name,
											email: req.user.email,
											telephone: req.user.telephone
										},
										action: 'purchase',
										thing: {
											type: "product",
											id: product.item._id,
											name: product.item.name,
											category: product.category,
											Product_Group: product.Product_Group
										}
									});
									event.save(function (err, eventId) {
										if (err) {
											////console.log("Error: " + err.message);
											return -1;
										}
									});
									Product.findOneAndUpdate({
										_id: product.item._id
									}, {
											"$push": {
												usersBought: req.user._id
											}
										}, function (err, newprod) {
											if (err) {
												////console.log("Error updating product with users bought: " + JSON.stringify(err));
											}
										})
									User.findOneAndUpdate({
										_id: req.user._id
									}, {
											$push: {
												"orders": {
													paymentId: payment.id,
													status: payment.state,
													productId: product.item._id,
													sku: product.sku,
													code: product.code,
													name: product.item.name,
													price: product.item.price,
													category: product.category,
													Product_Group: product.Product_Group,
													vendor_id: product.vendor_id
												}
											}
										}, {
											new: true,
											safe: true,
											upsert: false
										}, function (err, newUser) {
											if (err) {
												////console.log("Unable to update user - " + err.message);
												return -1;
											}
											Product.findOneAndUpdate({
												_id: product.item._id,
												"inventory.disableAtZero": true
											}, {
													'$inc': { 'inventory.onHand': -1 },
												}, function (err, product) {
													if (err) {
														////console.log("Problem decrementing inventory.");
													}
												});
											// var mailOptions = {
											// 	to: res.locals.fromEmail,
											// 	from: req.user.email,
											// 	subject: "User Completed Purchase: " + req.user.first_name + ' ' + req.user.last_name,
											// 	text: req.user.first_name + ' ' + req.user.last_name + '\n' + req.user.email + '\n' + req.user.addr1 + '\n' + req.user.city + ', ' + req.user.state + ' ' + req.user.zipcode + '\n' + req.user.telephone + '\n\n' + newUser
											// };
											// transporter.sendMail(mailOptions, function (err) {
											// 	if (err) {
											// 		////console.log(err.message);
											// 	}
											// });
											// if (res.locals.fromEmail) {
											// 	var mailOptions = {
											// 		to: newUser.email,
											// 		from: process.env.fromEmail,
											// 		subject: process.env.mailSubject,
											// 		text: 'We successfully processed an order with this email address.  If you have recieved this in error, please contact the SEPIA office at info@sepennaa.org.  Thank you for your order.\n\n' +
											// 			'To review your purchase, please visit http://' + req.headers.host + '/user/profile/\n\n' + JSON.stringify(newOrder)
											// 	};
											// 	meanlogger.log('dollar', 'Completed Purchase', req.user);
											// 	transporter.sendMail(mailOptions, function (err) {
											// 		if (err) {
											// 			////console.log(err.message);
											// 		}
											// 	});
											// } else {
											// 	////console.log("fromEmail not set - no email verification will be sent.");
											// }

										});
								})
								req.flash('success', "Successfully processed payment!");

								res.redirect('/');
							});
					});

			});

		}; // res.render('shop/complete', { 'payment': payment, message: 'Problem Occurred' });
	});
});

router.get('/complete', function (req, res, next) {
	var messages = req.flash('error');
	res.render('shop/paypal-test', {
		error: req.flash('error')[0]
	});
});

router.get('/cancel', function (req, res) {
	var paymentId = req.query.paymentId;
	var token = req.query.token;
	var PayerID = req.query.PayerID
	var details = {
		"payer_id": PayerID
	};
	Payment.update({
		id: paymentId
	}, {
			state: payment.state
		}, function (err, numAffected) {
			if (err) {
				res.render('error', {
					'error': err
				});
				exit();
			}
			successMsg = req.flash('success', 'Purchase Cancell');
			return res.render('/');
		});
});

router.post('/search', function (req, res, next) {
	var q = req.body.q;
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	Product.aggregate([{
		$match: {
			$text: {
				$search: q
			}
		}
	}, {
		$sortByCount: "$category"
	}], function (err, navcats) {
		if (err) {
			req.flash('error', 'An error has occurred - ' + err.message);
			return res.redirect('/');
		}
		Product.aggregate(
			[{
				$group: {
					_id: "$Product_Group",
					count: {
						$sum: 1
					}
				}
			}, {
				$sort: {
					_id: 1
				}
			}],
			function (err, Product_Group) {
				Product.aggregate([{
					$match: {
						$text: {
							$search: q
						}
					}
				}, {
					$sortByCount: "$Product_Group"
				}], function (err, Product_Group) {
					if (err) {
						////console.log("Error fetching categories");
						res.send(1000, 'Error');
					}
					if (frontPageCategory) {
						categCondition = {
							category: frontPageCategory
						};
					} else {
						categCondition = {};
					}
					Product.find({
						$text: {
							$search: q
						}
					}, {
							score: {
								$meta: "textScore"
							}
						})
						.sort({
							score: {
								$meta: 'textScore'
							}
						})
						.exec(function (err, results) {
							// count of all matching objects
							if (err) {
								req.flash('error', "An error has occurred - " + err.message);
								return res.redirect('/');
							}
							if (!results || !results.length) {
								req.flash('error', "No products found for search string.");
								return res.redirect('/');
							}
							productChunks = [];
							chunkSize = 4;
							for (var i = (4 - chunkSize); i < results.length; i += chunkSize) {
								productChunks.push(results.slice(i, i + chunkSize))
							}
							if (req.user) {
								meanlogger.log('search', 'Searched for  ' + q, req.user);
							}
							res.render('shop/eshop', {
								layout: 'eshop/eshop',
								title: title,
								showRecommendations: eval(res.locals.showRecommendations),
								keywords: Config.keywords,
								products: productChunks,
								q: q,
								// recommended: docs,
								Product_Group: Product_Group,
								user: req.user,
								navcats: navcats,
								allcats: navcats,
								errorMsg: errorMsg,
								noErrorMsg: !errorMsg,
								successMsg: successMsg,
								noMessage: !successMsg,
								viewTour: viewTour,
								isLoggedIn: req.isAuthenticated()
							});
						});
					// res.render('shop', {
					//     layout: 'eshop/eshop',
					//     products: productChunks,
					//     allcats: allcats,
					//     user: req.user,
					//     q: q,
					//     errorMsg: errorMsg,
					//     noErrorMsg: !errorMsg,
					//     successMsg: successMsg,
					//     noMessage: !successMsg,
					//     isLoggedIn: req.isAuthenticated()
					// });
				});
			});
	});
});

router.get('/product/:slug3', function (req, res, next) {
	
	var slug3 = req.params.slug3;

	

	qryFilter = {"_id": slug3};

	// if we have a cart, pass it - otherwise, pass an empty object
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	
	
	Product.find(qryFilter , function (err, product) {
		// console.log("Product: " + JSON.stringify(product));
	
		if (err || product === 'undefined' || product == null) {
			// replace with err handling
			var errorMsg = req.flash('error', 'unable to find product');
			return res.redirect('/');
		}

		if (!product) {
			req.flash('error', 'Product is not found.');
			res.redirect('/');
		}
		//................................................................
	// var geocoder = new google.maps.Geocoder();
	// var address = "San Diego, CA, 92111"; //Add your address here, all on one line.
	// addresses = ["San Diego, CA 92111",
	// 						 "Cancun, Mexico",
	// 						 "Sydney, Australia"];
	
	// var latitude;
	// var longitude;
	// var color = "#85cad1"; //Set your tint color. Needs to be a hex value.
	
	// function getGeocode() {
	// 	geocoder.geocode( { 'address': address}, function(results, status) {
	// 		if (status == google.maps.GeocoderStatus.OK) {
	// 			latitude = results[0].geometry.location.lat();
	// 			longitude = results[0].geometry.location.lng(); 
	// 			initGoogleMap();
	// 		} 
	// 	});
	// }
	
	// function initGoogleMap() {
	// 	var styles = [
	// 		{
	// 		  stylers: [
	// 			{ saturation: -100 }
	// 		  ]
	// 		}
	// 	];
		
	// 	var options = {
	// 		mapTypeControlOptions: {
	// 			mapTypeIds: ['Styled']
	// 		},
	// 		center: new google.maps.LatLng(latitude, longitude),
	// 		zoom: 2,
	// 		scrollwheel: false,
	// 		navigationControl: false,
	// 		mapTypeControl: false,
	// 		zoomControl: true,
	// 		disableDefaultUI: true,	
	// 		mapTypeId: 'Styled'
	// 	};
	// 	var div = document.getElementById('googleMap');
	// 	var map = new google.maps.Map(div, options);
	// 	marker = new google.maps.Marker({
	// 		map:map,
	// 		draggable:false,
	// 		animation: google.maps.Animation.DROP,
	// 		position: new google.maps.LatLng(latitude,longitude)
	// 	});
	// 	var styledMapType = new google.maps.StyledMapType(styles, { name: 'Styled' });
	// 	map.mapTypes.set('Styled', styledMapType);
		
	// 	var infowindow = new google.maps.InfoWindow({
	// 		  content: "<div class='iwContent'>"+address+"</div>"
	// 	});
	// 	google.maps.event.addListener(marker, 'click', function() {
	// 		window.location = "http://local.wordpress.dev/blog";
	// 	});
	// 	google.maps.event.addListener(marker, 'mouseover', function() {
	// 		infowindow.open(map,marker);
	// 	});
			
		
	// 	bounds = new google.maps.LatLngBounds(
	// 	  new google.maps.LatLng(-84.999999, -179.999999), 
	// 	  new google.maps.LatLng(84.999999, 179.999999));
	
	// 	rect = new google.maps.Rectangle({
	// 		bounds: bounds,
	// 		fillColor: color,
	// 		fillOpacity: 0.2,
	// 		strokeWeight: 0,
	// 		map: map
	// 	});
	
	// 	var listener = google.maps.event.addListener(map, "idle", function() { 
	// 		$('#map-banner').show();
	// 		$("#map-header").fitText(1.2, { minFontSize: '20px', maxFontSize: '400px'});
	// 	  google.maps.event.removeListener(listener); 
	// 	});
	
	// }
	// google.maps.event.addDomListener(window, 'load', getGeocode);
	//................................................................
		
		event = new Event({
			namespace: 'products',
			person: {
				id: req.user._id,
				first_name: req.user.first_name,
				last_name: req.user.last_name,
				email: req.user.email,
			},
			action: 'view',
			thing: {
				type: "product",
				id: product._id,
				name: product.name,
				category: product.category,
				Product_Group: product.Product_Group
			}
		});
		event.save(function (err, eventId) {
			if (err) {
				////console.log("Error: " + err.message);
				return -1;
			}
			recommendations.GetRecommendations(product, function (err, recommendations) {
				if (err) {
					////console.log("error: " + err);
					req.flash('error', "An error has occurred - " + err.message);
					return res.redirect('/');
				}
				res.render('shop/product', {
					layout: 'eshop/blank',
					recommendations: recommendations,
					product: product,
					errorMsg: errorMsg,
					noErrorMsg: !errorMsg
				});
			});
		});
	});
});

router.get('/privacy', function (req, res, next) {
	res.render('privacy', {
		layout: 'eshop/blank'
	});
});

router.get('/tos', function (req, res, next) {
	res.render('tos', {
		layout: 'eshop/blank'
	});
});
router.get('/overview', function (req, res, next) {
	categoryrecord = {
		"_id": "ObjectId('58485813edf44d95fb117223')",
		"name": "Television",
		"slug": "Television",
		"attributes": [],
		"ancestors": [],
		"__v": 0
	};
	orderrecord = {
		"_id": "ObjectId('5825f1bce3c20070202ee287')",
		"user": "ObjectId('5825d55ba32a1c41e7ce321c')",
		"cart": {
			"items": {
				"5825d1870ec3cd4d15d0d9c8": {
					"item": {
						"_id": "5825d1870ec3cd4d15d0d9c8",
						"code": "cam1002",
						"name": "Generic Granite Keyboard Camera",
						"title": "Lumix Practical plum Generic Granite Keyboard Camera",
						"description": "Maxime aspernatur vitae officia alias rerum provident et voluptas.",
						"taxable": true,
						"shippable": true,
						"price": 10200,
						"Product_Group": "Camera",
						"category": "Camera",
						"imagePath": "/img/lumix-camera.jpg",
						"__v": 0,
						"salesYearMonth": [],
						"salesYTD": [],
						"categories": [],
						"update": "2016-11-11T14:11:18.773Z",
						"created": "2016-11-11T14:11:18.773Z",
						"options": [],
						"Attributes": [{
							"Name": "color",
							"Value": "plum",
							"_id": "5825d1870ec3cd4d15d0d9cf"
						}, {
							"Name": "brand",
							"Value": "Lumix",
							"_id": "5825d1870ec3cd4d15d0d9ce"
						}, {
							"Name": "Memory Card Type",
							"Value": "SD",
							"_id": "5825d1870ec3cd4d15d0d9cd"
						}, {
							"Name": "Image Resolution",
							"Value": "29 Megapixels",
							"_id": "5825d1870ec3cd4d15d0d9cc"
						}, {
							"Name": "Video Resolution",
							"Value": "8k",
							"_id": "5825d1870ec3cd4d15d0d9cb"
						}, {
							"Name": "Optical Zoom",
							"Value": "23mm",
							"_id": "5825d1870ec3cd4d15d0d9ca"
						}, {
							"Name": "Price",
							"Value": "102.00",
							"_id": "5825d1870ec3cd4d15d0d9c9"
						}]
					},
					"qty": 1,
					"price": 102,
					"option": 0,
					"taxAmount": 0,
					"taxable": "Yes",
					"shippable": "Yes",
					"itemTotal": "102.00"
				}
			},
			"totalQty": 1,
			"totalTax": 0,
			"totalShipping": 0,
			"totalPrice": 102,
			"grandTotal": 102,
			"totalPriceWithTax": 0
		},
		"address": "123 Main St.",
		"city": "Anywhere",
		"state": "PA",
		"paymentId": "PAY-8E858244005728329LAS7DPA",
		"status": "approved",
		"created": "ISODate('2016-11-11T16:28:44.943Z')",
		"__v": 0
	};
	userrecord = {
		"_id": '5829d84b9304197fdc58a918',
		"role": 'visitor',
		"zipcode": '19147',
		"state": 'PA',
		"city": 'Philadelphia',
		"addr1": '123 S. Main St.',
		"last_name": 'Smith',
		"first_name": 'Samantha',
		"password": '$2a$05$oiamsitnqzD6wG.nghAbceS0eQL3YMccqTq6AVxh7XGJijp5Jm5Zy',
		"email": 'blahblahblah@gmail.com',
		"__v": 0,
		"orders": [],
		"purchased": ['5829d84b9304197fdc58a918', '6829d84b4309197fdc58a3jk'],
		"likes": ['5829d84b9304197fdc58a918', '6829d84b4309197fdc58a3jk'],
		"created": 'Mon Nov 14 2016 10:28:37 GMT-0500 (EST)'
	};
	Product.findOne({}, function (err, doc) {
		if (err) {
			////console.log("Problem fetching one random record.");
		}
		res.render('overview', {
			layout: 'eshop/blank',
			user: req.user,
			product: doc,
			order: orderrecord
		});
	});
})

router.init = function (c) {
	config = c;
	paypal.configure(c.api);
}

module.exports = router;

function catExists(cat) {
	Category.findOne({ "name": cat }, function (err, categorydoc) {
		if (err || !categorydoc) {
			return false;
		}
	})
}

function userInfo(req, res, next) {
	if (req.user) {
		return req.user;
	}
	return "No User";
}

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.session.oldUrl = req.url;
	res.redirect('/user/signin');
}

function notLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}