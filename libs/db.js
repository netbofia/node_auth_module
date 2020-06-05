module.exports=function(credentials){
  const db=require('node_db_module')(credentials,__dirname+"/../tables")

  function findAll(tablename,attributes){
    return db.db[tablename].findAll(attributes)
  }
  function findByPk(tablename,pk,attributes){
    return db.db[tablename].findByPk(pk,attributes)
  }
  function getStructuredResponse(sourceTable,tableConnections,structure){
    return db.usecontroller(sourceTable,tableConnections,structure)
  }
  function create(tablename,attributes){
    return db.db[tablename].create(attributes)
  }
  function update(tablename,attributes,where){
    return db.db[tablename].update(attributes,where)
  }
  function increment(tablename,options,where){
    return db.db[tablename].increment(options,where)
  }
  function destroy(tablename,where){
    return db.db[tablename].destroy(where) 
  }
  return {findAll,create,findByPk,getStructuredResponse,update,increment,destroy}
}