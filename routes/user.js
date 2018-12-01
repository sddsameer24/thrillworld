var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var csrf = require('csurf');
var flash = require('connect-flash');
var passport = require('passport');
var User = require('../models/user');
var Payment = require('../models/payment');
var Order = require('../models/order');
var Cart = require('../models/cart');
var ObjectId = require('mongoose').Types.ObjectId;
var validator = require('express-validator');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var meanlogger = require('../local_modules/meanlogger');
const dotenv = require('dotenv');
const chalk = require('chalk');
var csrfProtection = csrf({
	cookie: true
})
router.post('/update-profile', csrfProtection, function (req, res, next) {

	User.update({
		_id: req.user._id
	}, req.body)
		.then(function (err, user) {
			req.user = user;
			req.flash('success', 'User Updated');
			res.redirect('/user/profile');
		})
		.catch(function (err) {
			////console.log("Error: " + JSON.stringify(err));
			req.flash('error', 'Problem updating user profile.');
			res.redirect('/user/profile');
			res.status(400).send(err);
		});
});

// Mobile 
router.post('/update-profile-mobile', function (req, res, next) {

	if(req.body.email){
		User.update({
			email: req.body.email
		}, req.body)
			.then(function (err, user) {
				req.user = user;
				req.flash('success', 'User Updated');
				// res.redirect('/user/profile');
				res.send({
					message:  "Updated Profile",
					status: true
				});
	
			})
			.catch(function (err) {
				////console.log("Error: " + JSON.stringify(err));
				req.flash('error', 'Problem updating user profile.');
				res.send({
					message:  "Some error occurred",
					status: false
				});
	
			});
	}else{
		res.send({
			message:  "Some error occurred",
			status: false
		});
	}

	
});



router.get('/profile', isLoggedIn, csrfProtection, function (req, res, next) {
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	res.render('user/profile', {
		layout: 'eshop/blank',
		user: req.user,
		errorMsg: errorMsg,
		noErrorMsg: !errorMsg,
		successMsg: successMsg,
		noMessage: !successMsg,
		csrfToken: req.csrfToken()
	});
});

// Mobile Profile
router.post('/profile-mobile', function (req, res, next) {
	console.log("events");
	var slug3 = req.body._id;
	qryFilter = { "_id": slug3 };
	console.log(slug3);
	// if we have a cart, pass it - otherwise, pass an empty object
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	console.log("events1");

	User.find(qryFilter, function (err, user) {
		
		console.log("user: " + JSON.stringify(user));
{
			req.flash('success');
			for (i = 0; i < user.length; i++) {
				res.send(user[i]);
			}
			
		}
	});
});


router.get('/orders', isLoggedIn, function (req, res, next) {

	// ////console.log(payments);
	// res.render('user/profile', {layout:'fullpage.hbs',user: req.user, payments: payments,hasPayments:0});

	Order.find({
		$or: [{
			"user.id": req.user._id
		}, {
			"user.email": req.user.email
		}]
	}, null, {
			sort: {
				created: -1
			}
		}, function (err, orders) {
			if (err) {
				return res.write('Error');
			}
			// var arr = [];
			// var total = 0;
			// for (var order in orders) {
			//     ////console.log("Cart Item: " + orders[order]);
			//     ////console.log("------------");
			//     for (var item in orders[order].cart.items) {
			//         ////console.log("Item " + item);
			//         ////console.log(orders[order].cart.items[item].item.name);
			//         total = parseFloat(orders[order].cart.items[item].item.)
			//     }
			// }
			// return arr;
			res.render('user/orders', {
				layout: 'eshop/blank',
				user: req.user,
				orders: orders,
			});
		});
});

// Mobile Orders

router.get('/orders-mobile', isLoggedIn, function (req, res, next) {

	// ////console.log(payments);
	// res.render('user/profile', {layout:'fullpage.hbs',user: req.user, payments: payments,hasPayments:0});

	Order.find({
		$or: [ {
			"user.email": req.user.email
		}]
	}, null, {
			sort: {
				created: -1
			}
		}, function (err, orders) {
			if (err) {
				res.send({
					message:  "Some error occurred",
					status: false
				});
			}
			// var arr = [];
			// var total = 0;
			// for (var order in orders) {
			//     ////console.log("Cart Item: " + orders[order]);
			//     ////console.log("------------");
			//     for (var item in orders[order].cart.items) {
			//         ////console.log("Item " + item);
			//         ////console.log(orders[order].cart.items[item].item.name);
			//         total = parseFloat(orders[order].cart.items[item].item.)
			//     }
			// }
			// return arr;
			res.send(orders);
		});
});


