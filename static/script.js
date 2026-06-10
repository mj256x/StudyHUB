
setTimeout(function () {
    const flashMessage = document.getElementById('flash');
    if (flashMessage) {
        flashMessage.style.display = 'none';
    }
}, 3000);

async function downloadFile(fileUrl, fileName) {
    try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }
    catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file. Please try again later.');
    }
}

function moveORcopyFileToAnotherFolder(fileId, action) {
    document.getElementById('fileIdInput').value = fileId;

    var form = document.getElementById('moveCopyForm');
    var submitBtn = document.getElementById('moveCopyBtn');

    if (action === 'move') {
        form.action = '/move_file';
        submitBtn.innerText = 'Move File';
    } else if (action === 'copy') {
        form.action = '/copy_file';
        submitBtn.innerText = 'Copy File';
    }

    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('moveORcopyFileModal'));
    myModal.show();
}

async function toggleDone(fileId) {
    try {
        const response = await fetch('/toggle_done/' + fileId, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            const card = document.getElementById('file-card-' + fileId);
            const btnText = document.getElementById('btn-text-' + fileId);
            const doneBtn = document.getElementById('done-btn-' + fileId);

            if (data.new_status) {
                card.classList.add('done-card');
                btnText.innerText = 'Mark as Undone';
                doneBtn.classList.add('done-btn-active');
            } else {
                card.classList.remove('done-card');
                btnText.innerText = 'Mark as Done';
                doneBtn.classList.remove('done-btn-active');
            }
        } else {
            alert('Failed to mark file as done/undone. Please try again later.');
        }
    } catch (error) {
        console.error('Error toggling done status:', error);
    }
}