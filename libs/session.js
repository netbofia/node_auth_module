"use strict"
const db=require('./db')
const bcrypt=require('bcrypt')
const auth=require('./authentication')

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
  return await db.upgrade("Session",{revokedOn},{where:{id}})
}
async function generateAccessToken(){
  let randomString=Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  let accessToken=await auth.hashPassword(randomString)
  return accessToken
}


module.exports={
  saveSession
}