router.get('/logout', isLoggedIn, function (req, res, next) {
	meanlogger.log("auth", "logged out", req.user);

	req.session.destroy()
	req.logout();
	res.redirect('/');

		// res.status(500).send({
		// 			message:  "Logged Out Sucessfully",
		// 			status: true
		// 		});

	
});

// MOBILE LOGOUT
router.get('/logoutmobile', isLoggedIn, function (req, res, next) {
	meanlogger.log("auth", "logged out", req.user);
//console.log("MOBILE HIT");
	req.session.destroy()
	req.logout();
	// res.redirect('/');

		res.status(500).send({
					message:  "Logged Out Sucessfully",
					status: true
				});

	
});




router.get('/logout-and-delete', isLoggedIn, function (req, res, next) {
	meanlogger.log("auth", "logged out and deleted account", req.user);
	User.findByIdAndRemove(req.user._id, function (err, result) {
		if (err) {
			////console.log("Problem removing user record.");
			req.flash('error', 'Unable to delete user record.');
			res.redirect('/');
		}
		req.flash('success', 'User record deleted and logged out.');
	})
	//req.session.destroy()
	req.logout();
	res.redirect('/');
});

// Mobile
router.get('/logout-and-delete-mobile', isLoggedIn, function (req, res, next) {
	meanlogger.log("auth", "logged out and deleted account", req.user);
	User.findByIdAndRemove(req.user._id, function (err, result) {
		if (err) {
			////console.log("Problem removing user record.");
			req.flash('error', 'Unable to delete user record.');
			res.send({
				message:  "Error ",
				status: false
			});
		}
		req.flash('success', 'User record deleted and logged out.');
	})
	//req.session.destroy()
	req.logout();
	res.send({
		message:  "Logged Out Sucessfully and Deleted",
		status: true
	});
});

router.get('/forgot', function (req, res, next) {
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	res.render('user/forgot', {
		layout: 'eshop/blank',
		user: req.user,
		errorMsg: errorMsg,
		noErrorMsg: !errorMsg,
		successMsg: successMsg,
		noMessage: !successMsg,
		isLoggedIn: req.isAuthenticated(),
		// csrfToken: req.csrfToken()
	});
});

