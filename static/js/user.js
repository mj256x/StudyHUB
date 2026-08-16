function changeUsername() {
    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('changeUsernameModal'));
    myModal.show();
}

function changePassword() {
    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('changePasswordModal'));
    myModal.show();
}

function changeEmail() {
    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('changeEmailModal'));
    myModal.show();
}

async function uploadProfilePicture(input) {
    const file = input.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('pfp', file);
        try {
            const response = await fetch('/upload_profile_picture', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                location.reload();
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }
    }
}