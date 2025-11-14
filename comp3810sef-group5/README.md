**1. Project info: Project name, Group info (group no., students’ names, and SID)**
Project name: Simple Todo List Application
Group no.: 5
Students’ names, and SID:
Tsui Ching Kit, 14104856
Chan Pak Hei, 13494870
Qiu Yiu Fung, 13488063

**2. Project file intro:**
 - server.js: Express server with MongoDB connection, login/logout, CRUD web pages, RESTful APIs
 - package.json: dependencies: express, mongodb, ejs, cookie-session, bcrypt
 - public (folder): styles.css for styling
 - views (folder): login.ejs, signup.ejs, todos.ejs, edit.ejs
 - models (folder): empty

**3. The cloud-based server URL:**
comp3810sef-group05-dde7gmfhezhvb9gm.southafricanorth-01.azurewebsites.net

**4. Operation guides**
 - Use of Login/Logout pages: Go to /signup to create user. Login at /login. Click Logout.
 - Use of CRUD web pages:
   Create: Fill title/description → Add Todo
   Read: Use search box (supports partial match)
   Update: Click Edit → Update
   Delete: Click red Delete button
 - Use of RESTful CRUD services:
   GET /api/todos → curl http://localhost:8099/api/todos
   POST /api/todos → curl -X POST -H "Content-Type: application/json" -d '{"title":"Test"}' ...
   PUT /api/todos/:id → curl -X PUT ...

   DELETE /api/todos/:id → curl -X DELETE ...
