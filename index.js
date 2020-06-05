//Generate a SQL file for the used datamodel.
class Authentication{
  constructor(credentials){
    const auth=require('./libs/authentication')(credentials)
    this.auth=auth
    const session=require('./libs/session')(credentials)
    this.session=session
  }
  generateDataModel(destination){
    const fs=require('fs')
    const { COPYFILE_EXCL } = fs.constants;
    fs.copyFileSync(__dirname+"/SQL/LATEST_dump.sql", destination+'/auth-datamodel.sql',COPYFILE_EXCL);
  }
}