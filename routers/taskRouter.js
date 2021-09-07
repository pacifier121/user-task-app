const express = require('express');
const Task = require('../models/taskModel.js');
const auth = require('../src/middleware/auth.js');

const router = new express.Router();

router.get('/task/:id', auth, async(req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send({ error: 'Task not found' });
        }
        res.send(task);
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: "An error occured" });
    }
})

// Get tasks?completed=true
router.get('/tasks', auth, async(req, res) => {
    try {
        let tasks;
        if (req.query.completed !== undefined) {
            tasks = await Task.find({ owner: req.user._id, completed: req.query.completed });
        } else {
            tasks = await Task.find({ owner: req.user._id });
        }
        res.send(tasks);
    } catch (err) {
        console.log(err);
        res.send({ error: "Error occured" });
    }
})

router.post('/task', auth, async(req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.send(task);
    } catch (err) {
        res.status(400).send({ error: "Error occured while saving task to database" });
    }
})

router.patch('/task/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body);

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send({ error: "Task not found" });
        }

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();

        res.send(task);
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: "Something went wrong" });
    }
})

router.delete('/task/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            return res.status(404).send({ error: "Task not found" });
        }
        task.remove();
        res.send(task);
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: "Error while deleting task" });
    }
})

module.exports = router;