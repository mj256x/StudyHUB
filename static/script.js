
setTimeout(function () {
    const flashMessage = document.getElementById('flash');
    if (flashMessage) {
        flashMessage.style.display = 'none';
    }
}, 3000);

async function downloadFile(btn, fileUrl, fileName) {
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