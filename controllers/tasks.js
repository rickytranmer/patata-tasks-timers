const docClient = require('../db/docClient');
const table = "Tasks";
let params = {};

function postTask(req, res) {
	//TODO - change to logged in user, authenticate
	params = {
		TableName: table,
		Item:{
			"username": req.body.username,
			"date": req.body.date,
			"title": req.body.title,
			"timerDefault": req.body.timerDefault || 25,
			"timerEstimate": parseInt(req.body.timerEstimate) || 1,
			"timerCount":	parseInt(req.body.timerCount) || 0
		}
	};
	params.Item.date = shortenDate(params.Item.date); //see bottom
	if(req.body.description) { params.Item.description = req.body.description }

	console.log("Adding a new item...", params);
	docClient.put(params, function(err, data) {
		if (err) {
			console.error("Unable to add task. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			console.log("Added task:", JSON.stringify(data, null, 2));
		}
	});

	res.send();
}

function getTask(req, res) {
	let username = req.body.username;
	params = {
		TableName: table,
		Key:{
			"username": username,
			"date": req.params.id
		}
	};

	docClient.get(params, function(err, data) {
		if (err) {
			console.error("Unable to read task. Error JSON:", JSON.stringify(err, null, 2));
			res.send();
		} else {
			console.log("getTask succeeded:", JSON.stringify(data, null, 2));
			res.send(data);
		}
	});
}

function putTask(req, res) {
	console.log(req.body.username);
	console.log(req.params.id);
	let username = req.body.username;
	if(req.body.title) {
		// Update entire task
		var params = {
			TableName: table,
			Key:{
				"username": username,
				"date": req.params.id
			},
			UpdateExpression: "set title = :t, description=:d, timerDefault=:td, timerEstimate=:te, timerCount=:tc",
			ExpressionAttributeValues:{
				":t": req.body.title,
				":d": req.body.description || null,
				":td": req.body.timerDefault || 25,
				":te": parseInt(req.body.timerEstimate) || 1,
				":tc":	parseInt(req.body.timerCount) || 0
			},
			ReturnValues:"UPDATED_NEW"
		};
		
	} else {
		// Just update timerCount
		console.log('timerCount');
		params = {
			TableName: table,
			Key:{
				"username": username,
				"date": req.params.id
			},
			UpdateExpression: "set #timerCount = #timerCount + :val",
			ExpressionAttributeNames:{
					"#timerCount": "timerCount"
			},
			ExpressionAttributeValues:{
				":val":1
			},
			ReturnValues:"UPDATED_NEW"
		};
	}

	console.log("Updating the task...");
	docClient.update(params, function(err, data) {
		if (err) {
				console.error("Unable to update task. Error JSON:", JSON.stringify(err, null, 2));
		} else {
				console.log("putTask succeeded:", JSON.stringify(data, null, 2));
				res.send();
		}
	});

}

function deleteTask(req, res) {
	params = {
		TableName: table,
		Key:{
			"username": req.body.username,
			"date": req.params.id
		}
	};

	console.log("Deleting the task the task...");
	docClient.delete(params, function(err, data) {
			if (err) {
					console.error("Unable to delete task. Error JSON:", JSON.stringify(err, null, 2));
			} else {
					console.log("deleteTask succeeded:", JSON.stringify(data, null, 2));
					res.send();
			}
	});

}

function getTasks(req, res) {
	let username = req.params.username || 'RickySoFine';
	params = {
		TableName : table,
		KeyConditionExpression: "#username = :username",
		ExpressionAttributeNames:{
				"#username": "username"
		},
		ExpressionAttributeValues: {
				":username": username
		}
	};

	docClient.query(params, function(err, data) {
		if (err) {
			console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
		} else {
			console.log("Query succeeded.");
			res.send(data.Items);
		}
	});
}

function shortenDate(thisDate) {
	// Move milliseconds to the front of date property, makes var shorter and spreads out traffic on DynamoDB
	let newDate = thisDate[20];
	for(let i = 21; i < 24; i++) {
		newDate += thisDate[i];
	}
	for(let i = 0; i < 19; i++) {
		newDate += thisDate[i];
	}
	return newDate.replace(/[^a-zA-Z0-9]/g, '');
}

module.exports = {
	postTask,
	getTask,
	putTask,
	getTasks, 
	deleteTask
};