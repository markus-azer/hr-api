const expect = require('chai').expect;
//Start the App
const app = require('../app');
const request = require('supertest');

// Set up the data we need to pass to the login method
const userCredentials = {
  email: 'cross.worker.challenge@gmail.com', 
  password: '123456'
}
// Login the user before we run any tests
const authenticatedUser = request.agent(app);

before(function(done){
  authenticatedUser
    .post('/user/signin')
    .send(userCredentials)
    .end(function(err, response){
      expect(response.statusCode).to.equal(200);
      done();
    });
});

describe('App', () => {
  it('Should exists', function(){
    expect(app).to.be.a('function');});
});