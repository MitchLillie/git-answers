'use strict';

const express = require('express');
const nodegit = require('nodegit');
var promisify = require("promisify-node")
const fse = promisify(require('fs-extra'))
const path = require('path')
fse.ensureDir = promisify(fse.ensureDir);

// Constants
const PORT = 8888;
const HOST = '0.0.0.0';
const TMP_DIR = '../git-tmp' //TODO change to something better like /git-tmp

var repository;
var index;
var remote;

// App
const app = express();
app.get('/', function (req, res) {
  res.send('Hello world\n');
});

app.get('/repos/:id', function (req, res) {
  let id = req.params.id
  let tmpRepoPath = path.resolve(TMP_DIR, id)
  console.log(tmpRepoPath);

  fse.ensureDir(tmpRepoPath)
    .then(function() {
      return nodegit.Repository.init(tmpRepoPath, 0);
    })
    .then(function(repo) {
      repository = repo;
      return fse.writeFile(path.join(repository.workdir(), 'message.txt'), 'hello node.js');
    })
    .then(function(){
      return repository.refreshIndex();
    })
    .then(function(idx) {
      index = idx;
    })
    .then(function() {
      return index.addByPath('message.txt');
    })
    .then(function() {
      return index.write();
    })
    .then(function() {
      return index.writeTree();
    })
    .then(function(oid) {
      var author = nodegit.Signature.create("Git Answers",
        "mlillie87@gmail.com", 123456789, 60);
      var committer = nodegit.Signature.create("Git Answers",
        "mlillie87@gmail.com", 987654321, 90);

      // Since we're creating an inital commit, it has no parents. Note that unlike
      // normal we don't get the head either, because there isn't one yet.
      return repository.createCommit("HEAD", author, committer, "message", oid, []);
    })
    .then(function() {
      console.log('committed')
      return nodegit.Remote.create(repository, "origin",
        `git@github.com:MitchLillie/something.git`)
      .then(function(remoteResult) {
        console.log('remote created')
        remote = remoteResult;

        // TODO: Create the repo itself

        // Create the push object for this remote
        return remote.push(
          ["refs/heads/master:refs/heads/master"],
          {
            callbacks: {
              certificateCheck: function() { return 1; },
              credentials: function(url, userName) {
                return nodegit.Cred.sshKeyFromAgent(userName);
              }
            }
          }
        );
      });
    })
    .catch(err => {
      console.log(err)
    })
    .done(function() {
      console.log("Done!");
    });

})

app.listen(PORT, HOST);
console.log('Running on http://' + HOST + ':' + PORT);
