# SnapStream API 📸

A high-performance, modern social media backend built with **FastAPI**, **SQLAlchemy**, and **ImageKit**. Designed for seamless image sharing with built-in authentication and automated cloud media management.

---

## ✨ Features

- **🚀 Performance**: Built on FastAPI for blazing-fast asynchronous processing.
- **🔐 Secure Auth**: Robust JWT-based authentication powered by `fastapi-users`.
- **🤳 Name-based Login**: User-friendly identification (Name vs Email) for social experiences.
- **📁 Cloud Storage**: Seamless integration with **ImageKit.io** for optimized image uploads and CDN delivery.
- **🔄 Feed Management**: Real-time social feed with ownership tracking (`is_owner`).
- **💾 Modern DB**: Asynchronous database operations with **SQLite** and **aiosqlite**.

---

## 🛠️ Technology Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Authentication**: [fastapi-users](https://fastapi-users.github.io/fastapi-users/)
- **Database**: [SQLAlchemy](https://www.sqlalchemy.org/) (Async)
- **Media**: [ImageKit.io](https://imagekit.io/)
- **Runtime**: [uv](https://github.com/astral-sh/uv) (Extremely fast Python package manager)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have `uv` installed:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_URL=https://ik.imagekit.io/your_endpoint

JWT_SECRET=your_super_secret_key
DATABASE_URL=sqlite+aiosqlite:///./test.db
```

### 3. Installation
Install dependencies and set up the virtual environment:
```bash
uv sync
```

### 4. Running the Server
Start the development server:
```bash
uv run main.py
```

Visit `http://localhost:8000/docs` to explore the interactive API documentation!

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user (Name & Password) |
| `POST` | `/auth/jwt/login` | Login and receive a JWT Bearer token |

### Posts
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/upload/` | Upload an image with caption (Auth Required) |
| `GET` | `/feed` | Get recent posts from all users |
| `DELETE` | `/posts/{id}` | Delete a post (Owner only) |

---

## 📁 Project Structure

```text
├── app/
│   ├── app.py          # Main application & routing
│   ├── db.py           # DB models & session management
│   ├── images.py       # ImageKit client initialization
│   ├── schemas.py      # Pydantic request/response models
│   └── users.py        # Authentication & User management
├── main.py             # Server entrypoint
├── pyproject.toml      # Dependency management
└── .env                # Secret configurations
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
