**COMP3810SEF-Group5: Simple Todo List Application**

---

# 1. Project info: Project name, Group info (group no., students’ names, and SID)

**Project name**: Simple Todo List Application  
**Group no.**: 5  
**Students’ names and SID**:  
Tsui Ching Kit, 14104856  
Chan Pak Hei, 13494870  
Qiu Yiu Fung, 13488063  

---

# 2. Project file intro:

- **server.js**: Including Express web server setup, MongoDB Atlas connection, secure login/logout using `cookie-session` and `bcrypt`, full CRUD operations with double confirmation (preview → confirm) for create/edit/delete, ownership tracking (`Added by`, `Edited by`), welcome message on login, HKT timestamps, search with partial match of title, search by due date, and RESTful APIs for both `todos` and `users`.  
- **package.json**: lists of dependencies, including `express`, `mongodb`, `ejs`, `cookie-session`, `bcrypt`.  
- **public (folder)**: Contains `styles.css` for responsive, modern UI with centered header, top-right logout button, full-width divider, preview boxes, and consistent button styles.  
- **views (folder)**: Contains `login.ejs`, `signup.ejs`, `todos.ejs`, `edit.ejs`, `logout.ejs`, `preview-create.ejs`, `preview-edit.ejs` – all with consistent branding, editable forms, preview steps, and double-confirmation dialogs.  

---

# 3. The cloud-based server URL (server host running on the cloud platform) for testing:
comp3810sef-group05-dde7gmfhezhvb9gm.southafricanorth-01.azurewebsites.net

---

# 4. Operation guides

- **Use of Login/Logout pages**:  
  1. Open the URL above → click **"Create an account"**  
  2. **Signup**: Enter username (e.g., `alice`) and password (e.g., `123`) → **"Account created! Please log in."** → click **Back to Login**  
  3. **Login**: Enter `alice` / `123` → click **Login** → redirected to **Todo List** → Green welcome message: **"Welcome, alice! You're now logged in."** (one-time flash)
  4. **Logout**: Click **Logout** (top-right red button) → **"Successfully logged out!"** → **Back to Login**  

  **Valid login example**:  
  `username: alice` | `password: 123`

- **Use of CRUD web pages**:  
  | Action | UI Flow |
  |--------|-------|
  | **Create** | Fill **Title**, **Description(optional)**, **Due Date/Time (optional)** → **Preview & Confirm** → **Confirm Create** → **"Todo created successfully!"** |
  | **Read**   | View list → **Search by title** (partial, case-insensitive) or **Search by date** (using calendar to pick a date)→ shows **"X item(s) found"** |
  | **Update** | Click **Edit** → modify → **Preview Changes** → **Confirm Update** → **"Todo updated successfully!"** |
  | **Delete** | Click **Delete** → browser `confirm()` → **Yes** → **"Todo deleted successfully!"** |

  **Ownership & Timestamps (HKT)**:  
  - `Added by: alice on 16 Nov 2025, 22:30 HKT`  
  - `Edited by: alice on 17 Nov 2025, 00:05 HKT`  
  - **Due Date/Time**: Optional, shown as `Due: 18 Nov 2025 at 20:20 HKT — 1 day left` or `(No time)` if only date set.

- **Use of your RESTful CRUD services**:
### RESTful APIs – **TODOS** (no authentication)

| Method | URI | cURL Command |
|--------|-----|--------------|
| **GET** | `/api/todos` | `curl http://localhost:8099/api/todos` |
| **GET (search)** | `/api/todos?search=test` | `curl "http://localhost:8099/api/todos?search=test"` |
| **GET (by date)** | `/api/todos?search=2025-11-25` | `curl "http://localhost:8099/api/todos?search=2025-11-25"` |
| **POST** | `/api/todos` | `curl -X POST http://localhost:8099/api/todos -H "Content-Type: application/json" -d '{"title":"Buy milk","description":"2L","dueDate":"2025-11-25","dueTime":"20:00"}'` |
| **PUT** | `/api/todos/:id` | `curl -X PUT http://localhost:8099/api/todos/id (input your id generate from above command) -H "Content-Type: application/json" -d '{"title":"Buy almond milk","description":"1L"}'`|
| **DELETE** | `/api/todos/:id` | `curl -X DELETE http://localhost:8099/api/todos/id (input your id generate from above command)` |

### RESTful APIs – **USERS** (no authentication)

| Method | URI | cURL Command |
|--------|-----|--------------|
| **GET** | `/api/users` | `curl http://localhost:8099/api/users` |
| **POST** | `/api/users` | `curl -X POST http://localhost:8099/api/users -H "Content-Type: application/json" -d '{"username":"bob","password":"secret"}'` |
| **PUT** | `/api/users/:id` | `curl -X PUT http://localhost:8099/api/users/id (input your id generate from above command) -H "Content-Type: application/json" -d '{"password":"newpass"}'` |
| **DELETE** | `/api/users/:id` | `curl -X DELETE http://localhost:8099/api/users/id (input your id generate from above command)` |

---

**Notes**:
 
- **Web UI**: Login required. Uses `cookie-session`.  
- **REST APIs**: **No authentication**.  
- **Search**: Uses MongoDB `$regex` with `$options: 'i'` → **partial, case-insensitive**.  
- **Security**: Passwords hashed with `bcrypt`.  
- **Timestamps**: Stored in UTC, displayed in **HKT (Asia/Hong_Kong)**.  
- **User Safety**: All CRUD actions require **preview + confirmation**.  
- **Delete Confirmation**: Uses **browser `confirm()` dialog**.  
- **Port**: `8099` (local), `process.env.PORT` on Azure.  
- **Deployment**: GitHub → Azure App Service. `MONGO_URI` set in **App Settings**.  
- **REST APIs**: All 8 endpoints (5 for `todos`, 4 for `users`) fully implemented and tested.  
- **Optional Due Date/Time**: Use date/time picker – shown in list as "Due: [HKT date time]".  
- **Search by Date**: Fixed timezone bug – now returns correct todos.  
- **Due Date/Time**: Optional. No default value. Shown in English (HKT) with live countdown.  
- **Calendar**: Past dates disabled.  
- **Preview**: Shows "No due time" if only date set.  
- **Sorting**: Latest todos on top.  
- **Countdown**: "X days left", "Due soon", "Overdue".
- **Welcome message on login**: one-time flash: `Welcome, [username]! You're now logged in.`
- **Filter by due date using calendar** – pick any date → see all todos due that day.

---
