Direcbase client in Javascript
======================================================================
# Setup
Install direcbase via npm in Node.js
```sh
npm i direcbase

```
# Usage
## DirecAuth - user authentication APIs
Import authentication module
```js
import {direcauth as auth} from 'direcbase'
```
Login by using email and password
```js
const result = await auth.login({
            "email": email,
            "password": password
        })
```
Logout
```js
const result = await auth.logout()
```
Validate token if it was expired or invalidated
```js
const result = await auth.validate()
```
## DirecStore - data query APIs
The data query APIs are chained methods which represent similarly to SQL query syntax
Import data query module
```js
import {direcstore as ds} from 'direcbase'
```
Select query 
```js
const result = await ds.select().from('table_name')
    .where('field_name', 'operator', 'value')
    .orderBy('field_name', 'ASC')
    .limit(10)
    .offset(5)
    .onChange((data) => {   
        // data changes handling logic here
    })                         
```
=> onChange method is applied for the purpose of listening to data changes in reatime 

Insert query
```js
let entry = {
    // ... key-value pairs go here
}
const result = await ds.insert(entry).into('table_name')
```
Update query 
```js
let recordKey = 'abc'
let updateData = {
    // ... key-value pairs go here
}
const result = await ds.update(recordKey).into('table_name').set(updateData)
```
Delete query
```js
let recordKey = 'abc'
const result = await ds.delete(recordKey).from('table_name')
```
## DirecAdmin - system admin APIs
Import admin module
```js
import { direcadmin as da} from 'direcbase';
```
### List of methods
- Model admin
    editModel: create or delete a data model (table/view definition)
    editRules: edit data access rules select/insert/edit/delete for each data model
    deleteModel: delete a data model
- User admin
    createUser: create user
    editUser: edit user data
    deleteUser: delete user
    resetUserPwd: reset user password
- System admin
    getMetrics: get system statistics
    getEnv: get environment parameters
    setEnv: set environment parameters
## DirecFile - file storage APIs
Coming soon