router.post('/forgot', function (req, res, next) {
	async.waterfall([
		function (done) {
			crypto.randomBytes(20, function (err, buf) {
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		function (token, done) {
			console.log('account with that email.');
			User.findOne({
				email: req.body.email
			}, function (err, user) {
				if (!user) {
					req.flash('error', 'No account with that email address exists.');
					console.log('no account with that email.');
					return res.redirect('/user/forgot');
				}
				console.log("token:"+token);
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

				user.save(function (err) {
					if (err) {
						req.flash('error', 'An error occurred.');
					}
					console.log("Saved User: " + JSON.stringify(user));
					done(err, token, user);
				});
			});
		},
		function (token, user, done) {
			console.log("mailing: ");
			// var transporter = nodemailer.createTransport({
			// 	service: 'Gmail',
			// 	auth: {
			// 	  user: 'sdsameer24@gmail.com',
			// 	  pass: '22watch22'
			// 	}
			//   });
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
				to: user.email, // list of receivers
				subject: 'Password Reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
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
			// end of order comnfirmation mail sending  ..........................................
		}
	], function (err) {
		if (err) {
			req.flash('error', 'A problem has occurred ' + err);
			return next(err);
		}
		res.redirect('/user/forgot');
	});
	res.redirect('/');
});

// Mobile Forgot
router.post('/forgot-mobile', function (req, res, next) {
	async.waterfall([
		function (done) {
			crypto.randomBytes(20, function (err, buf) {
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		function (token, done) {
			User.findOne({
				email: req.body.email
			}, function (err, user) {
				//console.log("USERR"+user);
				if (user===null || !user ) {
					//console.log("ERRRRRRRR");
					req.flash('error', 'No account with that email address exists.');
					////console.log('no account with that email.');
					res.send({
						message:  "No account with that email address exists.",
						status: false
					});

				}
				else{
					user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

				user.save(function (err) {
					if (err) {
						req.flash('error', 'An error occurred.');
						res.send({
							message:  "An error occurred.",
							status: false
						});
					}
					////console.log("Saved User: " + JSON.stringify(user));
					done(err, token, user);
				});
				}
			});
		},
		function (token, user, done) {
			// let transporter = nodemailer.createTransport({
			// 	host: 'mail.zo-online.com',
			// 	port: 587,
			// 	secure: false, // true for 465, false for other ports
			// 	auth: {
			// 		user: 'admin@zo-online.com', // generated ethereal user
			// 		pass: '22watch22@DS'  // generated ethereal password
			// 	},
			// 	tls: {
			// 		rejectUnauthorized: false
			// 	}
			// });
			//''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
			// var smtpTransport = nodemailer.createTransport('SMTP', {
			//   service: 'SendGrid',
			//   auth: {
			//     user: 'admin@zo-online.com',
			//     pass: '22watch22@DS'
			//   }
			// });

			// var smtpConfig = {
			//     host: 'mail.zo-online.com',
			//     port: 587,
			//     secure: true, // use SSL
			//     auth: {
			//         user: 'admin@zo-online.com',
			//         pass: '22watch22@DS'
			//     }
			// };
			// 	var transporter = nodemailer.createTransport(smtpConfig.connectString);
			//     let mailOptions = {
			// 		from: '"Thrillworld Confirmation" <admin@zo-online.com>', // sender address
			// 		replyTo: '"Thrillworld Confirmation" <admin@zo-online.com>', // sender address
			// 		to: req.user.email, // list of receivers
			// 		subject: 'Node Contact Request', // Subject line
			// 		text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
			// 	 		'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
			// 	 		'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
			// 	 		'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			// 	 };
			// 	var mailOptions = {
			// 		to: user.email,
			// 		from: 'sdsameer24@gmail.com',
			// 		subject: 'Password Reset',
			// 		text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
			// 			'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
			// 			'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
			// 			'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			// 	};
			// 	transporter.sendMail(mailOptions, function (err) {
			// 		if (!err) {
			// 			req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
			// 			res.redirect('/');
			// 		} else {
			// 			req.flash('error', 'A problem has occurred while sending the email.');
			// 			return res.redirect('/user/forgot');
			// 		}
			// 	});
			
		
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
				from: '"Thrillworld Password reset" <admin@zo-online.com>', // sender address
				replyTo: '"Thrillworld Confirmation" <admin@zo-online.com>', // sender address
				to: user.email, // list of receivers
				subject: 'Password Reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};

			// send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {

					//console.log("ERROR" + error);
					res.send({
						message:  "An error occurred.",
						status: false
					});
				}


				//console.log("INFo" + info);
				//console.log('Message sent: %s', info.messageId);
				//console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
				req.flash('success', "SENT MAIL, KINDLY CHECK!");
				res.send({
					message:  "Sent Forgot Email.",
					status: true
				});	
				//	res.render('contact', { msg: 'Email has been sent' });
			});
			// end of order comnfirmation mail sending  ..........................................
		}
	], function (err) {
		if (err) {
			req.flash('error', 'A problem has occurred ' + err);
			res.send({
				message:  "An error occurred.",
				status: false
			});
		}else{
			res.send({
				message:  "Sent Forgot Email.",
				status: true
			});	
		}
		//res.redirect('/user/forgot');
	});
});


router.get('/reset/:token', function (req, res) {
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	console.log("reset module");
	User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	}, function (err,user) {
		
		//console.log("Found User: " + JSON.stringify(user));
		res.render('user/reset', {
			user: req.user,
			token: req.params.token,
			errorMsg: errorMsg,
			noErrorMsg: !errorMsg,
			successMsg: successMsg,
			noMessage: !successMsg,
		});
		
		});
	});

// Mobile Rest token
router.get('/reset-mobile/:token', function (req, res) {
		var successMsg = req.flash('success')[0];
		var errorMsg = req.flash('error')[0];
		User.findOne({
			resetPasswordToken: req.params.token,
			resetPasswordExpires: {
				$gt: Date.now()
			}
		}, function (err, user) {

			if(err){
				res.send({
					message:  "An error occurred.",
					status: false
				});

			}else{
				//console.log("Found User: " + JSON.stringify(user));
			
				res.send(user);	
			}
			
		
			
			});
		});

router.post('/reset/:token', function (req, res) {
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	pass = req.body.password;
	conf = req.body.confirmation;
	token = req.params.token;	
	async.waterfall([
		function (done) {
			User.findOne({
				resetPasswordToken: req.params.token,
				resetPasswordExpires: {
					$gt: Date.now()
				}
			}, function (err, user) {
				if (err) {
					////console.log("Error: " + err.message);
				}
				console.log("User: " + JSON.stringify(user));
				// if (!user) {
				// 	errorMsg = req.flash('error', 'Password reset token is invalid or has expired.');
				// 	return res.redirect('back');
				// }
				user.password = req.body.password;
				user.resetPasswordToken = undefined;
				user.resetPasswordExpires = undefined;

				user.save(function (err) {
					console.log("save user");
					req.logIn(user, function (err) {
						done(err, user);
						console.log(user);
					});
				});
			});
		},
		function (user, done) {
			console.log("done"+user);
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
				to: user.email, // list of receivers
				subject: 'Your password has been changed',
				text: 'Hello,\n\n' +
				'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
			};
			// var mailOptions = {
			// 	to: user.email,
			// 	from: 'passwordreset@demo.com',
			// 	subject: 'Your password has been changed',
			// 	text: 'Hello,\n\n' +
			// 		'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
			// };
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
		}
	], function (err) {
		if (err) {
			req.flash('error', 'Unknown Error during reset.')
			
		}
		res.redirect('/user/forgot');
	});
	res.redirect('/');
});

