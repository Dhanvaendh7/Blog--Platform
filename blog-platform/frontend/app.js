// ===== Configuration =====
const API_URL = 'https://blog-platform-h2uy.onrender.com/api';

// ===== State =====
let currentUser = null;
let authToken = localStorage.getItem('token');

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadPosts();
});

// ===== Navigation =====
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.style.display = 'none';
  });

  // Show requested page
  const page = document.getElementById(pageId + '-page');
  if (page) {
    page.style.display = 'block';
  }

  // Special handling
  if (pageId === 'home') {
    loadPosts();
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

// ===== Auth Functions =====
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    currentUser = JSON.parse(user);
    updateNavForAuth();
  }
}

function updateNavForAuth() {
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const createPostLink = document.getElementById('createPostLink');
  const logoutLink = document.getElementById('logoutLink');
  const userInfo = document.getElementById('userInfo');

  if (currentUser) {
    loginLink.style.display = 'none';
    registerLink.style.display = 'none';
    createPostLink.style.display = 'inline';
    logoutLink.style.display = 'inline';
    userInfo.style.display = 'inline';
    userInfo.textContent = '👤 ' + currentUser.username;
  } else {
    loginLink.style.display = 'inline';
    registerLink.style.display = 'inline';
    createPostLink.style.display = 'none';
    logoutLink.style.display = 'none';
    userInfo.style.display = 'none';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');

  try {
    const response = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;

    showToast('Login successful!', 'success');
    updateNavForAuth();
    showPage('home');
    document.getElementById('loginForm').reset();
    errorDiv.classList.remove('show');
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.add('show');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const errorDiv = document.getElementById('registerError');

  try {
    const response = await fetch(API_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, email: email, password: password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    showToast('Account created! Please sign in.', 'success');
    showPage('login');
    document.getElementById('registerForm').reset();
    errorDiv.classList.remove('show');
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.add('show');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  updateNavForAuth();
  showToast('Logged out successfully', 'success');
  showPage('home');
}

// ===== Post Functions =====
async function loadPosts() {
  const container = document.getElementById('postsList');
  container.innerHTML = '<div class="loading">Loading posts...</div>';

  try {
    const response = await fetch(API_URL + '/posts');
    const posts = await response.json();

    if (posts.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>No posts yet</h3><p>Be the first to write something!</p></div>';
      return;
    }

    let html = '';
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const avatar = post.author_name ? post.author_name.charAt(0).toUpperCase() : '?';
      html += '<div class="post-card" onclick="viewPost(' + post.id + ')">' +
        '<h3>' + escapeHtml(post.title) + '</h3>' +
        '<p class="post-excerpt">' + escapeHtml(post.content) + '</p>' +
        '<div class="post-meta">' +
          '<div class="post-author">' +
            '<div class="post-author-avatar">' + avatar + '</div>' +
            '<span>' + escapeHtml(post.author_name) + '</span>' +
          '</div>' +
          '<span>' + formatDate(post.created_at) + '</span>' +
        '</div>' +
      '</div>';
    }
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = '<div class="error-message show">Failed to load posts: ' + error.message + '</div>';
  }
}

async function viewPost(postId) {
  const container = document.getElementById('postDetail');
  container.innerHTML = '<div class="loading">Loading post...</div>';
  showPage('post-detail');

  try {
    const response = await fetch(API_URL + '/posts/' + postId);
    const post = await response.json();

    const isOwner = currentUser && currentUser.id === post.author_id;
    const avatar = post.author_name ? post.author_name.charAt(0).toUpperCase() : '?';

    let html = '<div class="post-detail">' +
      '<h1>' + escapeHtml(post.title) + '</h1>' +
      '<div class="post-meta-bar">' +
        '<div class="post-author">' +
          '<div class="post-author-avatar">' + avatar + '</div>' +
          '<span>' + escapeHtml(post.author_name) + '</span>' +
        '</div>' +
        '<span>•</span>' +
        '<span>' + formatDate(post.created_at) + '</span>';

    if (post.updated_at !== post.created_at) {
      html += '<span>• Edited</span>';
    }

    html += '</div>' +
      '<div class="post-content">' + escapeHtml(post.content) + '</div>';

    if (isOwner) {
      const safeTitle = escapeHtml(post.title).replace(/'/g, "\'");
      const safeContent = escapeHtml(post.content).replace(/'/g, "\'");
      html += '<div class="post-detail-actions">' +
        '<button class="btn btn-secondary btn-sm" onclick="editPost(' + post.id + ', ' + "'" + safeTitle + "'" + ', ' + "'" + safeContent + "'" + ')">✏️ Edit</button>' +
        '<button class="btn btn-danger btn-sm" onclick="deletePost(' + post.id + ')">🗑️ Delete</button>' +
      '</div>';
    }

    html += '</div>';

    // Comments section
    html += '<div class="comments-section">' +
      '<h3>💬 Comments (' + (post.comments ? post.comments.length : 0) + ')</h3>';

    if (currentUser) {
      html += '<div class="comment-form">' +
        '<textarea id="commentContent" placeholder="Write a comment..."></textarea>' +
        '<button class="btn btn-primary" onclick="addComment(' + post.id + ')">Post Comment</button>' +
      '</div>';
    } else {
      html += '<p style="color: var(--gray-400); margin-bottom: 1rem;"><a href="#" onclick="showPage(' + "'" + 'login' + "'" + ')">Sign in</a> to leave a comment.</p>';
    }

    html += '<div class="comments-list">';

    if (post.comments && post.comments.length > 0) {
      for (let i = 0; i < post.comments.length; i++) {
        const comment = post.comments[i];
        html += '<div class="comment-card">' +
          '<div class="comment-header">' +
            '<span class="comment-author">' + escapeHtml(comment.author_name) + '</span>' +
            '<span class="comment-time">' + formatDate(comment.created_at) + '</span>';

        if (currentUser && currentUser.id === comment.author_id) {
          html += '<button class="btn btn-danger btn-sm" onclick="deleteComment(' + comment.id + ', ' + post.id + ')">Delete</button>';
        }

        html += '</div>' +
          '<p class="comment-content">' + escapeHtml(comment.content) + '</p>' +
        '</div>';
      }
    } else {
      html += '<div class="no-comments">No comments yet. Be the first to share your thoughts!</div>';
    }

    html += '</div></div>';

    html += '<div style="text-align: center; margin-top: 2rem;">' +
      '<button class="btn btn-secondary" onclick="showPage(' + "'" + 'home' + "'" + ')">← Back to All Posts</button>' +
    '</div>';

    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = '<div class="error-message show">Failed to load post: ' + error.message + '</div>';
  }
}

async function handleCreatePost(e) {
  e.preventDefault();
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;
  const errorDiv = document.getElementById('createPostError');

  try {
    const response = await fetch(API_URL + '/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ title: title, content: content })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create post');
    }

    showToast('Post published successfully!', 'success');
    document.getElementById('createPostForm').reset();
    errorDiv.classList.remove('show');
    showPage('home');
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.add('show');
  }
}

function editPost(id, title, content) {
  document.getElementById('editPostId').value = id;
  document.getElementById('editPostTitle').value = title;
  document.getElementById('editPostContent').value = content;
  showPage('edit-post');
}

async function handleEditPost(e) {
  e.preventDefault();
  const id = document.getElementById('editPostId').value;
  const title = document.getElementById('editPostTitle').value;
  const content = document.getElementById('editPostContent').value;
  const errorDiv = document.getElementById('editPostError');

  try {
    const response = await fetch(API_URL + '/posts/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ title: title, content: content })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update post');
    }

    showToast('Post updated successfully!', 'success');
    errorDiv.classList.remove('show');
    viewPost(id);
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.add('show');
  }
}

async function deletePost(id) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    const response = await fetch(API_URL + '/posts/' + id, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete post');
    }

    showToast('Post deleted successfully', 'success');
    showPage('home');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ===== Comment Functions =====
async function addComment(postId) {
  const content = document.getElementById('commentContent').value;

  if (!content.trim()) {
    showToast('Please write something before posting', 'error');
    return;
  }

  try {
    const response = await fetch(API_URL + '/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ post_id: postId, content: content })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to add comment');
    }

    showToast('Comment posted!', 'success');
    viewPost(postId);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function deleteComment(commentId, postId) {
  if (!confirm('Delete this comment?')) return;

  try {
    const response = await fetch(API_URL + '/comments/' + commentId, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete comment');
    }

    showToast('Comment deleted', 'success');
    viewPost(postId);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ===== Utilities =====
function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + type + ' show';

  setTimeout(function() {
    toast.classList.remove('show');
  }, 3000);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
