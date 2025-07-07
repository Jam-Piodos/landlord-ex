// Add Supabase client initialization
// Replace with your actual values from the Supabase dashboard
const SUPABASE_URL = 'https://ozkxzvpiiqhhzbyzetsy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96a3h6dnBpaXFoaHpieXpldHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjcwMTksImV4cCI6MjA2NjYwMzAxOX0.ra2xvmu97bESlkHkwvPIKjbbccJbQYyHbbFzbJXa4sU';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch users from Supabase and populate the user management table
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderUsers();
  updateDashboardCounts();
  // Event delegation for action buttons
  document.querySelector('#profile .account-table tbody').addEventListener('click', async function(e) {
    // Deactivate/Activate
    if (e.target.closest('.deactivate')) {
      const btn = e.target.closest('.deactivate');
      const row = btn.closest('tr');
      const userId = row.getAttribute('data-user-id');
      if (!userId) return alert('User not found');
      // Get current status
      const users = await getUsers();
      const user = users.find(u => String(u.user_id) === String(userId));
      if (!user) return alert('User not found');
      const newStatus = !user.active;
      const { error } = await supabase
        .from('users')
        .update({ active: newStatus })
        .eq('user_id', user.user_id);
      if (error) return alert('Failed to update status');
      fetchAndRenderUsers();
    }
    // Edit
    if (e.target.closest('.edit')) {
      const btn = e.target.closest('.edit');
      const row = btn.closest('tr');
      const userId = row.getAttribute('data-user-id');
      if (!userId) return alert('User not found');
      const users = await getUsers();
      const user = users.find(u => String(u.user_id) === String(userId));
      if (!user) return alert('User not found');
      // Populate modal fields (example: you can add more fields as needed)
      document.getElementById('edit-user-modal').classList.add('active');
      document.getElementById('edit-user-id').value = user.user_id;
      document.getElementById('edit-user-firstname').value = user.user_firstname || '';
      document.getElementById('edit-user-lastname').value = user.user_lastname || '';
      document.getElementById('edit-user-role').value = user.role || '';
      document.getElementById('edit-user-email').value = user.user_email || '';
    }
  });

  // Modal Save and Cancel functionality
  const modal = document.getElementById('edit-user-modal');
  if (modal) {
    // Cancel button
    modal.querySelector('.modal-btn.cancel').onclick = function() {
      modal.classList.remove('active');
    };
    // Save button
    modal.querySelector('.modal-btn.save').onclick = async function() {
      const user_id = modal.querySelector('#edit-user-id').value;
      const user_firstname = modal.querySelector('#edit-user-firstname').value;
      const user_lastname = modal.querySelector('#edit-user-lastname').value;
      const user_role = modal.querySelector('#edit-user-role').value;
      const user_email = modal.querySelector('#edit-user-email').value;
      // Optionally, add active status if you want to edit it in the modal
      // const active = modal.querySelector('#edit-user-active').checked;
      const { error } = await supabase
        .from('users')
        .update({
          user_firstname,
          user_lastname,
          role: user_role,
          user_email
          // , active
        })
        .eq('user_id', user_id);
      if (error) {
        alert('Failed to update user: ' + error.message);
        return;
      }
      modal.classList.remove('active');
      fetchAndRenderUsers();
    };
    // Close button
    const closeBtn = document.getElementById('close-edit-modal');
    if (closeBtn) {
      closeBtn.onclick = function() {
        modal.classList.remove('active');
      };
    }
    // Live avatar preview
    const avatarInput = document.getElementById('edit-user-avatar');
    const avatarPreview = document.getElementById('edit-user-avatar-preview');
    if (avatarInput && avatarPreview) {
      avatarInput.addEventListener('input', function() {
        avatarPreview.src = avatarInput.value || 'https://randomuser.me/api/portraits/lego/1.jpg';
      });
    }
  }
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
      <td>
        <span class="status-dot ${user.active !== false ? 'active' : 'deactivated'}"></span>
        ${user.active !== false ? 'Active' : 'Deactivated'}
      </td>
      <td>
        <button class="action-btn edit"><span class="action-icon edit"></span> Edit</button>
        <button class="action-btn deactivate${user.active !== false ? '' : ' active'}"><span class="action-icon deactivate"></span> ${user.active !== false ? 'Deactivate' : 'Activate'}</button>
      </td>
    </tr>
  `).join('');
}

function navigateTo(sectionId) {
    document.querySelectorAll('.container').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';

    // Set background color based on section
    if (sectionId === 'map') {
        document.body.style.background = '#eaeaea'; // or #fff for a neutral background
    } else {
        document.body.style.background = 'rgb(255, 78, 0)';
    }
}

// Initial navigation to the profile page
navigateTo('map');

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

async function updateDashboardCounts() {
  // Total users
  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Total land areas
  const { count: landAreaCount, data: landAreas } = await supabase
    .from('land_areas')
    .select('owner_name', { count: 'exact' });

  // Total unique landowners (by owner_name in land_areas)
  let landownerCount = 0;
  if (landAreas) {
    const uniqueOwners = new Set(landAreas.map(area => area.owner_name));
    landownerCount = uniqueOwners.size;
  }

  // Update the dashboard
  const usersElem = document.getElementById('total-users');
  const ownersElem = document.getElementById('total-landowners');
  const areasElem = document.getElementById('total-landareas');
  if (usersElem) usersElem.textContent = userCount ?? '0';
  if (ownersElem) ownersElem.textContent = landownerCount ?? '0';
  if (areasElem) areasElem.textContent = landAreaCount ?? '0';
}

// Call this on DOMContentLoaded
const origDOMContentLoaded = document.onreadystatechange;
document.addEventListener('DOMContentLoaded', () => {
  updateDashboardCounts();
  if (typeof origDOMContentLoaded === 'function') origDOMContentLoaded();
  // ... your other code ...
});
        