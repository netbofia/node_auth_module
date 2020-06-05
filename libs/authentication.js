"use strict"
const bcrypt=require('bcrypt')

module.exports=function(credentials){
  const db=require('./db')(credentials)
  async function register(firstName,lastName,email,password){
    let personModel=await db.create("Person",{firstName,lastName})
    let person=""
    if(personModel.dataValues){
      if(personModel.dataValues.id) person=personModel.dataValues.id  
    }
    let hash=await hashPassword(password)
    let confirmationToken=await generateConfirmationToken()
    let ban=0
    try{
      let user=await db.create("User",{person,email,hash,confirmationToken,ban})
      return user.dataValues.id
    }catch(err){
      if(err.name=="SequelizeUniqueConstraintError"){
        if(Object.keys(err.fields).includes("email")){
          return new Error('This email is already registered to another user! Either recovery this account or use another email!')    
        }else{
          return new Error(err.errors)
        }
      }else{
        return new Error(err)
      } 
    } 
  }
  function hashPassword(password){  
    return new Promise((res,rej)=>{
      bcrypt.genSalt(10,function(err, salt){
        bcrypt.hash(password,salt,function(err,hash){
          if(err) rej(err)
          res(hash)
        })
      })
    })
  }
  async function verifyEmail(id){
    return getUserMetadata(id).confirmationToken
  }
  async function incrementAuthAttempt(id){
    let attempts=await db.increment("User","attempt",{where:{id}})
    if(attempts>5){
      inactivateUser(id)
    }
  }
  async function getUserInfo(id){
    let data=await db.findByPk("Person",id)
    return data.dataValues
  }
  async function getUserMetadata(id){
    if(typeof id == "number"){
      let data=await db.findByPk("User",id)
      if(data!=null){
        return data.dataValues 
      }else{
        return null  
      } 
    }else{
      throw Error('While getting user info, an incorrect or no id was provided!')
    }
  }
  async function getIdFromEmail(email){
    try{
      let data=await db.findAll("User",{where:{email}})
      let id=data[0].dataValues.id  
      return id
    }catch(err){
      return err
    }
    

  }
  async function generateConfirmationToken(){
    let randomString=Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let confirmationToken=await hashPassword(randomString)
    return confirmationToken
  }
  async function activateUser(id){
    let active=await db.update("User",{active:1},{where:{id}})
    return active
  }
  async function inactivateUser(id){
    let active=await db.update("User",{active:0},{where:{id}})
    return active
  }
  async function banUser(id){
    let ban=await db.update("User",{ban:1},{where:{id}})
    return ban
  }
  async function unbanUser(id){
    let ban=await db.update("User",{ban:0},{where:{id}})
    return ban
  }
  async function isBanned(id){
    let user=await getUserMetadata(id)
    return user.ban
  }
  async function isActive(id){
    let user=await getUserMetadata(id)
    return user.active
  }
  function changePassword(id,oldpassword,newpassword){
    if(validatePassword(id,oldpassword)){
      setNewPassword
    }

  }
  async function validateLogin(email,password,callback){
    let id=await getIdFromEmail(email)
    if(!(id instanceof Error)){
      let validPassword=await validatePassword(id,password)
      if(validPassword){
        let activeUser=await isActive(id) 
        let banned=await isBanned(id)
        if( !banned && activeUser ){
          console.log("Logged in")
          let err=null
          return callback(err,id)
        }else{
          let err=new Error("Login is valid but user is inactive or banned")
          callback(err,id)
        }
      }else{
        incrementAuthAttempt(id)
        let err=new Error("Invalid password!")
        callback(err,id)      
      }
    }else{
      let err=new Error("Invalid email!")
      callback(err,id)
      
    }

  }
  function validateEmail(id,email){

  }
  async function validatePassword(id,password){
    try{
      let user=await getUserMetadata(id)
      let storedHash=user.hash
      return bcrypt.compareSync(password, storedHash)
    }catch(err){
      console.log(err)
      return false
    }
  }



  function challengeIdentityEmail(){

  }

  function resetPassword(id){
      //generate random password
      //set random generated passaword for user id
  }
  async function setPassword(id,password){
    let data=await db.update("User",{password},{where:{id}})
    console.log(data)  
  }


  function login(id){
    //start session
  }
  function logout(sessionId){
    //revoke session
  }

  function validateSession(id,accessToken){
    // send to session
  }
  function getUserFromToken(token){
    // send to session

  }
  return {
      register,
      activateUser,
      inactivateUser,
      banUser,
      unbanUser,
      isBanned,
      isActive,
      validateLogin,
      getUserInfo,
      getUserMetadata,
      getIdFromEmail,
      hashPassword
    } 
}