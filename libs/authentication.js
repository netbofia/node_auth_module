"use strict"
const bcrypt=require('bcrypt')

module.exports=function(credentials){
  const db=require('./db')(credentials)

  async function register(firstName,lastName,email,password,thirdparty){
    let personModel=await db.create("Person",{firstName,lastName})
    let person=""
    if(personModel.dataValues){
      if(personModel.dataValues.id) person=personModel.dataValues.id
    }
    let hash=""
    if(password==null && thirdparty===true){
      password=Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      hash=await hashPassword(password)
    }else{
      if(password.legnth<8){
        return new Error("This password is too short! Must be at least 8 characters")
      }else{
        hash=await hashPassword(password)
      }
    }
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
    let userMeta=await getUserMetadata(id)
    let personId=userMeta.person
    let data=await db.findByPk("Person",personId)
    return data.dataValues
  }
  async function getUserHash(id){
    if(typeof id == "number"){
      let data=await db.findByPk("User",id)
      if(data!=null){
        return data.dataValues.hash
      }else{
        return null
      }
    }else{
      throw new Error('While getting user hash, an incorrect or no id was provided!')
    }
  }
  async function getUserMetadata(id){
    if(typeof id == "number"){
      let data=await db.findByPk("User",id)
      if(data!=null){
        delete data.dataValues.hash
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
  async function getConfirmationToken(id){
    try{
      let user=await getUserMetadata(id)
      return user.confirmationToken
    }catch(error){
      return error
    }
  }
  async function generateConfirmationToken(){
    let randomString=Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let confirmationToken=await hashPassword(randomString)
    return confirmationToken
  }
  async function setNewConfirmationToken(id){
    let confirmationToken=await generateConfirmationToken()
    let data=await db.update("User",{confirmationToken},{where:{id}})
    if(data instanceof Error) return data
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

  async function changePassword(id,oldpassword,newpassword){
    if(await validatePassword(id,oldpassword)===true){
      return await setNewPassword(id, newpassword) === true;
    }else{
      return false
    }
  }

  async function resetPassword(id){
    let randomString=Math.random().toString(36).substring(10, 15) + Math.random().toString(36).substring(5, 10);
    let newHash=await hashPassword(randomString)
    let update=await db.update("User",{hash:newHash},{where: {id}})
    if(update instanceof Error) return update
    return randomString
  }

  async function setNewPassword(id,password){
    try{
      let hash=await hashPassword(password)
      let data=await db.update("User",{hash},{where:{id}})
      return true
    }catch(err){
      return false
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
          return callback(err,id,thirdparty=false,success="Logged in!")
        }else{
          let err=new Error("Login is valid but user is inactive or banned")
          return callback(err,id)
        }
      }else{
        incrementAuthAttempt(id)
        let err=new Error("Invalid password!")
        return callback(err,id)
      }
    }else{
      let err=new Error("Invalid email!")
      return callback(err,id)

    }

  }
  function validateEmail(id,email){

  }
  async function validatePassword(id,password){
    try{
      let storedHash=await getUserHash(id)
      return bcrypt.compareSync(password, storedHash)
    }catch(err){
      console.log(err)
      return false
    }
  }
  async function validateEmailConfirmationToken(email,confirmationToken){
    try{
      let id=await getIdFromEmail(email)
      let storedConfirmationToken=await getConfirmationToken(id)
      let activeStatus=await isActive(id)
      if(storedConfirmationToken===confirmationToken && activeStatus===true){
        return true
      }else{
        return false
      }
    }catch(err){
      return false
    }
  }


  function challengeIdentityEmail(){

  }

  function login(id){
    //start session
  }
  function logout(sessionId){
    //revoke session
  }

  function getUserFromToken(token){
    // send to session

  }
  async function listUsers(){
    let sourceTable="User"
    let tableConnections={"Person":{}}
    let structure={
      userId:"id",
      personId:{_table:"Person",_attribute:"id"},
      email:"email",
      firstName:{_table:"Person",_attribute:"firstName"},
      lastName:{_table:"Person",_attribute:"lastName"},
      active:"active",
      banned:"ban"
    }
    let results=await db.getStructuredResponse(sourceTable,tableConnections,structure)
    return results.data
  }
  return {
    register,
    activateUser,
    inactivateUser,
    banUser,
    changePassword,
    unbanUser,
    isBanned,
    isActive,
    validateLogin,
    getUserInfo,
    getUserMetadata,
    getIdFromEmail,
    setNewConfirmationToken,
    hashPassword,
    listUsers,
    validateEmailConfirmationToken,
    resetPassword
  }
}
