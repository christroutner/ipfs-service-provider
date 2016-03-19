import app from '../bin/server'
import supertest from 'supertest'
import { expect, should } from 'chai'
import { cleanDb } from './utils'

should()
const request = supertest.agent(app.listen())
const context = {}

describe('Users', () => {
  before((done) => {
    cleanDb()
    done()
  })

  describe('POST /users', () => {
    it('should reject signup when data is incomplete', (done) => {
      request
        .post('/users')
        .set('Accept', 'application/json')
        .send({ username: 'supercoolname' })
        .expect(422, done)
    })

    it('should sign up', (done) => {
      request
        .post('/users')
        .set('Accept', 'application/json')
        .send({ user: { username: 'supercoolname', password: 'supersecretpassword' } })
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          res.body.user.should.have.property('username')
          res.body.user.username.should.equal('supercoolname')
          expect(res.body.user.password).to.not.exist
          expect(res.body.user.salt).to.not.exist

          context.user = res.body.user
          context.token = res.body.token

          done()
        })
    })
  })

  describe('GET /users', () => {
    it('should not fetch users if token is invalid', (done) => {
      request
        .get('/users?token=1')
        .set('Accept', 'application/json')
        .expect(401, done)
    })

    it('should fetch all users', (done) => {
      const { token } = context
      request
        .get(`/users?token=${token}`)
        .set('Accept', 'application/json')
        .expect(200, done)
    })
  })

  describe('GET /users/:id', () => {
    it('should not fetch user if token is invalid', (done) => {
      request
        .get('/users/1?token=1')
        .set('Accept', 'application/json')
        .expect(401, done)
    })

    it('should throw 404 if user doesn\'t exist', (done) => {
      const { token } = context
      request
        .get(`/users/1?token=${token}`)
        .set('Accept', 'application/json')
        .expect(404, done)
    })

    it('should fetch user', (done) => {
      const {
        user: { _id },
        token
      } = context

      request
        .get(`/users/${_id}?token=${token}`)
        .set('Accept', 'application/json')
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          res.body.should.have.property('user')

          expect(res.body.user.password).to.not.exist
          expect(res.body.user.salt).to.not.exist

          done()
        })
    })
  })

  describe('PUT /users/:id', () => {
    it('should not update user if token is invalid', (done) => {
      request
        .put('/users/1?token=1')
        .set('Accept', 'application/json')
        .expect(401, done)
    })

    it('should throw 404 if user doesn\'t exist', (done) => {
      const { token } = context
      request
        .put(`/users/1?token=${token}`)
        .set('Accept', 'application/json')
        .expect(404, done)
    })

    it('should update user', (done) => {
      const {
        user: { _id },
        token
      } = context

      request
        .put(`/users/${_id}?token=${token}`)
        .set('Accept', 'application/json')
        .send({ user: { username: 'updatedcoolname' } })
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          res.body.user.should.have.property('username')
          res.body.user.username.should.equal('updatedcoolname')
          expect(res.body.user.password).to.not.exist
          expect(res.body.user.salt).to.not.exist

          done()
        })
    })
  })

  describe('DELETE /users/:id', () => {
    it('should not delete user if token is invalid', (done) => {
      request
        .delete('/users/1?token=1')
        .set('Accept', 'application/json')
        .expect(401, done)
    })

    it('should throw 404 if user doesn\'t exist', (done) => {
      const { token } = context
      request
        .delete(`/users/1?token=${token}`)
        .set('Accept', 'application/json')
        .expect(404, done)
    })

    it('should delete user', (done) => {
      const {
        user: { _id },
        token
      } = context

      request
        .delete(`/users/${_id}?token=${token}`)
        .set('Accept', 'application/json')
        .expect(200, done)
    })
  })
})
