const auth = require('./authentication')
const chai = require('chai')
const assert = chai.assert
const db= require('./db')
const session=require('./session')

var firstname="Hello"
var lastname="World"
var user = "testuser1"
var password = "testPassword123"
var email = "testingemail1@example.com"

before(function(){
  it("Registar mock user",async function(){
    this.id=await auth.register(firstname,lastname,email,password)
    assert.isNumber(this.id,"Register produced an new id!") 
  })
})
describe("Test authentication functions",function(){
  it("Verify created user and person",async function(){
    let id=this.id
    let person=await auth.getUserInfo(id)
    let user=await auth.getUserMetadata(id)
    assert.equal(person.firstName,firstname,"Created the correct firstname!")
    assert.equal(person.lastName,lastname,"Created the correct lastname!")
    assert.equal(user.email,email,"Created the correct email!")
    assert.isNotTrue(user.active,"Created user is inactive!")    
    assert.isNotTrue(user.ban,"Created user is not banned!")   
  })
  it("Ban mock user",async function(){
    let id=this.id
    let ban=await auth.banUser(id)
    let banState=await auth.isBanned(id)
    assert.isTrue(banState,"User banned!")
  })
  it("Unban mock user",async function(){
    let id = this.id
    let ban=await auth.unbanUser(id)
    let banState=await auth.isBanned(id)
    assert.isNotTrue(banState,"User unbanded banned!")
  })
  it("Inactive mock user",async function(){
    let id=this.id
    let active=await auth.inactivateUser(id)
    let activeState=await auth.isActive(id)
    assert.isNotTrue(activeState,"Inactive user!")
  })
  it("Active mock user",async function(){
    let id = this.id
    let active=await auth.activateUser(id)
    let activeState=await auth.isActive(id)
    assert.isTrue(activeState,"User is Active!")
  })
})
describe("Successful login with callback for session information",function(){
  let ipv4="127.0.0.1"
  let ipv6="::ffff:127.0.0.1"
  let platform="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"
  let valid=1
  let city="Almada"
  let country="Portugal"
  it("login and create session",async function(){
    let result=await auth.validateLogin(email,password,callback)
    async function callback(err,id){
      if(err) return err
      return await session.saveSession(id,ipv4,ipv6,platform,valid,city,country)
    }
    assert.equal(result.ipv4,ipv4,"Verify data was inserted")
  })
})
describe("Testing login",function(){
  it("Correct login",function(done){
    auth.validateLogin(email,password,callback)
    function callback(id){
      done()
    }
  })
  it("Incorrect login email",function(done){
    auth.validateLogin('wrong@email.com',password,callback)
    function callback(err){
      if(err instanceof Error) done()  
    }
  })
  it("Incorrect login password",function(done){
    auth.validateLogin(email,"password",callback)
    function callback(err){
      if(err instanceof Error) done()  
    }
  })
  it("Correct login but user is inactive",async function(){
    let id=await auth.getIdFromEmail(email)
    let active=await auth.inactivateUser(id)
    await auth.validateLogin(email,password,callback)
    function callback(err){
      assert.instanceOf(err,Error,"Make sure this fails with an error")
    }
  })
  it("Correct login but user is banned",async function(){
    let id=await auth.getIdFromEmail(email)
    let active=await auth.activateUser(id)
    let banned=await auth.banUser(id)
    await auth.validateLogin(email,password,callback)
    function callback(err){
      assert.instanceOf(err,Error,"Make sure this fails with an error")
    }
  })
})
describe("Test registering with an existing email",function(){
  it("trying to register with the same email",async function(){
    let result=await auth.register(firstname,lastname,email,"password")
    assert.instanceOf(result,Error,"Verify result is an error")  
    assert.equal(result.message,"This email is already registered to another user! Either recovery this account or use another email!")
  })
})

/*
describe("Testing repeated failed logins",function(){
  before(async function(){
    let id=await auth.getIdFromEmail(email)
    let banned=await auth.unbanUser(id)
  })
  describe("Retry login with wrong password",function(){
    this.retries(5)
    it("Incorrect login password",async function(done){
      await auth.validateLogin(email,"password",callback)
      function callback(err){
        auth.getUserMetadata()
        if(err instanceof Error) done()  
      }
    })
  })
  after(async function(){
    await auth.validateLogin(email,password,callback)
    function callback(err){
      assert.instanceOf(err,Error,"Make sure this fails with an error")
    }
  })  
})
*/


after(async function(){
  let id=await auth.getIdFromEmail(email)
  let destroyed=await db.destroy("Access",{where:{user_id:id}})
  destroyed=await db.destroy("User",{where:{id}})
  let user=await auth.getUserMetadata(id)
  assert.isNull(user,"check that the user doesn't exist anymore")
  console.log("Destroyed record!")
})
