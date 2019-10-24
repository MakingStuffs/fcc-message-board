/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);
/*
  suite('Functional Tests', function() {
    suite('get boards TEST GET request to /api/boards', function(){
      test('GET /api/boards', function(done) {
        chai.request(server)
        .get('/api/boards/')
        .end((err, res) => {
          console.log(res.body);
          done()
        })
      })
    })
  
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    test('POST', function(done) {
      chai.request(server)
        .post('/api/threads/general')
        .send({
          text: 'Cunt',
          delete_password: 'balls'
        })
        .end((req, res) => {
          console.log(res.body)
          assert.equal(res.statusCode, 200);
          done();
        });
    });
    
    test('GET', function(done) {
      chai.request(server)
      .get('/api/threads/general')
      .end((err, res) => {
        assert.isBelow(res.body.threads.length, 11);
        assert.isBelow(res.body.threads[0].replies.length, 4);
        assert.isUndefined(res.body.threads[0].delete_password);
        assert.isUndefined(res.body.threads[0].reported);
        done();
      });
    });
    
    test('DELETE', function(done) {
      chai.request(server)
        .delete('/api/threads/general')
        .send({thread_id: '5da5c50d437e3e436aafa557', delete_password: 'balls' })
        .end((req, res) => {
          assert.equal(res.text, "There doesn't seem to be a thread with the ID 5da5c50d437e3e436aafa557");
          done();
        });
    });
    
    test('PUT', function(done) {
      chai.request(server)
        .put('/api/threads/general')
        .send({ thread_id: '5da61490bcd01a77ccf6d34a'})
        .end((req, res) => {
          assert.equal(res.text, "The thread with the ID 5da61490bcd01a77ccf6d34a has already been reported");
          done();
        });
    });
    

  });  
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    test('POST', function(done) {
      chai.request(server)
        .post('/api/replies/general')
        .send({ delete_password: 'balls', text: 'Some reply text', thread_id: '5da5f6b8c56e084792b144c4' })
        .end((err, res) => {
          assert.equal(res.statusCode, 200);
          done();
        })
    });
    
    test('GET', function(done) {
      chai.request(server)
        .get('/api/replies/general?thread_id=5da5f6b8c56e084792b144c4')
        .end((err, res) => {
          assert.isDefined(res.body.replies);
          assert.isUndefined(res.body.delete_password);
          assert.isUndefined(res.body.replies[0].delete_password);
          assert.isUndefined(res.body.reported);
          assert.isUndefined(res.body.replies[0].reported);
          done();
        });
    });
    
    test('PUT', function(done) {
      chai.request(server)
      .put('/api/replies/general')
      .send({thread_id: '5da5f6b8c56e084792b144c4', delete_password: 'balls', reply_id: "5da60840e70f4b29370e88f8" })
      .end((req, res) => {
        assert.equal(res.text, "The reply with the ID 5da60840e70f4b29370e88f8 has already been reported");
        done();
      });
    });
    
    test('DELETE', function(done) {
      chai.request(server)
      .delete('/api/replies/general')
      .send({thread_id: '5da5f6b8c56e084792b144c4', delete_password: 'balls', reply_id: "5da60840e70f4b29370e88f8" })
      .end((req, res) => {
        assert.equal(res.text, "Reply with the ID 5da60840e70f4b29370e88f8 already deleted");
        done();
      });
    });
    
  });

});
*/