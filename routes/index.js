var express = require('express');
var router = express.Router();
const Invoice = require("nodeice");
var cart = require('../models/cart');
var Event=require('../models/events');
var review = require('../models/reviews');
var nodemailer = require('nodemailer');
var Category = require('../models/category');
var Message = require('../models/chatmessage');
var Product = require('../models/product');
var Purchase = require('../models/purchase');
var Order = require('../models/order');
var Acart = require('../models/addtocart');
var User = require('../models/user');
var Payment = require('../models/payment');
var Ticket = require('../models/ticket');
var passport = require('passport');
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validator = require('express-validator');
var util = require('util');
var favicon = require('serve-favicon');
// var Distance = require('geo-distance');
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

ObjectID = require('mongodb').ObjectID;

//SOCKET SETUP


// var Message = mongoose.model('Message',{
// 	to : String,
// 	form : String,
// 	message : String
//   })



// Instamojo Setup
var Insta = require('instamojo-nodejs');
Insta.setKeys("2bdd03b508f7f88c1abc9aed27de5aa9", "8eca226c24353bce2feb84db3aaa732c");
Insta.isSandboxMode(false);

var options = {
	provider: 'google',
	httpAdapter: 'https', // Default
	apiKey: 'AIzaSyAidN5MszkfMW2VYcES7uoePsX1qQmuG7M', // for Mapquest, OpenCage, Google Premier
	formatter: null         // 'gpx', 'string', ...
};

var title = process.env.title;

var fs = require('fs');

"use strict";
// router.use(favicon(__dirname + '/images/favicon.ico'));
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
	res.render('shop/listing'), {
		layout: 'eshop/blankall'
	}

});
router.get('/signup', function (req, res, next) {
	var messages = req.flash('error');
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	res.render('user/signup', {
		layout: 'eshop/blankall',
		csrfToken: req.csrfToken(),
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
		productChunks1 = [];
		chunkSize = 3;
		chunkSize1=4;
		for (var i = (5 - chunkSize); i < products.length; i += chunkSize) {
			productChunks.push(products.slice(i, i + chunkSize))
		}
		for (var i = (5 - chunkSize1); i < products.length; i += chunkSize1) {
			productChunks1.push(products.slice(i, i + chunkSize1))
		}
		console.log("productChunks"+productChunks[1]);
		console.log("productChunks1"+productChunks1[1]);
		res.render('shop/shop', {
			layout: 'eshop/featured-items.hbs',
			products: productChunks1,
			isLoggedIn: req.isAuthenticated(),
			user: req.user,
		});
	});
});
router.get('/shopa', function (req, res, next) {
	Product.find().sort.toString(function(a, b) {
			return parseFloat(a.price) - parseFloat(b.price);
		
		productChunks = [];
		productChunks1 = [];
		chunkSize = 3;
		chunkSize1=4;
		for (var i = (5 - chunkSize); i < products.length; i += chunkSize) {
			productChunks.push(products.slice(i, i + chunkSize))
		}
		for (var i = (5 - chunkSize1); i < products.length; i += chunkSize1) {
			productChunks1.push(products.slice(i, i + chunkSize1))
		}
		res.render('shop/shop', {
			layout: 'eshop/featured-items.hbs',
			products: productChunks1,
			user: req.user,
		});
	});
});

router.get('/shopd', function (req, res, next) {

	Product.find(function (err, products) {
		productChunks = [];
		productChunks1 = [];
		chunkSize = 3;
		chunkSize1=4;
		for (var i = (5 - chunkSize); i < products.length; i += chunkSize) {
			productChunks.push(products.slice(i, i + chunkSize))
		}
		for (var i = (5 - chunkSize1); i < products.length; i += chunkSize1) {
			productChunks1.push(products.slice(i, i + chunkSize1))
		}
		console.log("productChunks"+productChunks[1]);
		console.log("productChunks1"+productChunks1[1]);
		res.render('shop/shop', {
			layout: 'eshop/featured-items.hbs',
			products: productChunks1,
			user: req.user,
		});
	});
});

// SOCKET API
// router.get('/messages', (req, res) => {
// 	Message.find({},(err, messages)=> {
// 	  res.send(messages);
// 	})
//   })


router.get('/messages', (req, res) => {
	var vendor = req.params.vendor
	console.log("VENDOR ", vendoridmessage);
	Message.find({ form: req.user._id, to: vendoridmessage }, (err, messages) => {
		res.send(messages);
	})
})

router.get('/messagesvendor', (req, res) => {
	Message.distinct('to', (err, response) => {
		//res.send(messages);
		console.log(response);
	})

	console.log(req.user._id);
	Message.find({ $or: [{ to: req.user._id }, { form: req.user._id }] }, (err, messages) => {
		res.send(messages);
	})
})

router.post('/messages', (req, res) => {
	var message = new Message(req.body);
	message.save((err) => {
		if (err)
			sendStatus(500);
		//io.emit('message', req.body);
		res.sendStatus(200);
	})
})


/* GET home page. */
router.get('/', function (req, res, next) {
	var orderid = req.param('orderid');
	var payment_id = req.param('payment_id');
	var payment_request_id = req.param('payment_request_id');
	if (payment_id && payment_request_id) {
		//console.log("TRUE PAYMENT NEED TO GET DATA");

		Insta.getPaymentDetails(payment_request_id, payment_id, function (error, response) {
			if (error) {
				// Some error
			} else {


				if (response.payment_request.status == "Completed") {

					Order.update({ _id: orderid },
						{ "status": "Paid", "paymentId": payment_id }, function (e) {
							if (e) {
								error(e);
								return;
							}

						});
				}
			}
		});



	} else if (req.session.group) {

	}
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	var tutorial = req.params.tutorial;
	if (tutorial == 1) {
		req.session.tutorial = true;
	} else {
		req.session.tutorial = false;
	}
	
	Product.aggregate(
		[
			{ $group: { _id: "$category", count: { $sum: 1 } } },
			{ $lookup: { from: "categories", localField: "_id", foreignField: "slug", as: "details" } },
		],
		function (err, category) {
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
					qryFilter = { "Product_Group": 'SIMPLE' };
					// console.log("Product: " + JSON.stringify(featured));
					Product.find(qryFilter, function (err, featured) {
						// console.log("productChunks: " + JSON.stringify(featured));

						if (err || featured === 'undefined' || featured == null) {
							var errorMsg = req.flash('error', 'unable to find product');
							return res.redirect('/');
						}

						if (!featured) {
							req.flash('error', 'Product is not found.');
							res.redirect('/');
						}
						for(i=0;i<6;i++)
						{
							// console.log("featured"+i+featured[i]);
						}
						
						res.render('shop/eshop', {
							layout: 'eshop/eshop',
							title: title,
							navcats: req.app.get('navcats'),
							navgroups: req.app.get('navgroups'),
							// salegroups: req.app.get('salegroups'),
							// categoryrecord: JSON.stringify(categoryrecord),
							showRecommendations: eval(res.locals.showRecommendations),
							allcategories: res.locals.allcategories,
							keywords: Config.keywords,
							products: featured,
							featured1: featured[0],
							featured2: featured[1],
							featured3: featured[2],
							featured4: featured[3],
							featured5: featured[4],
							featured6: featured[5],
							recommended: docs,
							category: category,
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
						//console.log(category);
					});

				});
		});
});


