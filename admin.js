<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Truvani News Admin Panel</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --text: #e2e8f0;
      --primary: #3b82f6;
      --muted: #94a3b8;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Poppins', sans-serif;
      margin: 0;
      padding: 0;
    }

    header {
      background: var(--card);
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #334155;
    }

    header h1 {
      font-size: 1.4rem;
      color: var(--primary);
    }

    .btn {
      background: var(--primary);
      color: white;
      padding: 8px 15px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn:hover { opacity: 0.9; }

    main {
      padding: 20px;
      max-width: 900px;
      margin: auto;
    }

    .card {
      background: var(--card);
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 0 15px rgba(0,0,0,0.3);
      margin-bottom: 20px;
    }

    input, select, textarea {
      width: 100%;
      padding: 10px;
      margin: 8px 0 15px;
      border-radius: 8px;
      border: none;
      outline: none;
      background: #334155;
      color: white;
    }

    #adminArea { display: none; }
    #logoutBtn { display: none; }
    #articlesList .article-item { background: #1e293b; margin: 10px 0; padding: 15px; border-radius: 10px; }
  </style>
</head>
<body>
  <header>
    <h1>📰 Truvani Admin Panel</h1>
    <button id="logoutBtn" class="btn"><i class="fas fa-sign-out-alt"></i> Logout</button>
  </header>

  <main>
    <!-- AUTH AREA -->
    <section id="authArea" class="card">
      <h2><i class="fas fa-lock"></i> Admin Login</h2>
      <input type="email" id="email" placeholder="Email" />
      <input type="password" id="password" placeholder="Password" />
      <button id="loginBtn" class="btn"><i class="fas fa-sign-in-alt"></i> Login</button>
      <p id="authMsg" style="margin-top:10px;text-align:center;color:#f87171;"></p>
    </section>

    <!-- ADMIN AREA -->
    <section id="adminArea">
      <div class="card">
        <h2 id="formTitle"><i class="fas fa-pen-fancy"></i> Create New Article</h2>
        <input id="title" placeholder="Title" />
        <textarea id="content" rows="4" placeholder="Write your content..."></textarea>
        <input id="imageUrl" placeholder="Or paste image URL" />
        <input type="file" id="imageInput" hidden />
        <button id="uploadProgress" class="btn" style="width:100%;margin-bottom:10px;"><i class="fas fa-upload"></i> Choose Image</button>

        <select id="category">
          <option>General</option>
          <option>Rajasthan</option>
          <option>India</option>
          <option>Sports</option>
          <option>Business</option>
          <option>Technology</option>
        </select>

        <input id="subcategory" placeholder="Subcategory (optional)" />
        <div id="tagsInput" class="card" style="display:flex;flex-wrap:wrap;gap:5px;padding:10px;"></div>

        <select id="status">
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button id="aiGenerateBtn" class="btn"><i class="fas fa-robot"></i> AI Generate</button>
          <button id="postBtn" class="btn"><i class="fas fa-paper-plane"></i> Publish Article</button>
          <button id="cancelEdit" class="btn" style="display:none;background:#f87171;"><i class="fas fa-times"></i> Cancel Edit</button>
        </div>
      </div>

      <div class="card">
        <h2><i class="fas fa-list"></i> All Articles</h2>
        <div id="articlesList"></div>
      </div>
    </section>
  </main>

  <script type="module" src="firebase-config.js"></script>
  <script type="module" src="admin.js"></script>
</body>
</html>
