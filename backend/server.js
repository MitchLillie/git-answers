'use strict'

const GITLAB_URL = process.env.GITLAB_PORT_80_TCP_ADDR || 'http://localhost'

const promisify = require('promisify-node')

const express = require('express')
const fse = promisify(require('fs-extra'))
fse.ensureDir = promisify(fse.ensureDir)
const gitlab = require('gitlab')({
  url: GITLAB_URL,
  token: 'HtZjA6YjYjx85V1Vs8MV'
})
const nodegit = require('nodegit')
const path = require('path')
const winston = require('winston')

// Constants
const PORT = 8888
const HOST = '0.0.0.0'
const TMP_DIR = '../git-tmp' // TODO change to something better like /git-tmp

var repository
var index
var remote

// App
const app = express()
app.get('/', function (req, res) {
  res.send('Hello worlds!\nIt can\'t be!')
})


// Get all questions
app.get('/questions', function (req, res) {
  // Retrieve all projects
  // Render names & metadata
})

// Get specific question
app.get('/question/:id', function (req, res) {
  // Retrieve project based on id
  // Render content, name and metadata
})

// Get specific proposal
app.get('/question/:id/proposal/:pid', function (req, res) {
  // Retrieve proposal based on pid
  // Render content, name and metadata
})

// Get history of edits (TODO: blame, etc)
app.get('/question/:id/history', function (req, res) {
  // Retrieve commits for project based on id
  // Render name & list of commits
})

// Add a new question
app.post('/question', function (req, res) {
  // Check if id exists
  // Write data to file
  // Add file
  // Commit file
  // Create remote repo
  // Add remote repo as git-remote
  // Push to remote
  // Delete tmp repo
  // Confirm completion (redirect to question page)
})


// Edit/approve/delete a new proposal to a question
app.post('/questions/:id/propose', function (req, res) {
  // Extract action from POST
  // Ensure repo is level with origin/master
  // Checkout new branch with uid
  // Edit file locally
  // Add & commit file
  // Push to repo
  // Render latest diff from branch to master
  // Delete tmp repo
})

app.get('/repos/:id', function (req, res) {
  let id = req.params.id
  let tmpRepoPath = path.resolve(TMP_DIR, id)

  fse.ensureDir(tmpRepoPath)
    .then(function () {
      return nodegit.Config.openDefault().then(function (config) {
        return Promise.all([
          config.setString('user.name', 'Administrator'),
          config.setString('user.email', 'admin@example.com')
        ])
      })
    })
    .then(function () {
      return nodegit.Repository.init(tmpRepoPath, 0)
    })
    .then(function (repo) {
      repository = repo
      return fse.writeFile(path.join(repository.workdir(), 'message.txt'), 'hello node.js')
    })
    .then(function () {
      return repository.refreshIndex()
    })
    .then(function (idx) {
      index = idx
    })
    .then(function () {
      return index.addByPath('message.txt')
    })
    .then(function () {
      return index.write()
    })
    .then(function () {
      return index.writeTree()
    })
    .then(function (oid) {
      var author = nodegit.Signature.create('Git Answers',
        'mlillie87@gmail.com', 123456789, 60)
      var committer = nodegit.Signature.create('Git Answers',
        'mlillie87@gmail.com', 987654321, 90)

      // Since we're creating an inital commit, it has no parents. Note that unlike
      // normal we don't get the head either, because there isn't one yet.
      return repository.createCommit('HEAD', author, committer, 'message', oid, [])
    })
    .then(function () {
      winston.debug('committed')
      return nodegit.Remote.create(repository, 'origin',
        `git@${GITLAB_URL}:root/${id}.git`)
      .then(function (remoteResult) {
        winston.debug('remote created')
        remote = remoteResult

        return new Promise(function (resolve, reject) {
          gitlab.projects.create({name: `${id}`}, function (res) {
            winston.debug('Created project: ', res)
            // Create the push object for this remote
            remote.push(
              ['refs/heads/master:refs/heads/master'],
              {
                callbacks: {
                  certificateCheck: function () { return 1 },
                  credentials: function (url, userName) {
                    return nodegit.Cred.sshKeyNew(userName, '/root/.ssh/id_rsa.pub', '/root/.ssh/id_rsa', '')
                  }
                }
              }
            ).then(resolve).catch(reject)
          })
        })
      })
    })
    .catch(err => {
      winston.error(err)
    })
    .done(function () {
      winston.debug('Done!')
    })
})

app.listen(PORT, HOST)
winston.info('Running on http://' + HOST + ':' + PORT)
winston.debug('Listening with environment vars: ', process.env)