router.post('/contactform', function (req, res, next) {
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
		from: '"Thrillworld Enquiry" <admin@zo-online.com>', // sender address
		replyTo: '"Thrillworld Confirmation" <admin@zo-online.com>', // sender address
		to: 'sdsameer24@gmail.com', // list of receivers
		subject: 'New Enquiry',
		text: 'new enquiry from '+req.body.name+'Mentioned phonenumber'+req.body.mobile+req.body.email+'And the query is '+req.body.message,
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
		res.render('/home', { msg: 'Email has been sent' });
	});
});

router.get('/hostsignup', function (req, res, next) {
	var messages = req.flash('error');
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	res.render('user/hostsignup', {
		layout: 'eshop/blankall',
		csrfToken: req.csrfToken(),
		"successMsg": successMsg,
		"noMessage": !successMsg,
		"message": messages,
		"errorMsg": messages[0],
		"noErrorMsg": !messages,
		isLoggedIn: req.isAuthenticated()
	});
});


router.post('/hostreg', function (req, res, next) {
	var newUser = new User();
	newUser.email = req.body.email;
	newUser.password = req.body.password;
	newUser.role = req.body.role;
	newUser.first_name = req.body.first_name;
	newUser.last_name = req.body.last_name;
	newUser.addr1 = req.body.addr1;
	newUser.addr2 = req.body.addr2;
	newUser.city = req.body.city;
	newUser.state = req.body.state;
	newUser.zipcode = req.body.zipcode;
	newUser.telephone = req.body.telephone;
	newUser.role = 'vendor';
	newUser.save(function (err, newUser) {
		console.log(" REGISTER HIT");
		if (err) {
			console.log("error REGISTER HIT");
			res.redirect('/hostsignup');
		}
		//console.log('User successfully registered');
		console.log("newuser"+newUser);
		req.flash('success', 'User successfully registered check your mail for vendor access.');
		res.redirect('/user/signin');
	});
});


// // Mobile hostsignup
// router.post('/hostsignup-mobile', function (req, res, next) {
// 	console.log("SIGNUP HIT");

// 	req.session.first_name = req.body.first_name;
// 	req.session.last_name = req.body.last_name;
// 	req.session.addr1 = req.body.addr1;
// 	req.session.city = req.body.city;
// 	req.session.state = req.body.state;
// 	req.session.email = req.body.email;
// 	req.session.telephone = req.body.telephone;
// 	req.session.zipcode = req.body.zipcode;
// 	req.session.role = req.body.role;

// 	//console.log("REGI host");
// 	if (req.body.email && req.body.password && req.body.first_name && req.body.last_name && req.body.addr1 && req.body.city && req.body.addr2 && req.body.state && req.body.zipcode && req.body.telephone) {
// 		var newUser = new User();
// 		console.log("REGI host AGAIN");
// 		newUser.email = req.body.email;
// 		// newUser.password = newUser.encryptPassword(password);
// 		newUser.password = req.body.password;
// 		newUser.role = req.body.role;
// 		newUser.first_name = req.body.first_name;
// 		newUser.last_name = req.body.last_name;
// 		newUser.addr1 = req.body.addr1;
// 		newUser.addr2 = req.body.addr2;
// 		newUser.city = req.body.city;
// 		newUser.state = req.body.state;
// 		newUser.zipcode = req.body.zipcode;
// 		newUser.telephone = req.body.telephone;
// 		newUser.role = 'vendor';
// 		newUser.save(function (err, result) {
// 			if (err) {
// 				res.send({
// 					message: "Error",
// 					status: false
// 				});

// 				//res.redirect('/hostsignup');
// 				//console.log('User unsuccessfully registered');
// 			}
// 			res.send({
// 				message: "User successfully registered",
// 				status: true
// 			});
// 			console.log('User successfully registered');
// 			console.log(newUser);
// 			req.flash('success', 'User successfully registered check your mail for vendor access.');
// 			res.redirect('/vendor');
// 		});
// 	} else {
// 		res.send({
// 			message: "Error",
// 			status: false
// 		});
// 	}
// });



