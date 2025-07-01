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

// Initial navigation to the home page
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