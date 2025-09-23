// custom-sw.js
self.addEventListener('sync', (event) => {
    if (event.tag === 'form-submission') {
        event.waitUntil(submitPendingForms());
    }
});

async function submitPendingForms() {
    // Get all pending forms from IndexedDB
    const pendingForms = await getPendingForms();

    for (const form of pendingForms) {
        try {
            await fetch('https://68d222cdcc7017eec5429b8e.mockapi.io/get-users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form.data)
            });

            // Remove from database on success
            await deleteForm(form.id);

            // Show notification
            self.registration.showNotification('Form Submitted', {
                body: 'Your offline form was successfully submitted!',
                icon: '/assets/icons/icon-72x72.png'
            });
        } catch (error) {
            console.error('Failed to submit form:', error);
        }
    }
}

// Helper functions for IndexedDB
function getPendingForms() {
    return new Promise((resolve) => {
        // Implementation to get forms from IndexedDB
    });
}

function deleteForm(id) {
    return new Promise((resolve) => {
        // Implementation to delete form from IndexedDB
    });
}