/* MOBILE GET home page. */
router.get('/group-mobile/:slug?', function (req, res, next) {
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
				//////console.log("Error finding group " + group_slug);
				req.flash('error', 'Cannot find group');
				res.send({
					message: "Error",
					status: false
				});

			}
			if (!products) {
				//////console.log("Error finding group " + group_slug);
				req.flash('error', 'Cannot find group');
				res.send({
					message: "Error",
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


/*  GET home page. */
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
				//////console.log("Error finding group " + group_slug);
				req.flash('error', 'Cannot find group');
				return res.redirect('/');
			}
			if (!products) {
				//////console.log("Error finding group " + group_slug);
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
			//////console.log("Product-unwound: " + JSON.stringify(results));
			//////console.log("Err-unwound: " + JSON.stringify(err));
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
							//////console.log("Error finding category " + category_slug);
							req.flash('error', 'Cannot find category');
							return res.redirect('/');
						}
						if (!category) {
							//////console.log("Error finding category " + category_slug);
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
									//////console.log("Error: " + err.message);
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

router.get('/frontpage', function (req, res, next) {

	qryFilter = { "Product_Group": 'SIMPLE' };
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];


	Product.find(qryFilter, function (err, product) {
		if (err || product === 'undefined' || product == null) {
			// replace with err handling
			var errorMsg = req.flash('error', 'unable to find product');
		}

		if (!product) {
			req.flash('error', 'No Products found.');
		}
       for(i=0;i<product.length;i++){
       var feat=product;
	   }
	   console.log("featured"+feat);
		res.render('/', {
			layout: 'eshop/blank',

			user: req.user,
			product: product,
			feat:feat,
			errorMsg: errorMsg,
			noErrorMsg: !errorMsg
		});
	});
});


router.get('/category/:slug?', function (req, res, next) {
	var group_slug = req.params.slug;
	req.session.group = req.params.slug; // Save Group for later
	var q = req.query.q;
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	if (group_slug == '' || !group_slug) {
		var group_search = {}
	} else {
		var group_search = {
			category: group_slug
		}
	}
	Product.find(
		group_search,
		function (err, products) {
			if (err) {
				//////console.log("Error finding group " + group_slug);
				req.flash('error', 'Cannot find group');
				return res.redirect('/');
			}
			if (!products) {
				//////console.log("Error finding group " + group_slug);
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
				layout: 'eshop/featured-items.hbs',
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



router.post('/add-to-cart', isLoggedIn, function (req, res, next) {
	var theId = new ObjectId(req.user._id);
	User.findOneAndUpdate({
		_id: theId
	}, {
			// $addToSet: {
			// 	"productId": req.body.productId
			// }
			$addToSet: {
				'product': {
					"productId": req.body.productId,
					"name": req.body.name,
					"price": req.body.price,
					"imagePath": req.body.imagePath

				}
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
				action: 'wishlist',
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
					//////console.log("Error: " + err.message);
					return -1;
				}
			})
		});
	res.redirect('/wishlist');
});

// router.post('/empty-cart', isLoggedIn, function (req, res, next) {
// 	console.log('user' + req.body.user + ',product' + req.body.productId);
// 	const slug = req.body.productId;
// 	const user = req.body.user;
// 	User.findOne({ _id: user }, function (err, model) {
// 		console.log("model:"+model);
// 		model.product.pull({ productId: slug });
// 		model.save(function (err, model) {

// 			meanlogger.log('trash', 'Emptied cart', req.user);
// 			res.redirect('/wishlist');
// 		});
// 	});
// });
router.post('/empty-cart', isLoggedIn, function(req, res, next) {
	console.log("user" + req.body.user + ",product" + req.body.productId);
	slug = mongoose.Types.ObjectId(req.body.productId);
	user = req.body.user;
	User.update({ _id: user }, { $pull: { product: { _id: slug } } }, function(err, model) {
		if(err){
			console.log(err);
		}
	  console.log("updated"+slug);
	  meanlogger.log('trash', 'Emptied cart', req.user);
	  res.redirect('/wishlist');
	})
  });

router.get('/reduce-qty/:id/', function (req, res, next) {
	var productId = req.params.id;
	// if we have a cart, pass it - otherwise, pass an empty object
	var cart = new cart(req.session.cart ? req.session.cart : {});
	Product.findById(productId, function (err, product) {
		if (err) {
			// replace with err handling
			return res.redirect('/');
		}

		if (!product) {
			//res.render('shop/wishlist',{products: null, errorMsg: "Product not found.",noErrorMsg:0})
			req.flash('error', 'Cannot locate product');
			return res.redirect('/');
		}
		cart.reduce(product, product.id, product.price);
		req.session.cart = cart; // store cart in session
		res.redirect('/wishlist');
	});
});


// Mobile Reduce the qty
router.get('/reduce-qty-mobile/:id/', function (req, res, next) {
	var productId = req.params.id;
	// if we have a cart, pass it - otherwise, pass an empty object
	var cart = new cart(req.session.cart ? req.session.cart : {});
	Product.findById(productId, function (err, product) {
		if (err) {
			// replace with err handling
			res.send({
				message: "Some error occurred",
				status: false
			});
		}

		if (!product) {
			res.send({
				message: "Cannot locate product",
				status: false
			});
		}
		cart.reduce(product, product.id, product.price);
		req.session.cart = cart; // store cart in session

		res.send({
			message: "Success",
			status: true
		});
	});
});


router.get('/wishlist', isLoggedIn, function (req, res, next) {
	qryFilter = { "_id": req.user._id };
	User.find(qryFilter, function (err, user) {
		console.log(req.user._id);

		res.render('shop/wishlist', {
			layout: 'eshop/blankall',
			user: user,

		});
	});

});

router.post('/delete-product', function (req, res, next) {
	successMsg = req.flash('success')[0];
	errorMsg = req.flash('error')[0];
	var order_id = req.body._id;

	// User.update(
	// 	{ _id: id },
	// 	{ $pull:  { productId:  } } 
	//   );

})
// Mobile Shoppng cart
router.get('/wishlist-mobile', isLoggedIn, function (req, res, next) {
	if (res.locals.needsAddress || req.user.addr1 === 'undefined' || req.user.addr1 == null) {
		res.send({
			message: "Please complete your profile with your address information",
			status: false
		});
	}
	if (!req.session.cart) {
		res.send({
			message: "Shopping cart empty",
			status: false
		});
	}
	var cart = new cart(req.session.cart);
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

			res.send({
				message: "error",
				status: false
			});
		}
		res.send({
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

			status: true
		});
	})
});

router.post('/update_shipping', isLoggedIn, function (req, res, next) {
	if (!req.session.cart) {
		return res.redirect('/wishlist');
	}
	errorMsg = req.flash('error')[0];
	successMsg = req.flash('success')[0];
	var cart = new cart(req.session.cart);
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

// Mobile Updating Shipping Mobile
router.post('/update_shipping-mobile', isLoggedIn, function (req, res, next) {
	if (!req.session.cart) {
		res.send({
			message: "Some error occurred",
			status: false
		});
	}

	var cart = new cart(req.session.cart);


	res.send({
		products: cart.generateArray(),
		totalPrice: cart.totalPrice.toFixed(2),
		user: req.user,
		status: true
	});
});

router.get('/checkout/:slug3', isLoggedIn, function (req, res, next) {
	console.log("checkout");
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	var slug3 = req.params.slug3;
	console.log(req.user);
	qryFilter = { "_id": slug3 };
	meanlogger.log('shopping-cart', 'Viewed checkout', req.user);
	Product.find(qryFilter, function (err, product) {
		console.log(product);
		if (err) {
			req.flash('error', "An error has occurred - " + err.message);
			return res.redirect('/');
		}
		res.render('shop/checkout', {
			layout: 'eshop/blankall',
			product: product,
		});
	});
});
router.post('/addtocart', function (req, res, next) {
	var cartlist=[];
	addtocart = {
		productId: req.body.productId,
		product_name: req.body.pname,
		product_price: req.body.price,
		product_tprice: req.body.subtotal,
		product_qty: req.body.product_qty,
		vendor_id: req.body.vendor_id,
		ticket_name: req.user.first_name,
		ticket_email: req.user.email,
		imagePath:req.body.imagePath,
		checkin:req.body.arrival,
		checkout:req.body.depart,
	}
	console.log(addtocart);
	cartlist.push(addtocart);
	console.log("cartlist"+cartlist);
	var addtocart = new Acart({
		user: {
			id: req.user._id,
			first_name: req.user.first_name,
			last_name: req.user.last_name,
			email: req.user.email,
			telephone: req.user.telephone
		},
		cart: cartlist,
		userid:req.user._id,
		checkin: req.body.arrival,
		checkout: req.body.depart,
		status: 'pending',
		total: req.body.price
	});
	addtocart.save(function (err, orderdata) {
		if (err) {
			console.log("1196Error: " + err.message)
			req.flash('error', 'Unable to Add to cart... ' + err.message);
			res.redirect('/');
		}
		req.flash('success', "Added to Cart!");
		console.log("success1193");
		});
		return res.redirect('/cart');
});
router.get('/cart', isLoggedIn, function (req, res, next) {
	console.log("user1200"+req.user._id);
	qryFilter = { "userid": req.user._id };
	Acart.find(qryFilter, function (err, cart) {
		console.log("cart1200"+cart);
		var carts=JSON.stringify(cart)
		res.render('shop/cart', {
			layout: 'eshop/blankall',
			cart:cart,
			carts:carts,
			length:cart.length,
		});
	});
});
/* GET cart page. */
router.post('/delete-carta',function (req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
	var cart = req.body._id;
	console.log("cartid:"+cart);
    meanlogger.log("trash", "Deleting cart item " + cart, req.user);

    Acart.remove({ _id: cart }, function (err) {
        return res.redirect('/cart');
    });
});

router.post('/update-carta',function (req, res, next) {
    successMsg = req.flash('success')[0];
    errorMsg = req.flash('error')[0];
	var cart = req.body._id;
    
    Acart.findOne({ _id: cart }, function (err, order) {
        //////console.log("Order: " + order);
        if (err) {
            res.send(500, 'Error deleting order.');
        }
        order.receipt_status = status;
        order.note = note;
        order.receiver = receiver;
        // order.save(function (err) {
        //     if (err)
        //         //////console.log("ERROR: " + err.message);
        // })
        return res.redirect('/admin/orders');
    })
})




router.post('/cartcreate', function (req, res, next) {

	var orders = [];
	console.log("cart1217"+req.body.cart);
	console.log("cart1217"+req.body.length);
	carts=JSON.parse(req.body.cart);
	var length=req.body.length;
	for(i=0;i<length;i++){
		console.log("cart1217"+carts[i]._id);
		console.log("cart1217"+carts[i].cart[0].product_name);
	order = {
		productId: carts[i].cart[0].productId,
		product_name: carts[i].cart[0].product_name,
		product_price: carts[i].cart[0].product_price,
		product_qty: carts[i].cart[0].product_qty,
		vendor_id: req.body.vendor_id,
		paidBy: 'instamojo',
		ticket_name: carts[i].cart[0].ticket_name,
		ticket_email: carts[i].cart[0].ticket_email,

	}
	orders.push(order);
}
	var number = req.user.telephone;
	//console.log(number);
	// const text = req.body.text;
	const text = "Booking successfull Thank You, Thrillworld";
	//console.log("NUMBRER" + number);
	//console.log("NUMBRER" + number[0] + number[1]);
	//console.log("TEXT" + text);

	if (number.length <= 10) {
		number = "91" + number;
		//console.log("NEW" + number);
	}

	console.log(req.body.arrival);
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
		checkin: req.body.arrival,
		checkout: req.body.depart,
		status: 'pending',
		total: req.body.price
	});
	order.save(function (err, orderdata) {
		if (err) {
			console.log("Error: " + err.message)
			req.flash('error', 'Unable to save order... ' + err.message);
			res.redirect('/');
		}

		req.flash('success', "Order Successful!");
		//console.log("HERE REDIRECT");
		// Create the new invoice
		//''''''''''''''''''''''''''''''''pdf invoice..................................
		console.log("create new invoice");
		let myInvoice = new Invoice({
			config: {
				template: "public/template/index.html"
				, tableRowBlock: "public/template/blocks/row.html"
			}
			, data: {
				currencyBalance: {
					main: 1
					, secondary: 3.67
				}
				, invoice: {
					number: {
						series: "PREFIX"
						, separator: "-"
						, id: 1
					}
					, date: "01/02/2014"
					, dueDate: "11/02/2014"
					, explanation: "Thank you for your business!"
					, currency: {
						main: "XXX"
						, secondary: "ZZZ"
					}
				}
				, tasks: [
					{
						description: "Some interesting task"
						, unit: "Hours"
						, quantity: 5
						, unitPrice: 2
					}
					, {
						description: "Another interesting task"
						, unit: "Hours"
						, quantity: 10
						, unitPrice: 3
					}
					, {
						description: "The most interesting one"
						, unit: "Hours"
						, quantity: 3
						, unitPrice: 5
					}
				]
			}
			, seller: {
				company: "My Company Inc."
				, registrationNumber: "F05/XX/YYYY"
				, taxId: "00000000"
				, address: {
					street: "The Street Name"
					, number: "00"
					, zip: "000000"
					, city: "Some City"
					, region: "Some Region"
					, country: "Nowhere"
				}
				, phone: "+40 726 xxx xxx"
				, email: "me@example.com"
				, website: "example.com"
				, bank: {
					name: "Some Bank Name"
					, swift: "XXXXXX"
					, currency: "XXX"
					, iban: "..."
				}
			}
			, buyer: {
				company: "Another Company GmbH"
				, taxId: "00000000"
				, address: {
					street: "The Street Name"
					, number: "00"
					, zip: "000000"
					, city: "Some City"
					, region: "Some Region"
					, country: "Nowhere"
				}
				, phone: "+40 726 xxx xxx"
				, email: "me@example.com"
				, website: "example.com"
				, bank: {
					name: "Some Bank Name"
					, swift: "XXXXXX"
					, currency: "XXX"
					, iban: "..."
				}
			}
		});
		// Render invoice as HTML and PDF
		myInvoice.toPdf('public/invoice/' + req.user._id + 'my-invoice.pdf', (err, data) => {
			if (err) {
				console.log("ERROR in saving pdf" + err);
			}
			console.log("Saved pdf file");
		});
		//''''''''''''''''end invoice.......................................
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

				//console.log("ERROR" + error);
				return
				//////console.log(error);
			}


			//console.log("INFo" + info);
			//console.log('Message sent: %s', info.messageId);
			//console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
			req.flash('success', "SENT MAIL, KINDLY CHECK!");
			//	res.render('contact', { msg: 'Email has been sent' });
		});
		// end of order comnfirmation mail sending  ..........................................
		// order comnfirmation sms sending  ..........................................
		// .......................................{{nexmo commented}}........................................................................................

		// Init Nexmo
		// const nexmo = new Nexmo({
		// 	apiKey: '38d2edbc',
		// 	apiSecret: 'grzR4xHCJDGhDqi2'
		// }, { debug: true })
		// nexmo.message.sendSms(
		// 	'917795565771', number, text, { type: 'unicode' },
		// 	(err, responseData) => {
		// 		if (err) {
		// 			//console.log("SMS" + err);
		// 		} else {
		// 			console.dir(responseData);
		// 			// Get data from response
		// 			const data = {
		// 				id: responseData.messages[0]['your booking successful'],
		// 				number: responseData.messages[0]['number']
		// 			}

		// 			// Emit to the client
		// 			//	io.emit('smsStatus', data);
		// 		}
		// 	}
		// );
		// end of order comnfirmation sms sending  ..........................................

		var data = new Insta.PaymentData();

		data.purpose = "Test";            // REQUIRED
		data.amount = "100";                  // REQUIRED
		data.currency = 'INR';
		data.buyer_name = req.user.first_name;
		data.email = req.user.email;
		data.phone = req.user.telephone;
		data.send_sms = 'True';
		data.send_email = 'True';
		data.allow_repeated_payments = 'False';
		data.setRedirectUrl("http://localhost:3000/?orderid=" + orderdata.id + "&");

		Insta.createPayment(data, function (error, response) {
			if (error) {
				// some error
				console.log("instamojo ERROR" + error);
			} else {
				// Payment redirection link at response.payment_request.longurl

				response = JSON.parse(response);

				////console.log(response.success);
				console.log("instamojo SUCESS" + response);
				// console.log(response.payment_request.longurl);
				console.log("REQUIRED URL" + JSON.stringify(response));
				console.log(response['payment_request']);
				//	//console.log(JSON.parse(response['payment_request']));
				return res.redirect(response.payment_request.longurl);

			}
		});
		// return res.redirect('/');
	})
});
/* GET cart page. */
router.get('/checkout-mobile', isLoggedIn, function (req, res, next) {

	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];

	if (!req.session.cart) {
		res.send({
			message: "Some error occurred",
			status: false
		});
	}
	var shipping_flag = req.body.shipping_flag;

	var cart = new cart(req.session.cart);
	//meanlogger.log('shopping-cart', 'Viewed checkout', req.user);
	res.send({
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

	var cart = new cart(req.session.cart);
	console.log(cart);
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
			return res.redirect('/wishlist');
		}
		returnObject = {
			errorMsg: errors,
			noErrorMsg: false,
			noMessage: true
		};
		req.flash('error', 'Invalid contact information.  Please ensure that you have an email and telephone number.');
		return res.redirect('/wishlist');
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
						//////console.log("unable to update user telephone");
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
						//////console.log("unable to update user telephone");
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
			//////console.log("Unable to calculate shipping " + err);
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
					//////console.log(err);
					res.redirect('/');
				}
				if (!req.session.cart) {
					return res.redirect('/wishlist');
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



router.post('/payment', function (req, res, next) {
	var orders = [];

	order = {
		productId: req.body.productId,
		product_name: req.body.pname,
		product_price: (req.body.price) * 30 / 100,
		product_qty: req.body.adult,
		paidBy: 'instamojo',
		ticket_name: req.user.first_name,
		ticket_email: req.user.email,
		// option: option,
		// category: products[i].item.category,
		// code: products[i].item.code,
		// vendor_id: products[i].item.vendor_id,
		// date: date
	}
	console.log(order);
	orders.push(order);

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

			console.log("ERROR2616" + error);
			return
			//////console.log(error);
		}


		//console.log("INFo" + info);
		//console.log('Message sent: %s', info.messageId);
		//console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		req.flash('success', "SENT MAIL, KINDLY CHECK!");
		//	res.render('contact', { msg: 'Email has been sent' });
	});
	// end of order comnfirmation mail sending  ..........................................
	// order comnfirmation sms sending  ..........................................
	var number = req.user.telephone;
	//console.log(number);
	// const text = req.body.text;
	const text = "Booking successfull Thank You, Thrillworld";
	//console.log("NUMBRER" + number);
	//console.log("NUMBRER" + number[0] + number[1]);
	//console.log("TEXT" + text);

	if (number.length <= 10) {
		number = "91" + number;
		//console.log("NEW" + number);
	}
	// .......................................{{nexmo commented}}........................................................................................

	// Init Nexmo
	const nexmo = new Nexmo({
		apiKey: '38d2edbc',
		apiSecret: 'grzR4xHCJDGhDqi2'
	}, { debug: true })
	nexmo.message.sendSms(
		'917795565771', number, text, { type: 'unicode' },
		(err, responseData) => {
			if (err) {
				//console.log("SMS" + err);
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

	var total = (req.body.price) * 30 / 100
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
		checkin: req.body.arrival,
		checkout: req.body.depart,
		status: 'pending',
		total: total
	});
	order.save(function (err, orderdata) {
		if (err) {
			console.log("Error: " + err.message)
			req.flash('error', 'Unable to save order... ' + err.message);
			res.redirect('/');
		}

		req.flash('success', "Order Successful!");
		//console.log("HERE REDIRECT");

		var data = new Insta.PaymentData();

		data.purpose = "Test";            // REQUIRED
		data.amount = (req.body.price) * 30 / 100;                  // REQUIRED
		data.currency = 'INR';
		data.buyer_name = req.user.first_name;
		data.email = req.user.email;
		data.phone = req.user.telephone;
		data.send_sms = 'True';
		data.send_email = 'True';
		data.allow_repeated_payments = 'False';
		data.setRedirectUrl("http://localhost:3000/?orderid=" + orderdata.id + "&");

		Insta.createPayment(data, function (error, response) {
			if (error) {
				// some error
				console.log("instamojo ERROR" + error);
			} else {
				// Payment redirection link at response.payment_request.longurl

				response = JSON.parse(response);

				////console.log(response.success);
				console.log("instamojo SUCESS" + response);
				// console.log(response.payment_request.longurl);
				console.log("REQUIRED URL" + JSON.stringify(response));
				console.log(response['payment_request']);
				//	//console.log(JSON.parse(response['payment_request']));
				return res.redirect(response.payment_request.longurl);

			}
		});
		// return res.redirect('/');
	})

});

