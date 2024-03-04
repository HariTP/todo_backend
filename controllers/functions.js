const user = require('../models/users');
const task = require('../models/tasks');
const subTask = require('../models/subtasks');
const idGenerator = require('../utils/idGenerator');
const setPriority = require('../utils/setPriority');
const jwt = require('jsonwebtoken');

const handleRegister = async (req, res) => {
    if (!req.body || !req.body.phone) {
        return res.status(400).json({message: "Error! Pls provide a valid phone no!"});
    }
    const ID = idGenerator(12);
    const phone = req.body.phone;
    await user.create({
        user_id: ID,
        phone: phone,
        priority: (Math.floor(Math.random() * 3)),
    })
    .then(() => {
        return res.status(200).json({message: `Your user_id is ${ID} . This is required for login`});
    })
    .catch((err) => {
        console.log(err);
        return res.status(500).json({message: "Error! Could not create user try again :("});
    })
}

const handleLogin = async (req, res) => {
    const { user_id, phone } = req.body;

    const user_data = await user.findOne({user_id: user_id, phone: phone});
    if (!user_data) {
        return res.status(401).json({ message: 'User not found' });
    }

    const token = jwt.sign({ user_id: user_data.user_id }, process.env.SECRET_KEY);
    res.status(200).json({ message: `Login successful! Token is - ${token}` });
}

const handleCreateTasks = async (req, res) => {
    const body = req.body;
    if (!body.title || !body.due_date) {
        return res.status(400).json({error: "Provide required details!"});
    }
    const ID = idGenerator(8);
    const parsedDuedate = new Date(body.due_date);
    await task.create({
        id: ID,
        title: body.title,
        description: body.description,
        due_date: parsedDuedate,
        user_id: req.user.user_id,
    })
    .then(() => {
        return res.status(200).json({message: `Task ${ID} successfully created :)`});
    })
    .catch((err) => {
        console.log(err);
        return res.status(500).json({message: "Error! Could not create task try again :("});
    })
}

const handleCreateSubTasks = async (req, res) => {
    const body = req.body;
    if (!body.task_id) {
        return res.status(400).json({error: "Provide required details!"});
    }
    if (await task.findOne({
        id: body.task_id,
    })==null) {
        return res.status(400).json({message: `No task with task_id ${body.task_id} found!`});
    }
    
    const ID = idGenerator(8);
    await subTask.create({
        id: ID,
        task_id: body.task_id,
    })
    .then(() => {
        return res.status(200).json({message: `Subtask ${ID} successfully created :)`});
    })
    .catch((err) => {
        console.log(err);
        return res.status(500).json({message: "Error! Could not create task try again :("});
    })
}

