'use strict';

var path = process.cwd();

module.exports = function (app, passport, session, urli, MongoClient, ObjectId, books, bodyParser) {

	// Authorized or not
	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) return next();
		else res.sendFile(path + '/public/login.html');
	}
	
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.route('/auth/github').get(passport.authenticate('github'));
	app.route('/auth/github/callback').get(passport.authenticate('github', {successRedirect: '/', failureRedirect: '/'}));

	app.route('/').get(isLoggedIn, function (req, res) {
		res.sendFile(path + '/public/index.html');
	});
	app.route('/my').get(isLoggedIn, function (req, res) {
		res.sendFile(path + '/public/my.html');
	});
	app.route('/requests').get(isLoggedIn, function (req, res) {
		res.sendFile(path + '/public/requests.html');
	});
	app.route('/settings').get(isLoggedIn, function (req, res) {
		res.sendFile(path + '/public/settings.html');
	});
	app.route('/logout').get(function (req, res) {
		req.logout();
		res.redirect('/');
	});
    
    // View user name
    app.post('/nameD', function(req, res) {
    	if (req.isAuthenticated()) {
			MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('book-users').find({_id : ObjectId(req.session.passport.user.toString())}).toArray(function(err, data) {
    				if (err) return 0;
    				else res.end(data[0].displayName);
    				db.close();
				});
    		});
    	}
    	else res.end('Book Trading Club');
    });
    
    // Write new name
    app.post('/name', function(req, res) {
    	if (req.isAuthenticated() && req.body.name) {
			MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('book-users').findOneAndUpdate({_id : ObjectId(req.session.passport.user.toString())}, {$set : {displayName : req.body.name}}, function (err, docs) {
    				if (err) res.end('error');
    				else res.end('');
    				db.close();
				});
    		});
    	}
    	else res.end('error');
    });
    
    // Write new city
    app.post('/city', function(req, res) {
    	if (req.isAuthenticated() && req.body.city && req.body.state) {
			MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('book-users').findOneAndUpdate({_id : ObjectId(req.session.passport.user.toString())}, {$set : {city : req.body.city, state : req.body.state}}, function (err, docs) {
    				if (err) res.end('error');
    				else res.end('');
    				db.close();
				});
    		});
    	}
    	else res.end('error');
    });
    
    // Add new book
    app.post('/addBook', function(req, res) {
    	var book = req.body.book;
    	if (req.isAuthenticated() && req.body.book) {
    		var user = req.session.passport.user;
    		MongoClient.connect(urli, function(err, db) {
    			if (err) return 0;
    			else books.search(book, function(error, results) {
    				if (error) return 0;
        			else if (results && results.length) {
        				var key = ObjectId().toString();
        				db.collection('book-search').insertMany([{_id : key, who : user, img : results[0].thumbnail, text : results[0].title, req : '', reqD : ''}], function (err, docs) {
    						if (err) return 0;
							else res.end(docs.ops[0]._id + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + docs.ops[0].img + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + docs.ops[0].text);
							db.close();
        				});
        			}
        			else res.end('error');
				});
    		});
    	}
    	else res.end('');
    });
    
    // Delete book
    app.post('/remove', function(req, res) {
    	var id = req.body.id;
    	if (req.isAuthenticated()) {
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('book-search').find({_id : id}).toArray(function(err, data) {
    				if (err) return 0;
    				else if (data && data.length && req.session.passport.user == data[0].who) {
    					if (data[0].reqD != '') db.collection('book-users').findOneAndUpdate({_id : ObjectId(data[0].reqD.toString())}, {$pull: {reqD: id}}, function (err, docs) {
    						if (err) return 0;
    					});
    					else if (data[0].req != '') db.collection('book-users').findOneAndUpdate({_id : ObjectId(data[0].req.toString())}, {$pull: {reqD: id}}, function (err, docs) {
    						if (err) return 0;
    					});
    					db.collection('book-users').findOneAndUpdate({_id : ObjectId(data[0].who.toString())}, {$pull: {reqD: id}}, function (err, docs) {
    						if (err) return 0;
    						else db.collection('book-search').remove({_id : id});
    						res.end();
    						db.close();
    					});
    				}
    			});
    		});
    	}
    });
    
    // Open my list
    app.post('/myList', function(req, res) {
    	var str = '';
    	if (req.isAuthenticated()) {
    		var who = req.session.passport.user;
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('book-search').find({who : who}).toArray(function(err, data) {
    				if (err) return 0;
    				else if (data && data.length) {
    					for (var i = 0; i < data.length; i++)
    						str += data[i]._id + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + data[i].img + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + data[i].text + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU';
    					res.end(str);
    				}
    				else res.end('error');
    				db.close();
    			});
    		});
    	}
    });
    
    // View list items
    app.post('/view', function(req, res) {
    	var str = '',
    		id = '';
    	MongoClient.connect(urli, function(err, db) {
			if (err) return 0;
    		else db.collection('book-search').count(function (e, count) {
    			var k = 0;
				if (count && count > 0) {
    				db.collection('book-search').find().forEach(function(obj) {
    					if (err) return 0;
    					else if (obj.who) {
    						if ((req.isAuthenticated() && (obj.who == req.session.passport.user || obj.req != '' || obj.reqD != '')) || !req.isAuthenticated()) id = '';
    						else id = obj._id;
    						str += id + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + obj.img + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + obj.text + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU';
    					}
    					k++;
    					if (k == count) res.end(str);
    				});
    			}
				else res.end('');
				db.close();
    		});
    	});
    });
    
    // Request
    app.post('/request', function(req, res) {
    	var id = req.body.id;
    	if (req.isAuthenticated()) {
    		var user = req.session.passport.user;
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('book-search').find({_id : id}).toArray(function(err, data) {
    				if (err) return 0;
    				else if (data && data.length) {
    					db.collection('book-search').findOneAndUpdate({_id : id}, {$set: {reqD: user}}, function (err, docs) {
    						if (err) return 0;
    					});
    					db.collection('book-users').findOneAndUpdate({_id : ObjectId(user.toString())}, {$push: {reqD: id}}, function (err, docs) {
    						if (err) return 0;
    					});
    				}
    				res.end();
    				db.close();
    			});
    		});
    	}
    });
    
    // View request list
    app.post('/requestShow', function(req, res) {
    	var str1 = '',
    		str2 = '',
    		str = '';
    	if (req.isAuthenticated()) {
    		var user = req.session.passport.user;
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('book-users').find({_id : ObjectId(user.toString())}).toArray(function(err, data) {
    				if (err) return 0;
    				else if (data && data.length) {
    					db.collection('book-search').find({_id : {"$in" : data[0].reqD}}).toArray(function(err, data1) {
    						if (err) return 0;
    						else if (data1 && data1.length) {
    							for (var i = 0; i < data1.length; i++) {
    								str = data1[i]._id + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + data1[i].img + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + data1[i].text + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU';
    								if (data1[i].reqD == user) str1 += str;
    								else if (data1[i].req == user || (data1[i].req != '' && data1[i].who == user)) str2 += str;
    							}
    						}
    						str = '';
    						str += str1 + '#f9B_mn2WZeSvkZZEFEFSFergreZrg#' + str2;
    						res.end(str);
    						db.close();
    					});
    				}
    			});
    		});
    	}
    });
    
    // View request for u
    app.post('/reqFoUShow', function(req, res) {
    	var str = '';
    	if (req.isAuthenticated()) {
    		var user = req.session.passport.user;
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('book-search').count(function (e, count) {
    				var k = 0;
					if (count && count > 0) {
    					db.collection('book-search').find().forEach(function(obj) {
    						if (err) return 0;
    						else if (obj.who && obj.who == user && obj.req == '' && obj.reqD != '')
    							str += obj._id + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + obj.img + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU' + obj.text + '9B_mn2WZfTIYyUZeSvkZ_5IXBKU';
    						k++;
    						if (k == count) res.end(str);
    					});
    				}
					else res.end('');
					db.close();
    			});
    		});
    	}
    });
    
    // Delete request
    app.post('/removeR', function(req, res) {
    	var id = req.body.id;
    	if (req.isAuthenticated()) {
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('book-search').findOneAndUpdate({_id : id}, {$set: {reqD: '', req: ''}}, function (err, docs) {
    				if (err) return 0;
    				else {
    					var arg = docs.value.req;
    					db.collection('book-users').findOneAndUpdate({_id : ObjectId(docs.value.who.toString())}, {$pull: {reqD: id}}, function (err, docs) {
    						if (err) return 0;
    						else db.collection('book-users').findOneAndUpdate({_id : ObjectId(req.session.passport.user.toString())}, {$pull: {reqD: id}}, function (err, docs) {
    							if (err) return 0;
    							else if (arg) db.collection('book-users').findOneAndUpdate({_id : ObjectId(arg.toString())}, {$pull: {reqD: id}}, function (err, docs1) {
    								if (err) return 0;
    								else db.close();
    							});
    						});
    					});
    				}
    			});
    			res.end();
    		});
    	}
    });
    
    // Delete request for u
    app.post('/removeRFU', function(req, res) {
    	var id = req.body.id;
    	if (req.isAuthenticated()) {
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('book-search').findOneAndUpdate({_id : id}, {$set: {reqD: '', req: ''}}, function (err, docs) {
    				if (err) return 0;
    				else db.collection('book-users').findOneAndUpdate({_id : ObjectId(docs.value.reqD.toString())}, {$pull: {reqD: id}}, function (err, docs) {
    					if (err) return 0;
    					else db.close();
    				});
    			});
    			res.end();
    		});
    	}
    });
    
    // Confirm the request
    app.post('/confirm', function(req, res) {
    	var id = req.body.id;
    	if (req.isAuthenticated()) {
    		MongoClient.connect(urli, function(err, db) {
				if (err) return 0;
    			else db.collection('book-search').find({_id : id}).toArray(function(err, data) {
    				if (err) return 0;
    				else if (data && data.length) {
    					var arg = data[0].reqD;
    					db.collection('book-search').findOneAndUpdate({_id : id}, {$set: {reqD: '', req: arg}}, function (err, docs) {
    						if (err) return 0;
    						else db.collection('book-users').findOneAndUpdate({_id : ObjectId(req.session.passport.user.toString())}, {$push: {reqD: id}}, function (err, docs) {
    							if (err) return 0;
    							else db.close();
    						});
    					});
    				}
    			});
    			res.end();
    		});
    	}
    });
};