# node_auth_module
Authentication module using node_db_module
# Import the db [schema](/netbofia/node_auth_module/blob/master/SQL/schema.sql)
``` bash
mysql -u [user] -D [database] -p < sql/schema.sql
```
# Configure credentials


# Simple example
``` js
const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")
```

## Authentication

### register
* type: async function 
* parameters: firstName,lastName,email,password,thirdparty
  - firstName (string)
  - lastName (string)
  - email (string)
  - password (sring)
  - thirdparty (boolean) [optional]
  
* returns id 
  - if all goes well
* return error
  - if there is some problem
  
* Usage:
``` js
authModule.register(firstName,lastName,email,password,thirdparty)
```
  
### activateUser
* type: async function 
* parameters: id
  - id (int)
  
* returns active
  - db model with update result
* return error
  - if there is some problem (it should at least)
  
* Usage:
``` js
authModule.activateUser(id)
```
### inactivateUser
### banUser
### unbanUser
### isBanned
### isActive
### validateLogin
### getUserInfo
### getUserMetadata
### getIdFromEmail
### hashPassword
### listUsers
### validateEmailConfirmationToken

## Session

### saveSession
### listSessions,
### revokeSession,
### validateSession

