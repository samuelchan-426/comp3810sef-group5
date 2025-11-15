**COMP3810SEF-Group5: Simple Todo List Application**

# 1. Project info: Project name, Group info (group no., students’ names, and SID)
**Project name**: Simple Todo List Application  
**Group no.**: 5  
**Students’ names and SID**:  
Tsui Ching Kit, 14104856
Chan Pak Hei, 13494870
Qiu Yiu Fung, 13488063 

---

# 2. Project file intro:
**server.js**: Express setup, MongoDB Atlas connection, secure login/logout with `cookie-session` and `bcrypt`, full CRUD web pages with preview & double confirmation for create/edit/delete, ownership tracking (`Added by` / `Edited by`), HKT timestamps, search with partial match, and RESTful APIs for `todos` and `users`.  
**package.json**: Lists of dependencies, including `express`, `mongodb`, `ejs`, `cookie-session`, `bcrypt`.  
**public**: Contains `styles.css` for responsive, modern UI (centered header, top-right logout, full-width divider, preview boxes, confirmation buttons).  
**views**: Contains `login.ejs`, `signup.ejs`, `todos.ejs`, `edit.ejs`, `logout.ejs`, `preview-create.ejs`, `preview-edit.ejs` – all with consistent branding, editable forms, preview steps, and confirmation dialogs. 

---

# 3. The cloud-based server URL for testing:
comp3810sef-group05-dde7gmfhezhvb9gm.southafricanorth-01.azurewebsites.net

---

# 4. Operation guides
## Use of Login/Logout pages:

1. Open URL (see #3) → link to **Create an account** → create account (e.g., username: `alice`, password: `123`)  
2. Success message: **"Account created! Please log in."** → link to **Back to Login** 
3. Enter username & password → click **Login**  
4. Redirected to **/todos** → shows **"Welcome, alice!"**  
5. Click **Logout** (top-right red button) → shows **"Successfully logged out!"** → link to **Back to Login**

**Valid login example**:  
`username: alice` | `password: 123`

---

## Use of CRUD web pages:
| Action | UI Flow |
|--------|--------|
| **Create** | 1. Fill **Title** + **Description** → **Preview & Confirm** → 2. See preview → **Confirm Create** → shows **"Todo created successfully!"** |
| **Read**   | View list + **Search by Title** (type any part: `t` → matches `test`, `Test`, `my_test`) → shows **"X item(s) found" for "t"** |
| **Update** | 1. Click **Edit** → **Editable form** → 2. Modify → **Preview Changes** → 3. Confirm Update → shows **"Todo updated successfully!"** |
| **Delete** | Click **Delete** → **Browser confirmation dialog** → **"Are you sure?"** → **Yes** → shows **"Todo deleted successfully!"** |

**Ownership & Timestamps (HKT)**:  
New: `Added by: alice on 15 Nov 2025 at 5:00 PM HKT`  
Edited: `Edited by: alice on 15 Nov 2025 at 5:05 PM HKT`

---

## Use of RESTful CRUD services:
### RESTful APIs – **TODOS** (no authentication)
| Method | URI | cURL Command |
|--------|-----|--------------|
| **GET** | `/api/todos`  | curl http://localhost:8099/api/todos              |
| **POST**| `/api/todos`  | curl -X POST http://localhost:8099/api/todos \    |
|         |               |      -H "Content-Type: application/json" \        |
|         |               |      -d '{"title":"Buy milk","description":"2L"}' |
| **PUT** | `/api/todos/:id` | curl -X PUT http://localhost:8099/api/todos/id (input your id generate from above command) \       |
|         |                  |      -H "Content-Type: application/json" \                                                         |
|         |                  |      -d '{"title":"Buy almond milk"}'                                                              |
| **DELETE** | `/api/todos/:id` | curl -X DELETE http://localhost:8099/api/todos/id (input your id generate from above command)   |

---

### RESTful APIs – **USERS** (no authentication)
| Method | URI | cURL Command |
|--------|-----|--------------|
| **GET** | `/api/users` | curl http://localhost:8099/api/users |
| **POST**| `/api/users` | curl -X POST http://localhost:8099/api/users \  |
|         |              |      -H "Content-Type: application/json" \      |
|         |              |      -d '{"username":"bob","password":"secret"}'|
| **PUT** | `/api/users/:id` | curl -X PUT http://localhost:8099/api/users/id (input your id generate from above command) \     |
|         |                  |      -H "Content-Type: application/json" \                                                       |
|         |                  |      -d '{"password":"newpass"}'                                                                 |
| **DELETE** | `/api/users/:id` | curl -X DELETE http://localhost:8099/api/users/id (input your id generate from above command) |

---

### Notes:
- **Web UI**: Login required. Uses `cookie-session`.  
- **REST APIs**: **No authentication**. 
- **Search**: Uses MongoDB `$regex` with `$options: 'i'` → **partial, case-insensitive**.  
- **Security**: Passwords hashed with `bcrypt`.  
- **Timestamps**: Stored in UTC, displayed in **HKT (Asia/Hong_Kong)**.  
- **User Safety**: All CRUD actions require **preview + confirmation** (edit form → preview → confirm).  
- **Delete Confirmation**: Uses **browser `confirm()` dialog**.  
- **Port**: `8099` (local), `process.env.PORT` on Azure.  
- **Deployment**: GitHub → Azure App Service. `MONGO_URI` set in **App Settings**.
- **REST APIs**: All 8 endpoints (4 for `todos`, 4 for `users`) fully implemented and tested on Ubuntu VM.

---