router.post('/create', function (req, res, next) {

	var orders = [];

	order = {
		productId: req.body.productId,
		product_name: req.body.pname,
		product_price: req.body.price,
		product_qty: req.body.adult,
		vendor_id: req.body.vendor_id,
		paidBy: 'instamojo',
		ticket_name: req.user.first_name,
		ticket_email: req.user.email,
		checkin: req.body.arrival,
		checkout: req.body.depart,
	}
	console.log(order);
	orders.push(order);

	var number = req.user.telephone;
	//console.log(number);
	// const text = req.body.text;
	const text = "Booking successfull Thank You, Thrillworld";
	//console.log("NUMBRER" + number);
	//console.log("NUMBRER" + number[0] + number[1]);
	//console.log("TEXT" + text);

	if (number.length <= 10) {
		number = "91" + number;
		//console.log("NEW" + number);
	}

	console.log(req.body.arrival);
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
		total: req.body.price
	});
	order.save(function (err, orderdata) {
		if (err) {
			console.log("Error: " + err.message)
			req.flash('error', 'Unable to save order... ' + err.message);
			res.redirect('/');
		}

		req.flash('success', "Order Successful!");
		//console.log("HERE REDIRECT");
		// Create the new invoice
		//''''''''''''''''''''''''''''''''pdf invoice..................................
		console.log("create new invoice");
		let myInvoice = new Invoice({
			config: {
				template: "public/template/index.html"
				, tableRowBlock: "public/template/blocks/row.html"
			}
			, data: {
				currencyBalance: {
					main: 1
					, secondary: 3.67
				}
				, invoice: {
					number: {
						series: "PREFIX"
						, separator: "-"
						, id: 1
					}
					, date: "01/02/2014"
					, dueDate: "11/02/2014"
					, explanation: "Thank you for your business!"
					, currency: {
						main: "XXX"
						, secondary: "ZZZ"
					}
				}
				, tasks: [
					{
						description: "Some interesting task"
						, unit: "Hours"
						, quantity: 5
						, unitPrice: 2
					}
					, {
						description: "Another interesting task"
						, unit: "Hours"
						, quantity: 10
						, unitPrice: 3
					}
					, {
						description: "The most interesting one"
						, unit: "Hours"
						, quantity: 3
						, unitPrice: 5
					}
				]
			}
			, seller: {
				company: "My Company Inc."
				, registrationNumber: "F05/XX/YYYY"
				, taxId: "00000000"
				, address: {
					street: "The Street Name"
					, number: "00"
					, zip: "000000"
					, city: "Some City"
					, region: "Some Region"
					, country: "Nowhere"
				}
				, phone: "+40 726 xxx xxx"
				, email: "me@example.com"
				, website: "example.com"
				, bank: {
					name: "Some Bank Name"
					, swift: "XXXXXX"
					, currency: "XXX"
					, iban: "..."
				}
			}
			, buyer: {
				company: "Another Company GmbH"
				, taxId: "00000000"
				, address: {
					street: "The Street Name"
					, number: "00"
					, zip: "000000"
					, city: "Some City"
					, region: "Some Region"
					, country: "Nowhere"
				}
				, phone: "+40 726 xxx xxx"
				, email: "me@example.com"
				, website: "example.com"
				, bank: {
					name: "Some Bank Name"
					, swift: "XXXXXX"
					, currency: "XXX"
					, iban: "..."
				}
			}
		});
		// Render invoice as HTML and PDF
		myInvoice.toPdf('public/invoice/' + req.user._id + 'my-invoice.pdf', (err, data) => {
			if (err) {
				console.log("ERROR in saving pdf" + err);
			}
			console.log("Saved pdf file");
		});
		//''''''''''''''''end invoice.......................................
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

				//console.log("ERROR" + error);
				return
				//////console.log(error);
			}


			//console.log("INFo" + info);
			//console.log('Message sent: %s', info.messageId);
			//console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
			req.flash('success', "SENT MAIL, KINDLY CHECK!");
			//	res.render('contact', { msg: 'Email has been sent' });
		});
		// end of order comnfirmation mail sending  ..........................................
		// order comnfirmation sms sending  ..........................................
		// .......................................{{nexmo commented}}........................................................................................

		// Init Nexmo
		const nexmo = new Nexmo({
			apiKey: '38d2edbc',
			apiSecret: 'grzR4xHCJDGhDqi2'
		}, { debug: true })
		nexmo.message.sendSms(
			'917795565771', number, text, { type: 'unicode' },
			(err, responseData) => {
				if (err) {
					//console.log("SMS" + err);
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

		var data = new Insta.PaymentData();

		data.purpose = "Test";            // REQUIRED
		data.amount = "100";                  // REQUIRED
		data.currency = 'INR';
		data.buyer_name = req.user.first_name;
		data.email = req.user.email;
		data.phone = req.user.telephone;
		data.send_sms = 'True';
		data.send_email = 'True';
		data.allow_repeated_payments = 'False';
		data.setRedirectUrl("http://localhost:3000/?orderid=" + orderdata.id + "&");

		Insta.createPayment(data, function (error, response) {
			if (error) {
				// some error
				console.log("instamojo ERROR" + error);
			} else {
				// Payment redirection link at response.payment_request.longurl

				response = JSON.parse(response);

				////console.log(response.success);
				console.log("instamojo SUCESS" + response);
				// console.log(response.payment_request.longurl);
				console.log("REQUIRED URL" + JSON.stringify(response));
				console.log(response['payment_request']);
				//	//console.log(JSON.parse(response['payment_request']));
				return res.redirect(response.payment_request.longurl);

			}
		});
		// return res.redirect('/');
	})
});



