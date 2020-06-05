//Generate a SQL file for the used datamodel.
class Authentication{
  constructor(credentials){
    const auth=require('./libs/authentication')(credentials)
    this.auth=auth
    const session=require('./libs/session')(credentials)
    this.session=session
  }

}