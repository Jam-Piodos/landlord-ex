// Add Supabase client initialization
// Replace with your actual values from the Supabase dashboard
const SUPABASE_URL = 'https://ozkxzvpiiqhhzbyzetsy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96a3h6dnBpaXFoaHpieXpldHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjcwMTksImV4cCI6MjA2NjYwMzAxOX0.ra2xvmu97bESlkHkwvPIKjbbccJbQYyHbbFzbJXa4sU';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch users from Supabase and populate the user management table
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderUsers();
  // Event delegation for edit and deactivate/reactivate
  document.querySelector('#profile .account-table tbody').addEventListener('click', async function(e) {
    const row = e.target.closest('tr');
    if (!row) return;
    const userId = row.getAttribute('data-user-id');
    if (!userId) return;
    // Edit user
    if (e.target.classList.contains('edit')) {
      const users = await getUsers();
      const user = users.find(u => String(u.user_id) === userId);
      if (!user) return alert('User not found');
      openEditUserModal(user);
    }
    // Deactivate/reactivate user
    if (e.target.classList.contains('deactivate')) {
      const users = await getUsers();
      const user = users.find(u => String(u.user_id) === userId);
      if (!user) return alert('User not found');
      const newStatus = !user.active;
      const { error } = await supabase
        .from('users')
        .update({ active: newStatus })
        .eq('user_id', user.user_id);
      if (error) return alert('Failed to update status');
      fetchAndRenderUsers();
    }
  });

  // Modal event listeners
  document.querySelector('.cancel-btn').onclick = closeEditUserModal;
  document.getElementById('edit-user-modal').onclick = function(e) {
    if (e.target === this) closeEditUserModal();
  };
  document.getElementById('edit-user-form').onsubmit = async function(e) {
    e.preventDefault();
    const user_id = document.getElementById('edit-user-id').value;
    const user_firstname = document.getElementById('edit-user-firstname').value;
    const user_lastname = document.getElementById('edit-user-lastname').value;
    const user_email = document.getElementById('edit-user-email').value;
    const role = document.getElementById('edit-user-role').value;
    const { error } = await supabase
      .from('users')
      .update({ user_firstname, user_lastname, user_email, role })
      .eq('user_id', user_id);
    if (error) {
      alert('Failed to update user');
      return;
    }
    closeEditUserModal();
    fetchAndRenderUsers();
  };
});

async function getUsers() {
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('user_id', { ascending: true });
  return users || [];
}

async function fetchAndRenderUsers() {
  const tableBody = document.querySelector('#profile .account-table tbody');
  if (!tableBody) return;
  tableBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('user_id', { ascending: true });

  if (error) {
    tableBody.innerHTML = `<tr><td colspan="4">Error loading users.</td></tr>`;
    return;
  }
  if (!users || users.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4">No users found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = users.map(user => `
    <tr data-user-id="${user.user_id}">
      <td>
        <img class="user-avatar" src="${user.user_avatar_url || 'https://randomuser.me/api/portraits/lego/1.jpg'}" alt="avatar">
        ${user.user_firstname || ''} ${user.user_lastname || ''}
      </td>
      <td>${user.role || ''}</td>
      <td><span class="status-dot ${user.active !== false ? 'active' : 'inactive'}"></span> ${user.active !== false ? 'Active' : 'Inactive'}</td>
      <td>
        <span class="action-icon edit" title="Edit"></span>
        <span class="action-icon deactivate" title="${user.active !== false ? 'Deactivate' : 'Reactivate'}"></span>
      </td>
    </tr>
  `).join('');
}

function navigateTo(page) {
    // Hide all content sections
    const contentSections = document.querySelectorAll('main');
    contentSections.forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected content section
    const selectedSection = document.getElementById(page);
    selectedSection.style.display = 'block';
}

// Initial navigation to the profile page
navigateTo('home');

// Function to accept work and move the post to the Workspace section
function acceptWork(button) {
    // Find the post element that contains the button clicked
    const post = button.closest('.post');

    // Clone the entire post element, including the image
    const clonedPost = post.cloneNode(true);

    // Remove the "Accept Work" button in the cloned post
    const acceptButton = clonedPost.querySelector('.accept-btn');
    if (acceptButton) {
        acceptButton.remove();
    }

    // Create a new list item and append the cloned post to it
    const listItem = document.createElement('li');
    listItem.appendChild(clonedPost);

    // Append the list item to the accepted jobs list in the workspace section
    const acceptedJobsList = document.getElementById('accepted-jobs-list');
    if (acceptedJobsList) {
        acceptedJobsList.appendChild(listItem);
    } else {
        console.error("Workspace section or accepted-jobs-list not found in the HTML.");
    }

    // Optionally, hide the original post from the home section
    post.style.display = 'none';

    // Navigate to the workspace section to show the accepted post
    navigateTo('workspace');
}

// Function to navigate to different sections (home, profile, workspace)
function navigateTo(sectionId) {
    document.querySelectorAll('main, section').forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
}
        // Function to navigate between sections
        function navigateTo(sectionId) {
            document.querySelectorAll('.container').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(sectionId).style.display = 'block';
        }

        // Function to show the logout confirmation dialog
        function showLogoutConfirmation() {
            document.getElementById('logout-confirmation').style.display = 'block';
        }

        // Function to hide the logout confirmation dialog
        function hideLogoutConfirmation() {
            document.getElementById('logout-confirmation').style.display = 'none';
        }

        // Function to log out and redirect to the log-in page
        function logout() {
            window.location.href = 'index.html'; // Redirect to login page
        }

function openEditUserModal(user) {
  document.getElementById('edit-user-id').value = user.user_id;
  document.getElementById('edit-user-firstname').value = user.user_firstname || '';
  document.getElementById('edit-user-lastname').value = user.user_lastname || '';
  document.getElementById('edit-user-email').value = user.user_email || '';
  document.getElementById('edit-user-role').value = user.role || '';
  document.getElementById('edit-user-modal').style.display = 'flex';
}

function closeEditUserModal() {
  document.getElementById('edit-user-modal').style.display = 'none';
}
        