# node_auth_module
Authentication module using [node_db_module](https://github.com/netbofia/node_db_module/)

This uses the sequelize framework to provide an authentication frameowork to integrate with your application, using supported SQL OSBDs.

# Import the db [schema](https://github.com/netbofia/node_auth_module/blob/master/SQL/schema.sql)
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
  
* returns id (int)
  - The primary key (id) of the table User
* return error
  - if there is some problem
  
* Usage:
``` js
authModule.auth.register(firstName,lastName,email,password,thirdparty)
```
  
### activateUser
* type: async function 
* parameters: id
  - id (int)
  
* returns ??
  - db model with update result
* return error
  - if there is some problem (it should at least)
  
* Usage:
``` js
authModule.auth.activateUser(id)
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
* type: async function 
* parameters: user_id,ipv4,ipv6,platform,valid,city,country
  - user_id (int)
  - ipv4 (string)
  - ipv6 (string)
  - platform (sring)
  - valid (boolean)
  - city (string)
  - country (string)
  
* returns id 
  - if all goes well
* return error
  - if there is some problem
  
* Usage:
``` js
authModule.register(firstName,lastName,email,password,thirdparty)
```
### listSessions
* type: async function 
* parameters: userId
  - userId (int) [Primary key (id) from table Person]
  
* returns (array) 
  - List of all the session for the userId, the accessToken will not be present in the array
  
* Usage:
``` js
authModule.listSessions(userId)
```
### revokeSession
* type: async function 
* parameters: id
  - id (int)
  
* returns ??
  - update result
  
* Usage:
``` js
authModule.session.revokeSession(firstName,lastName,email,password,thirdparty)
```
### validateSession
* type: async function 
* parameters: id,accessToken
  - id (int)
  - accessToken (string)
  
* returns (boolean)
  - Valid or Not
  
* Usage:
``` js
authModule.session.validateSession(id,accessToken)
```
