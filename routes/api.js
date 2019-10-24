/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');
  // Connect mongoose
  mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});
  //Define the schemas
  const boardSchema = {
          title: {
            type: String,
            required: true,
            unique: true,
          },
          created_on: {
            type: Date,
            default: Date.now
          },
          last_post: {
            type: Date,
            default: Date.now
          },
          threads: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
          }]
        },
        threadSchema = {
          board_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Board'
          },
          text: {
            type: String,
            required: true
          },
          created_on: {
            type: Date,
            default: Date.now
          },
          bumped_on: {
            type: Date,
            default: Date.now
          },
          delete_password: {
            type: String,
            required: true
          },
          reported: {
            type: Boolean,
            default: false
          },
          replies: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reply'
          }]
        },
        replySchema = {
          thread_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
          },
          text: {
            type: String,
            required: true
          },
          reported: {
            type: Boolean,
            default: false
          },
          created_on: {
            type: Date,
            default: Date.now
          },
          delete_password: {
            type: String,
            required: true
          }
        },
        Board = new mongoose.model('Board', boardSchema),
        Thread = new mongoose.model('Thread', threadSchema),
        Reply = new mongoose.model('Reply', replySchema),
        boardQuery = (title) => Board.findOne({ title }),
        threadQuery = (id) => Thread.findById(id),
        replyQuery = (id) => Reply.findById(id);

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    // Return a board object with populated list of threads/replies.
    .get(async (req, res) => {
    /*
      Board.deleteMany({}).exec();
      Thread.deleteMany({}).exec();
    */
    // Find out which board we are using
    const title = req.params.board;
    // Get the board document
    const board = await (async () => {
      try {
        // Get a doc of the board with threads populated
        const doc = await boardQuery(title).populate({ 
          path: 'threads',
          populate: {
            path: 'replies',
            select: 'board_id _id text created_on bumped_on',
            options: {
              limit: 3,
              sort: {
                created_on: -1
              }
            }
          },
          select: 'board_id _id text created_on bumped_on',
          options: {
            limit: 10,
            sort: { 
              bumped_on: -1 
            }
          }
        }).exec();
        if(!doc) return { error: `No board matching ${title}` };
        return await doc;
      } catch(err) {
        return err;
      }            
    })();
    return res.json(board);          
    })
    // Post, create a thread/board
    .post(async (req, res) => {
      // Define the board
      let title = req.params.board;
      try {
        let text = req.body.text;
        let delete_password = req.body.delete_password;
        // Get a doc for the board and create one if there isn't one
        const board = await ( async () => {
            let board = await boardQuery(title).exec();
            if(board) return board;
            if(!board) {
              const newBoard = new Board({
                title
              });
              return newBoard.save();
            }
        })();
        // Create a thread for the board using a self invoked function
        const thread = await ( async () => {
          let newThread = new Thread({
            text,
            delete_password,
            board_id: board._id
          });
          return await newThread.save();
        })();
        // Update the board
        board.threads.push(thread);
        board.last_post = new Date();
        // Save the board
        board.save();
        // Redirect the page
        return res.redirect(`/b/${title}/`);
      // Catch errors
      } catch(err) {
        return err;
      }
    })
    // Report a thread
    .put(async (req, res) => {
      try {
        // Get the board name
        const id = req.body.thread_id;
        // Get the thread document
        const thread = await threadQuery(id).exec();
        if(!thread) return res.send(`No thread found with the ID '${id}'`);
        if(thread.reported) return res.send(`The thread with the ID ${id} has already been reported`);
        thread.reported = true;
        thread.save();
        console.log(thread);
        return res.send(`Thread with the ID ${id} has been reported`);
      } catch(err) {
        return err;
      }        
    })
    // Delete a thread
    .delete(async (req, res) => {
      const board = req.params.board,
            delete_password = req.body.delete_password,
            thread_id = req.body.thread_id;
      try {
        // Get the board document
        const boardDoc = await boardQuery(board).exec();
        // Get the thread document
        const threadDoc = await threadQuery(thread_id).exec();
        // Handle no doc found
        if(!threadDoc)
          return res.send(`There doesn't seem to be a thread with the ID ${thread_id}`);
        // Check the password
        if(threadDoc.delete_password === delete_password) {
          // Delete the thread from the DB
          await Thread.findOneAndDelete({ _id: thread_id }).exec();
          await Reply.deleteMany({_id: { $in: threadDoc.replies } }).exec();
          boardDoc.threads.splice(boardDoc.threads.indexOf(thread_id), 1);
          boardDoc.save();
          return res.send(`Sucessfully deleted the thread with the id ${thread_id} and all replies associated with it`);
        } else {
          return res.send(`Incorrect delete password. You entered ${delete_password}`);
        }
      } catch(err) {
        
      }
    });
    
  app.route('/api/replies/:board')
    .get(async (req, res) => {
      try {
        // Set the variables
        const { thread_id } = req.query;
        // Get the thread document
        const threadDoc = await threadQuery(thread_id)
              .select('_id replies created_on bumped_on text')
              .populate({
                path: 'replies',
                select: 'text thread_id created_on'
              })
              .exec();
        // Catch null doc
        if(!threadDoc)
          return res.send(`It looks like a thread with the ID ${thread_id} does not exist.`);
        // Return the document if no errors
        return res.json(threadDoc);
      } catch(err) {
        if(err)
          return err;
      }
    })
    .post(async (req, res) => {
      try {
        // Set variables
        const board = req.params.board;
        const { text, delete_password, thread_id } = req.body;
        // get the thread
        const thread = await threadQuery(thread_id).exec();
        // return error is there isn't a thread
        if(!thread)
            return res.send(`It looks like there isn't a thread with the ID '${thread_id}'`);
        // Create a reply object
        const newReply = new Reply({
          text,
          delete_password,
          thread_id
        });
        // Save it
        await newReply.save();
        // Update the thread
        thread.replies.push(newReply);
        thread.bumped_on = new Date();
        // Save it
        await thread.save();
        return res.redirect(`/b/${board}/${thread_id}/`);
      // Catch errors
      } catch(err) {
        if(err) return err;
      }
    })
    .put(async (req, res) => {
      try {
        const title = req.params.board;
        const { thread_id, reply_id } = req.body;
        const replyDoc = await replyQuery(reply_id).exec();
        if(!replyDoc) return res.send(`It looks like there isn't a reply with the ID ${reply_id}`);
        if(replyDoc.reported) return res.send(`The reply with the ID ${reply_id} has already been reported`);
        replyDoc.reported = true;
        replyDoc.save();
        console.log(replyDoc);
        return res.send(`Sucessfully reported the reply with the iID ${reply_id}`);
      } catch (err) {
        return err;
      }
    })
    .delete(async (req, res) => {
      try {
        const board = req.params.board;
        const { reply_id, thread_id, delete_password } = req.body;
        const reply = await replyQuery(reply_id).exec();
        if (!reply) return res.send(`There isn't a reply with the ID ${reply_id}`);
        if (reply.delete_password !== delete_password) return res.send(`Incorrect password`);
        if (reply.text === 'DELETED') return res.send(`Reply with the ID ${reply_id} already deleted`);
        reply.text = 'DELETED';
        reply.save()
        return res.send(`Reply with the ID ${reply_id} successfully deleted`);
      } catch (err) {
        if (err) return err;
      }
    });
  
  app.route('/api/boards')
    .get(async (req, res) => {
      let boards = await Board.find({}).exec();
      return res.send(boards);
    });
};
