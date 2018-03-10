const router = require('express').Router();
const tasksController = require('../controllers/tasks');

router.get('/api/test', (req, res)=> {
  res.send({ test: '3.10 api success' });
});

router.route('/api/task')
	.get(tasksController.getTask)
	.post(tasksController.postTask);

router.route('/api/task/:id')
	.get(tasksController.getTask)
	.put(tasksController.putTask);

router.get('/api/tasks', tasksController.getTasks);
router.get('/api/tasks/:username', tasksController.getTasks);

module.exports = router;