// Mobile Post 

router.post('/reset-mobile/:token', function (req, res) {
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	pass = req.body.password;
	conf = req.body.confirmation;
	token = req.params.token;	
	async.waterfall([
		function (done) {
			User.findOne({
				resetPasswordToken: req.params.token,
				resetPasswordExpires: {
					$gt: Date.now()
				}
			}, function (err, user) {
				if (err) {
					////console.log("Error: " + err.message);
					res.send({
						message:  "An error occurred.",
						status: false
					});
				}else{
					//console.log("User: " + JSON.stringify(user));
				// if (!user) {
				// 	errorMsg = req.flash('error', 'Password reset token is invalid or has expired.');
				// 	return res.redirect('back');
				// }
				user.password = req.body.password;
				user.resetPasswordToken = undefined;
				user.resetPasswordExpires = undefined;

				user.save(function (err) {
					req.logIn(user, function (err) {
						done(err, user);
					});
				});
				res.send(user);

				}
				
			});
		},
		function (user, done) {
			var transporter = nodemailer.createTransport({
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

			var mailOptions = {
				to: user.email,
				from: 'passwordreset@demo.com',
				subject: 'Your password has been changed',
				text: 'Hello,\n\n' +
					'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
			};
			transporter.sendMail(mailOptions, function (err) {
				req.flash('success', 'Success! Your password has been changed.');
				res.redirect('/');
				done(err);
			});
		}
	], function (err) {
		if (err) {
			req.flash('error', 'Unknown Error during reset.')
		//	res.redirect('user/reset');
		res.send({
			message:  "An error occurred.",
			status: false
		});
		}
	});
});


router.use('/', notLoggedIn, function (req, res, next) {
	next();
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

router.post('/signup', passport.authenticate('local.signup', {
	successRedirect: '/user/profile',
	failureRedirect: '/user/signup',
	failureFlash: true
}), function (req, res, next) {
	console.log("signup");
	meanlogger.log("auth", "signup attempt", req.user);
	req.session.first_name = req.body.first_name;
	req.session.last_name = req.body.last_name;
	req.session.addr1 = req.body.addr1;
	req.session.city = req.body.city;
	req.session.state = req.body.state;
	req.session.email = req.body.email;
	req.session.telephone = req.body.telephone;
	req.session.zipcode = req.body.zipcode;

	if (req.session.oldUrl) {
		var oldUrl = req.session.oldUrl
		req.session.oldUrl = null;
		res.redirect(oldUrl);
	} else {
		res.redirect('/user/profile');
	}
});

// Mobile register 
router.post('/register', function (req, res, next) {

	req.session.first_name = req.body.first_name;
	req.session.last_name = req.body.last_name;
	req.session.addr1 = req.body.addr1;
	req.session.city = req.body.city;
	req.session.state = req.body.state;
	req.session.email = req.body.email;
	req.session.telephone = req.body.telephone;
	req.session.zipcode = req.body.zipcode;

	//console.log("REGISTER HIT");
	if(req.body.email || req.body.password || req.body.first_name || req.body.last_name || req.body.addr1 || req.body.city ||  req.body.addr2 ||  req.body.state ||req.body.zipcode || req.body.telephone ){
		var newUser = new User();
		console.log("old REGISTER HIT");
		newUser.email = req.body.email;
		// newUser.password = newUser.encryptPassword(password);
		newUser.password = req.body.password;
		newUser.first_name = req.body.first_name;
		newUser.last_name = req.body.last_name;
		newUser.addr1 = req.body.addr1;
		newUser.addr2 = req.body.addr2;
		newUser.city = req.body.city;
		newUser.state = req.body.state;
		newUser.zipcode = req.body.zipcode;
		newUser.telephone = req.body.telephone;
		newUser.role = 'visitor';
		newUser.save(function (err, result) {
			console.log("old REGISTER HIT");
			if (err) {
				res.send({
					message:  "Error",
					status: false
				});
			}
			////console.log('User successfully registered');
			req.flash('success', 'User successfully registered.');
			res.send({
				message:  "Customer Registered",
				status: true
			});
		});
	}else{
		res.send({
			message:  "Error",
			status: false
		});
	}
});

router.get('/signin', csrfProtection, function (req, res, next) {
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	////console.log("Error: " + JSON.stringify(errorMsg));
	if (process.env.FACEBOOK_ID) {
		var authFacebook = true
	} else {
		var authFacebook = false;
	}
	if (process.env.GOOGLE_ID) {
		var authGoogle = true;
	} else {
		var authGoogle = false;
	}
	req.session.oldUrl = req.get('referer');
	var messages = req.flash('error');
	res.render('user/signin', {
		layout: 'eshop/blank',
		// csrfToken: req.csrfToken(),
		authFacebook: authFacebook,
		authGoogle: authGoogle,
		noErrorMessage: !errorMsg,
		errorMsg: errorMsg,
		message: messages,
		first_name: req.session.first_name,
		last_name: req.session.last_name,
		addr1: req.session.addr1,
		city: req.session.city,
		state: req.session.state,
		zipcode: req.session.zipcode,
		telephone: req.session.telephone,
		email: req.session.email,
		noErrorMsg: !errorMsg,
		successMsg: successMsg,
		noMessage: !successMsg,
		hasErrors: messages.length > 0
	});
});

// router.post('/signin', passport.authenticate('local.signin', {
//     failureRedirect: '/user/signin',
//     failureMessage: "Invalid username or password",
//     failureFlash: true
// }), function(req, res, next) {
//     ////console.log("REQ: " + JSON.stringify(req));
//     meanlogger.log("auth","logged in",req.user);
//     if (req.session.oldUrl && (req.session.oldUrl != req.url)) {
//         var oldUrl = req.session.oldUrl
//         req.session.oldUrl = null;
//         res.redirect(oldUrl);
//     } else {
//         User.findOne({_id: req.user._id}, function(err,user) {
//             user.lastlogin=Date.now();
//             user.save(function(err,docs) {
//                 if (err) {
//                     ////console.log("Unable to save user.");
//                 }
//             })
//             res.render('user/profile', {
//                 user: req.user
//             });
//         })
//     }
// });

router.post('/signin', function (req, res, next) {
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	if (process.env.FACEBOOK_ID) {
		var authFacebook = true
	} else {
		var authFacebook = false;
	}
	if (process.env.GOOGLE_ID) {
		var authGoogle = true;
	} else {
		var authGoogle = false;
	}
	req.session.oldUrl = req.get('referer');
	var messages = req.flash('error');
	passport.authenticate('local.signin', {
		session: true
	},
		function (err, user, info) {
			////console.log("trying to log in");
			if (err) {
				req.flash('error', 'Internal Server Error');
				////console.log("Error: " + err.message);
				res.redirect('/user/signin');

				res.render('user/signin', {
					layout: 'eshop/blank',
					authFacebook: authFacebook,
					authGoogle: authGoogle,
					noErrorMessage: !errorMsg,
					noErrorMsg: !errorMsg,
					successMsg: successMsg,
					noMessage: !successMsg
				});
				// return res.redirect('/user/signin');
			}
			if (!user) {
				req.flash('error', 'Invalid credentials');
				////console.log("Error Login - invalid credentials");
				return res.redirect('/user/signin');

				
				// res.status(500).send({
				// 	message:  "Some error occurred while creating the Note.",
				// 	status: false
				// });


				// return res.render('user/signin', {
				// 	layout: 'eshop/blank',
				// 	authFacebook: authFacebook,
				// 	authGoogle: authGoogle,
				// 	noErrorMessage: !errorMsg,
				// 	noErrorMsg: !errorMsg,
				// 	successMsg: successMsg,
				// 	noMessage: !successMsg,
				// })
			}
			req.logIn(user, function (err) {
				if (err) {
					req.flash('error', 'Invalid credentials');
					////console.log("Error Login - invalid credentials");
					return res.redirect('/user/signin');

				// 	res.status(500).send({
				// 	message:  "Signin incoorect",
				// 	status: false
				// });

					// return res.render('user/signin', {
					// 	layout: 'eshop/blank',
					// 	authFacebook: authFacebook,
					// 	authGoogle: authGoogle,
					// 	noErrorMessage: !errorMsg,
					// 	noErrorMsg: !errorMsg,
					// 	successMsg: successMsg,
					// 	noMessage: !successMsg,
					// })
				}
				req.flash('success', 'Logged In Successfully');
				// res.send(user);
				
			  return res.redirect('/user/profile');
			});
		})(req, res, next);
});

router.get('/facebook', passport.authenticate('facebook', {
	scope: ['email', 'user_location'],
	failureFlash: true
}));

// router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/user/signin' }), (req, res) => {
router.get('/facebook/callback', passport.authenticate('facebook', {
	failureRedirect: '/'
}), (req, res) => {
	res.redirect(req.session.returnTo || '/');
});

router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter', {
	failureRedirect: '/user/signin'
}), (req, res) => {
	res.redirect(req.session.returnTo || '/');
});

router.get('/google', passport.authenticate('google', {
	scope: 'profile email'
}));
router.get('/google/callback', passport.authenticate('google', {
	failureRedirect: '/user/signin'
}), (req, res) => {
	res.redirect(req.session.returnTo || '/');
});

module.exports = router;

// Mindspace
// https://www.youtube.com/watch?v=XVYApTfR6XE

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

function notLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

function saveSession(req, res, next) {
	req.session.first_name = req.body.first_name;
	return next();
}



/* -------------------- MOBILE DEVELOPMENT -------------------- */

router.post('/login', function (req, res, next) {
	var successMsg = req.flash('success')[0];
	var errorMsg = req.flash('error')[0];
	if (process.env.FACEBOOK_ID) {
		var authFacebook = true
	} else {
		var authFacebook = false;
	}
	if (process.env.GOOGLE_ID) {
		var authGoogle = true;
	} else {
		var authGoogle = false;
	}
	req.session.oldUrl = req.get('referer');
	var messages = req.flash('error');
	passport.authenticate('local.signin', {
		session: true
	},
		function (err, user, info) {
			////console.log("trying to log in");
			if (err) {
				req.flash('error', 'Internal Server Error');
				////console.log("Error: " + err.message);
				// res.redirect('/user/signin');
					res.status(500).send({
					message:  "Some error occurred while creating the Note.",
					status: false
				});

				res.render('user/signin', {
					layout: 'eshop/blank',
					authFacebook: authFacebook,
					authGoogle: authGoogle,
					noErrorMessage: !errorMsg,
					noErrorMsg: !errorMsg,
					successMsg: successMsg,
					noMessage: !successMsg
				});
				// return res.redirect('/user/signin');
			}
			if (!user) {
				// req.flash('error', 'Invalid credentials');
				// ////console.log("Error Login - invalid credentials");
				// return res.redirect('/user/signin');

				
				res.send({
					message:  "Some error occurred",
					status: false
				});


				// return res.render('user/signin', {
				// 	layout: 'eshop/blank',
				// 	authFacebook: authFacebook,
				// 	authGoogle: authGoogle,
				// 	noErrorMessage: !errorMsg,
				// 	noErrorMsg: !errorMsg,
				// 	successMsg: successMsg,
				// 	noMessage: !successMsg,
				// })
			}
			req.logIn(user, function (err) {
				if (err) {
					// req.flash('error', 'Invalid credentials');
					// ////console.log("Error Login - invalid credentials");
					// return res.redirect('/user/signin');

				// 	res.send({
				// 	message:  "Signin incoorect",
				// 	status: false
				// });

					// return res.render('user/signin', {
					// 	layout: 'eshop/blank',
					// 	authFacebook: authFacebook,
					// 	authGoogle: authGoogle,
					// 	noErrorMessage: !errorMsg,
					// 	noErrorMsg: !errorMsg,
					// 	successMsg: successMsg,
					// 	noMessage: !successMsg,
					// })
				}else{
					res.send(user);
				}
				// req.flash('success', 'Logged In Successfully');
				
				
			//   return res.redirect('/user/profile');
			});
		})(req, res, next);
});







