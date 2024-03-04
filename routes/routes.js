const express =  require('express');
const router = express.Router();

const {
    handleCreateTasks,
    handleCreateSubTasks,
    handleGetTasks,
    handleGetSubTasks,
    handleUpdateTasks,
    handleUpdateSubTasks,
    handleDeleteTasks,
    handleDeleteSubTasks
    } = require('../controllers/functions');

router.route('/tasks/create')
.post(handleCreateTasks);

router.route('/subtasks/create')
.post(handleCreateSubTasks);

router.route('/tasks')
.get(handleGetTasks);

router.route('/subtasks')
.get(handleGetSubTasks);

router.route('/tasks/update/:task_id')
.put(handleUpdateTasks);

router.route('/subtasks/update/:subtask_id')
.put(handleUpdateSubTasks);

router.route('/tasks/delete/:task_id')
.delete(handleDeleteTasks);

router.route('/subtasks/delete/:subtask_id')
.delete(handleDeleteSubTasks);

module.exports = router;