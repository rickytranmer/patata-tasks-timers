const router = require('express').Router();
const tasksController = require('../controllers/tasks');
const usersController = require('../controllers/users');

router.get('/api/test', (req, res)=> {
  res.send({ test: ' server: 3.13' });
});

router.route('/api/task')
	.get(tasksController.getTask)
	.post(tasksController.postTask);

router.route('/api/task/:id')
	.get(tasksController.getTask)
	.put(authenticatedUser, tasksController.putTask);

router.get('/api/tasks', tasksController.getTasks);
router.get('/api/tasks/:username', tasksController.getTasks);

router.route('/api/user')
	// .get(usersController.getUser)
	// .get((req, res)=> {	res.redirect('https://rickytranmer.github.io/patata') })
	.post(usersController.postSignup);

router.route('/api/user/:username')
	.get(usersController.getUser);

router.get('/*', (req, res)=> {
	res.redirect('https://rickytranmer.github.io/patata');
});

module.exports = router;