// create reusable transporter object using the default SMTP transport



// paypal.payment.create(create_payment, function(err, payment) {
// 	if (err) {
// 		//////console.log("ERROR HIT");
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
// 				//////console.log('error: ' + err.message);
// 				return res.redirect('/wishlist');
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
// 					//////console.log("Error: " + err.message)
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
					//////console.log("Error: " + err.message);
					return -1;
				}
			})
		});
	res.redirect('/');
});

// Mobile Likes
router.get('/like-mobile/:id', isLoggedIn, function (req, res, next) {
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
					res.send({
						message: "Some error occurred",
						status: false
					});
				}
			})
		});
	res.send({
		message: "Success Like",
		status: true
	});
});




router.post('/reviews', isLoggedIn, function (req, res, next) {
	var pid = req.body.productId;
	console.log("product2395: " + pid); 
	review = new review({
		review: req.body.review,
		user: req.body.name,
		productid: req.body.productid,
		rating: req.body.rating,
	});
	review.save(function (err) {
		if (err) {
			console.log("/product/{{pid}}"); 
			req.flash('error', 'Error: ' + err.message);
			return res.redirect('/product/{{pid}}');
		}
		// res.flash('thanks for your feedback');
		console.log("product: " + pid);       
		return res.redirect('/product/{{pid}}');
	});
});