const handleGetTasks = async (req, res) => {
    const filter = {};
    
    if (req.query.priority) {
        filter.priority = req.query.priority;
    }
    if (req.query.status) {
        filter.status = req.query.status;
    }
    if (req.query.due_date) {
        filter.due_date = req.query.due_date;
    }
    filter.deleted_at = null;

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    try {
        const alltasks = await task.find(filter);
        const totalCount = alltasks.length;
        const totalPages = Math.ceil(totalCount / limit);
        if (page > totalPages) {
            return res.json({ message: `With the given limit and filters, there are only ${totalPages} pages available` });
        }
        let alltasks_page=[];
        for (let i=skip; i<alltasks.length && i<skip+limit; i++) {
            alltasks_page.push(alltasks[i]);
        }
        return res.json(alltasks_page);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error! Pls try again :("});
    }
}

const handleGetSubTasks = async (req, res) => {
    const filter ={};
    if (req.query.task_id) {
        filter.task_id = req.query.task_id;
    }
    filter.deleted_at = null;

    try {
        const subtasks = await subTask.find(filter);
        if (!subtasks.length) {
            return res.status(400).json({message: "Given task_id not found :("});
        }
        return res.json(subtasks);
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error! Pls try again :("});
    }
}

const handleUpdateTasks = async (req, res) => {
    const task_id = req.params.task_id;
    if (!req.body) {
        return res.status(400).json({message: "Empty request! Provide required details!"})
    }
    const existingTask = await task.find({id: task_id});
    if (!existingTask || existingTask.deleted_at) {
        return res.status(404).json({ message: 'Task not found!' });
    }
    const { due_date, status } = req.body;
    const updateOptions = {};
    if (req.body.due_date) {
        updateOptions.due_date = req.body.due_date;
    }
    if (req.body.status) {
        updateOptions.status = req.body.status;
    }
    try {
        await task.findOneAndUpdate({id: task_id}, updateOptions);
        if (updateOptions.status=="DONE") {
            await subTask.updateMany({task_id: req.params.task_id}, {status: 1, updated_at: new Date()});
        } else if (updateOptions.status=="TODO") {
            await subTask.updateMany({task_id: req.params.task_id}, {status: 0});
        }
        return res.status(200).json({message: "successfully updated the task :)"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error! Pls try again :("});
    } 
}

const handleUpdateSubTasks = async (req, res) => {
    const subtask_id = req.params.subtask_id;
    if (!req.body || req.body.status==null) {
        return res.status(400).json({message: "Empty request! Provide required details!"})
    }
    const existingTask = await subTask.find({id: subtask_id});
    if (!existingTask || existingTask.deleted_at) {
        return res.status(404).json({ message: 'Task not found!' });
    }
    const subtask_status = req.body.status;
    try {
        //Updating subtask status
        const updated_subtask = await subTask.findOneAndUpdate({id: subtask_id}, {status: subtask_status, updated_at: new Date()}, { new: true });
        const task_id = updated_subtask.task_id;
        
        //Getting all the subtasks of the parent task
        const allSubTasks = await subTask.find({ task_id: task_id });

        //Updating corresponding parent task based on the status of all subtasks
        let status0Count = 0;
        let status1Count = 0;

        allSubTasks.forEach(subtask => {
            if (subtask.status === 0) {
                status0Count++;
            } else if (subtask.status === 1) {
                status1Count++;
            }
        });

        let task_status;
        if (status0Count == 0 && status1Count > 0) {
            task_status = "DONE";
        } else if (status0Count > 0 && status1Count == 0) {
            task_status = "TODO";
        } else {
            task_status = "IN_PROGRESS";
        }
        await task.findOneAndUpdate({ id: task_id }, { status: task_status });
        return res.status(200).json({message: "successfully updated the task :)"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error! Pls try again :("});
    }
}

const handleDeleteTasks = async (req, res) => {
    const id = req.params.task_id;
    const existingTask = await task.findOne({id: id});
    if (!existingTask || existingTask.deleted_at!=null) {
        return res.status(404).json({ message: "Task not found!" });
    }
    try {
        await task.findOneAndUpdate({id: id},{deleted_at: new Date()});
        await subTask.updateMany({task_id: id, deleted_at: null}, {deleted_at: new Date()});
        return res.status(200).json({message: `successfully deleted task and its subtasks :)`});
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error! Pls try again :("});
    }
}

const handleDeleteSubTasks = async (req, res) => {
    const id = req.params.subtask_id;
    const existingTask = await subTask.findOne({id: id});
    if (!existingTask || existingTask.deleted_at) {
        return res.status(404).json({ message: "Task not found!" });
    }
    try {
        await subTask.findOneAndUpdate({id: id},{deleted_at: new Date()});
        return res.status(200).json({message: `successfully deleted subtask :)`});
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error! Pls try again :("});
    }
}

module.exports = {
    handleRegister,
    handleLogin,
    handleCreateTasks,
    handleCreateSubTasks,
    handleGetTasks,
    handleGetSubTasks,
    handleUpdateTasks,
    handleUpdateSubTasks,
    handleDeleteTasks,
    handleDeleteSubTasks
};