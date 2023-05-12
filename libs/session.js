"use strict"
const bcrypt=require('bcrypt')

module.exports=function(credentials){
  const auth=require('./authentication')(credentials)
  const db=require('./db')(credentials)

  async function saveSession(user_id,ipv4,ipv6,platform,valid,city,country){
    let accessToken=await generateAccessToken()
    try{
      let newSession=await db.create('Access',{user_id,ipv4,ipv6,platform,valid,city,country,accessToken})
      return newSession.dataValues
    }catch(err){
      return err
    }
  }
  function extractLocationfromIp(ipv4){


  }
  async function revokeSession(id){
    let revokedOn=new Date()
    return await db.update("Access",{revokedOn, valid:0},{where:{id}})
  }
  async function generateAccessToken(){
    let randomString=Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let accessToken=await auth.hashPassword(randomString)
    return accessToken
  }
  async function listSessions(user_id){
    let sessions=await db.findAll("Access",{where:{user_id}})
    let results=[]
    sessions.forEach(session=>{
      let temp=removeAccessTokenFromExport(session)
      results.push(temp)
    })
    return results
    function removeAccessTokenFromExport(session){
      let result=Object.assign({},session.dataValues)
      delete result.accessToken
      return result
    }
  }

  async function validateSession(id,accessToken){
    let result=await db.findByPk("Access",id)
    let storedAccessToken=result.accessToken
    return accessToken === storedAccessToken
  }

  return {
    saveSession,
    listSessions,
    revokeSession,
    validateSession
  }
}