router.get('/execute', function (req, res, next) {
	//console.log("Completing Order: " + res.locals.fromEmail);
	var paymentId = req.query.paymentId;
	var token = req.query.token;
	var PayerID = req.query.PayerID

	var details = {
		"payer_id": PayerID
	};
	var cart = new cart(req.session.cart);
	products = cart.generateArray();
	var payment = paypal.payment.execute(paymentId, details, function (error, payment) {
		if (error) {
			//////console.log(error);
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
											//////console.log("Error: " + err.message);
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
												//////console.log("Error updating product with users bought: " + JSON.stringify(err));
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
												//////console.log("Unable to update user - " + err.message);
												return -1;
											}
											Product.findOneAndUpdate({
												_id: product.item._id,
												"inventory.disableAtZero": true
											}, {
													'$inc': { 'inventory.onHand': -1 },
												}, function (err, product) {
													if (err) {
														//////console.log("Problem decrementing inventory.");
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
											// 		//////console.log(err.message);
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
											// 			//////console.log(err.message);
											// 		}
											// 	});
											// } else {
											// 	//////console.log("fromEmail not set - no email verification will be sent.");
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
						//////console.log("Error fetching categories");
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
								layout: 'eshop/featured-items.hbs',
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

// Mobile Search
router.post('/search-mobile', function (req, res, next) {
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
			// req.flash('error', 'An error has occurred - ' + err.message);
			// return res.redirect('/');

			res.send({
				message: "An error has occurred - ",
				status: false
			});
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
						res.send({
							message: "Some error occurred",
							status: false
						});
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
								res.send({
									message: "Some error occurred",
									status: false
								});
							}
							if (!results || !results.length) {


								res.send({
									message: "No products found for search string.",
									status: false
								});
							}
							productChunks = [];
							chunkSize = 4;
							for (var i = (4 - chunkSize); i < results.length; i += chunkSize) {
								productChunks.push(results.slice(i, i + chunkSize))
							}
							if (req.user) {
								meanlogger.log('search', 'Searched for  ' + q, req.user);
							}
							// res.render('shop/eshop', {
							// 	layout: 'eshop/blank',
							// 	title: title,
							// 	showRecommendations: eval(res.locals.showRecommendations),
							// 	keywords: Config.keywords,
							// 	products: productChunks,
							// 	q: q,
							// 	// recommended: docs,
							// 	Product_Group: Product_Group,
							// 	user: req.user,
							// 	navcats: navcats,
							// 	allcats: navcats,
							// 	errorMsg: errorMsg,
							// 	noErrorMsg: !errorMsg,
							// 	successMsg: successMsg,
							// 	noMessage: !successMsg,
							// 	viewTour: viewTour,
							// 	isLoggedIn: req.isAuthenticated()
							// });

							res.send(productChunks);


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
var vendoridmessage;

router.get('/product/:slug3', function (req, res, next) {
	var slug3 = req.params.slug3;
	qryFilter = { "_id": slug3 };
	qryFilter1 = { "productid": slug3 };
	var user = req.user._id || "Guest";
	console.log(user);
	Product.find(qryFilter, function (err, product) {
		review.find(qryFilter1, function (err, reviews) {
			console.log(reviews);
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
					return -1;
				}
				recommendations.GetRecommendations(product, function (err, recommendations) {
					vendoridmessage = product[0].vendor_id;
					console.log("vendoridmessage", vendoridmessage);
					if (err) {
						req.flash('error', "An error has occurred - " + err.message);
						return res.redirect('/');
					}
					res.render('shop/product', {
						layout: 'eshop/blankall',
						recommendations: recommendations,
						// username: username,
						user: user,
						reviews: reviews,
						product: product,
						customer: req.user,
					});
				});
			});
		});
	});
});

router.get('/product1/:slug3', function (req, res, next) {
	var slug3 = req.params.slug3;
	qryFilter = { "_id": slug3 };
	var user = 'Guest';
	console.log(user);
	Product.find(qryFilter, function (err, product) {
		review.find({ "productid": slug3 }, function (err, reviews) {
			console.log("reviewspro1"+reviews);
			event = new Event({
				namespace: 'products',
				person: {
					id: 'Guest',
					first_name: 'guest',
					last_name: 'guest',
					email: 'guest',
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
					return -1;
				}
				recommendations.GetRecommendations(product, function (err, recommendations) {
					vendoridmessage = product[0].vendor_id;
					console.log("vendoridmessage", vendoridmessage);
					if (err) {
						req.flash('error', "An error has occurred - " + err.message);
						return res.redirect('/');
					}
					res.render('shop/product', {
						layout: 'eshop/blankall',
						recommendations: recommendations,
						// username: username,
						user: user,
						reviews: reviews,
						product: product,
						customer: 'guest',

					});
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
// ........................................Mobile Apis..............................................

// Mobile Create
router.post('/create-mobile', function (req, res, next) {
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
		// req.flash('error', 'Invalid contact or shipping information.  Please ensure that you have an email and telephone number.');
		// return res.redirect('/checkout');

		res.send({
			message: "Invalid contact or shipping information.  Please ensure that you have an email and telephone number.",
			status: false
		});
	}
	if (!req.session.cart) {


		res.send({
			message: "Session Exp",
			status: false
		});
	}


	var cart = new cart(req.session.cart);
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
			vendor_id: products[i].item.vendor_id,
			date: date
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

			//console.log("ERROR" + error);
			return //////console.log(error);
		}


		//console.log("INFo" + info);
		//console.log('Message sent: %s', info.messageId);
		//console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		// req.flash('success', "SENT MAIL, KINDLY CHECK!");
		res.send({
			message: "SENT MAIL, KINDLY CHECK!",
			status: true
		});
		//	res.render('contact', { msg: 'Email has been sent' });
	});
	// end of order comnfirmation mail sending  ..........................................
	// order comnfirmation sms sending  ..........................................
	var number = req.user.telephone;
	//console.log(number);
	// const text = req.body.text;
	const text = "Booking successfull Thank You, Thrillworld";
	//console.log("NUMBRER" + number);
	//console.log("NUMBRER" + number[0] + number[1]);
	//console.log("TEXT" + text);

	if (number.length <= 10) {
		number = "91" + number;
		//console.log("NEW" + number);
	}
	// .......................................{{nexmo commented}}........................................................................................

	// Init Nexmo
	// const nexmo = new Nexmo({
	// 	apiKey: '38d2edbc',
	// 	apiSecret: 'grzR4xHCJDGhDqi2'
	// }, { debug: true })
	// nexmo.message.sendSms(
	// 	'917795565771', number, text, { type: 'unicode' },
	// 	(err, responseData) => {
	// 		if (err) {
	// 			//console.log("SMS" + err);
	// 		} else {
	// 			console.dir(responseData);
	// 			// Get data from response
	// 			const data = {
	// 				id: responseData.messages[0]['your booking successful'],
	// 				number: responseData.messages[0]['number']
	// 			}

	// 			// Emit to the client
	// 			//	io.emit('smsStatus', data);
	// 		}
	// 	}
	// );
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
	order.save(function (err, orderdata) {
		if (err) {
			//////console.log("Error: " + err.message)
			//req.flash('error', 'Unable to save order... ' + err.message);
			//res.redirect('/');

			res.send({
				message: "Unable to save order...",
				status: false
			});
		}

		//req.flash('success', "Order Successful!");
		//console.log("HERE REDIRECT");



		var data = new Insta.PaymentData();

		data.purpose = "Test";            // REQUIRED
		data.amount = parseFloat(cart.grandTotal);                  // REQUIRED
		data.currency = 'INR';
		data.buyer_name = req.user.first_name;
		data.email = req.user.email;
		data.phone = req.user.telephone;
		data.send_sms = 'True';
		data.send_email = 'True';
		data.allow_repeated_payments = 'False';
		data.setRedirectUrl("http://localhost:3000/?orderid=" + orderdata.id + "&");

		Insta.createPayment(data, function (error, response) {
			if (error) {
				// some error
				//console.log("instamojo ERROR" + error);
				res.send({
					message: "instamojo ERROR.",
					status: false
				});
			} else {
				// Payment redirection link at response.payment_request.longurl

				response = JSON.parse(response);

				res.send({
					message: "Order Successful",
					paymentdetails: response,
					//payment_url:response.payment_request.longurl,
					status: true
				});

			}
		});
		// return res.redirect('/');
	})
});

// Get Shop Mobile
router.get('/getallevents', function (req, res, next) {

	Product.find(function (err, products) {
		productChunks = [];
		chunkSize = 5;
		for (var i = (5 - chunkSize); i < products.length; i += chunkSize) {
			productChunks.push(products.slice(i, i + chunkSize))
		}

		res.send(products);
	});
});


router.post('/geteventdetails', function (req, res, next) {
	//console.log("events");
	var slug3 = req.params.slug3;
	qryFilter = { "_id": slug3 };

	// if we have a cart, pass it - otherwise, pass an empty object
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	Product.find(qryFilter, function (err, product) {
		// //console.log("Product: " + JSON.stringify(product));

		if (err || product === 'undefined' || product == null) {
			// replace with err handling
			res.send({
				message: "Error",
				status: false
			});
		}

		if (!product) {
			res.send({
				message: "no such event",
				status: false
			});
		} else {
			req.flash('success');
			res.send(product);
		}

	});
});
// .................................................

// Mobile Checkout
router.post('/checkout-mobile', function (req, res, next) {
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
	var cart = new cart(req.session.cart);
	if (shipping_flag && process.env.enableShipping) {
		res.send({
			message: "Enter correct address",
			status: false
		});
	}



	res.send({
		message: "Enter a valid email address and Enter a valid telephone number.",
		status: false
	});

	meanlogger.log('shopping-cart', 'Viewed checkout', req.user);
	var errors = req.validationErrors();
	if (errors) {
		if (shipping_flag && process.env.enableShipping) {
			// req.flash('error', 'Invalid shipping information.');
			// return res.redirect('/wishlist');

			res.send({
				message: "Invalid shipping information.",
				status: false
			});
		}
		returnObject = {
			errorMsg: errors,
			noErrorMsg: false,
			noMessage: true
		};
		// req.flash('error', 'Invalid contact information.  Please ensure that you have an email and telephone number.');
		// return res.redirect('/wishlist');

		res.send({
			message: "Invalid contact information.  Please ensure that you have an email and telephone number",
			status: false
		});
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
						//////console.log("unable to update user telephone");
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
						//////console.log("unable to update user telephone");
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
			//////console.log("Unable to calculate shipping " + err);
			res.send({
				message: "Some error occurred",
				status: false
			});
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
					//////console.log(err);
					res.send({
						message: "Some error occurred",
						status: false
					});
				}
				if (!req.session.cart) {
					res.send({
						message: "Session Exp",
						status: false
					});
				}
				var totalTax = results.taxAmount.toFixed(2);
				var grandtotal = ((parseFloat(subtotal) + parseFloat(totalTax) + parseFloat(shippingtotal))).toFixed(2);
				var errorMsg = req.flash('error')[0];
				// res.render('shop/checkout', {
				// 	user: req.user,
				// 	layout: 'eshop/blank',
				// 	shipping_addr1: shipping_addr1,
				// 	shipping_city: shipping_city,
				// 	shipping_state: shipping_state,
				// 	shipping_zip: shipping_zip,
				// 	shipping_flag: shipping_flag,
				// 	email: email,
				// 	telephone: telephone,
				// 	taxDesc: taxDesc,
				// 	products: cart.generateArray(),
				// 	subtotal: subtotal,
				// 	enableTax: process.env.enableTax,
				// 	enableShipping: process.env.enableShipping,
				// 	totalTax: totalTax,
				// 	shippingtotal: shippingtotal,
				// 	grandtotal: grandtotal,
				// 	successMsg: successMsg,
				// 	noMessage: !successMsg,
				// 	errorMsg: errorMsg,
				// 	noErrorMsg: !errorMsg
				// });

				res.send({
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
			// res.render('shop/checkout', {
			// 	user: req.user,
			// 	layout: 'eshop/blank',
			// 	shipping_addr1: shipping_addr1,
			// 	shipping_city: shipping_city,
			// 	shipping_state: shipping_state,
			// 	shipping_zip: shipping_zip,
			// 	taxDesc: taxDesc,
			// 	products: cart.generateArray(),
			// 	subtotal: subtotal,
			// 	totalTax: totalTax,
			// 	enableTax: process.env.enableTax,
			// 	enableShipping: process.env.enableShipping,
			// 	shippingtotal: shippingtotal,
			// 	grandtotal: grandtotal,
			// 	successMsg: successMsg,
			// 	noMessage: !successMsg,
			// 	errorMsg: errorMsg,
			// 	noErrorMsg: !errorMsg
			// });


			res.send({
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
// category based on mobile
router.get('/category-mobile/', function (req, res, next) {
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
			//////console.log("Product-unwound: " + JSON.stringify(results));
			//////console.log("Err-unwound: " + JSON.stringify(err));
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
							//////console.log("Error finding category " + category_slug);


							res.send({
								message: "Cannot find category",
								status: false
							});
						}
						if (!category) {
							//////console.log("Error finding category " + category_slug);

							res.send({
								message: "Cannot find category",
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
									//////console.log("Error: " + err.message);


									res.send({
										message: "Problem finding products",
										status: false
									});
								}
								if (category.format != 'table') {
									productChunks = [];
									chunkSize = 4;
									for (var i = (4 - chunkSize); i < products.length; i += chunkSize) {
										productChunks.push(products.slice(i, i + chunkSize))
									};
								}
								res.send(category);
							});
						});
					});
				})
			})
		})
	})
})

router.get('/frontpage-mobile', function (req, res, next) {
	qryFilter = { "Product_Group": 'SIMPLE' };

	// if we have a cart, pass it - otherwise, pass an empty object
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];

	Product.find(qryFilter, function (err, product) {
		// console.log("Product: " + JSON.stringify(product));

		if (err || product === 'undefined' || product == null) {
			// replace with err handling
			var errorMsg = req.flash('error', 'unable to find product');
			res.send(errorMsg);
		}

		if (!product) {
			req.flash('error', 'Product is not found.');
			res.send('error', 'Product is not found.');
		}
		pro = product.toString();
		res.send(pro);
	});// Mobile Category Slug
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
						//////console.log("Error finding category " + category_slug);
						req.flash('error', 'Cannot find category');
						res.send({
							message: "Error",
							status: false
						});
					}
					if (!category) {
						//////console.log("Error finding category " + category_slug);
						req.flash('error', 'Cannot find category');
						res.send({
							message: "Error",
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

							if (err || !products || products === 'undefined') {

								req.flash('error', 'Problem finding products');
								res.send({
									message: "Error",
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
							res.send(category);
						});
					});
				});
			})
		})
	});
});
// mobile add to cart
router.post('/add-to-cart-mobile', function (req, res, next) {
	var theId = new ObjectId(req.body.user);
	console.log("productId:" + req.body.productId + "," + "name:" + req.body.name + "price:" + req.body.price);
	User.findOneAndUpdate({
		_id: theId
	}, {
			// $addToSet: {
			// 	"productId": req.body.productId
			// }
			$addToSet: {
				'product': {
					"productId": req.body.productId,
					"name": req.body.name,
					"price": req.body.price,
					"imagePath": req.body.imagePath

				}
			}
		}, {
			safe: true,
			upsert: false
		}, function (err, product) {
			event = new Event({
				namespace: 'products',
				person: {
					id: req.body.user,

				},
				action: 'addtocart',
				thing: {
					type: "product",
					id: req.body.productId,
					name: req.body.name,

				}
			});
			event.save(function (err, eventId) {
				if (err) {
					//////console.log("Error: " + err.message);
					return -1;
				}
			})
		});
	res.send('added to cart successfully');
});

