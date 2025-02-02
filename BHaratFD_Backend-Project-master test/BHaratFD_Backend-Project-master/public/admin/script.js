document.addEventListener('DOMContentLoaded', () => {
    CKEDITOR.replace('answer');

    const faqForm = document.getElementById('faqFormElement');
    const faqList = document.getElementById('faqItems');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const languageSelect = document.getElementById('languageSelect');
    const refreshBtn = document.getElementById('refreshBtn');

    let editingId = null;

    const API_BASE_URL = 'http://localhost:3000'||'http://ec2-52-66-250-106.ap-south-1.compute.amazonaws.com:3000';

    faqForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const question = document.getElementById('question').value;
        const answer = CKEDITOR.instances.answer.getData();
        const language = languageSelect.value;

        try {
            if (editingId) {
                await updateFAQ(editingId, question, answer, language);
                showNotification('FAQ updated successfully', 'success');
            } else {
                await createFAQ(question, answer, language);
                showNotification('FAQ added successfully', 'success');
            }
            resetForm();
            loadFAQs();
        } catch (error) {
            console.error('Error:', error);
            showNotification('An error occurred', 'error');
        }
    });

    cancelBtn.addEventListener('click', resetForm);
    languageSelect.addEventListener('change', loadFAQs);
    refreshBtn.addEventListener('click', loadFAQs);

    async function createFAQ(question, answer, language) {
        const response = await fetch(`${API_BASE_URL}/api/faqs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, answer, language }),
        });

        if (!response.ok) {
            throw new Error('Error adding FAQ');
        }
    }

    async function updateFAQ(id, question, answer, language) {
        const response = await fetch(`${API_BASE_URL}/admin/faqs/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, answer, language }),
        });

        if (!response.ok) {
            throw new Error('Error updating FAQ');
        }
        
        // Reload FAQs to show updated translations
        await loadFAQs();
    }

    async function deleteFAQ(id) {
        const response = await fetch(`${API_BASE_URL}/admin/faqs/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Error deleting FAQ');
        }
    }

    function resetForm() {
        editingId = null;
        faqForm.reset();
        CKEDITOR.instances.answer.setData('');
        submitBtn.textContent = 'Add FAQ';
        cancelBtn.style.display = 'none';
    }

    async function loadFAQs() {
        const selectedLang = languageSelect.value;
        try {
            const response = await fetch(`${API_BASE_URL}/admin/faqs?lang=${selectedLang}`);
            if (!response.ok) throw new Error('Failed to fetch FAQs');
            
            const faqs = await response.json();
            if (!Array.isArray(faqs)) throw new Error('Invalid FAQ data received');

            faqList.innerHTML = faqs.map(faq => `
                <div class="faq-item" data-lang="${selectedLang}">
                    <h3>${faq.question || 'No question available'}</h3>
                    <div>${faq.answer || 'No answer available'}</div>
                    <div class="faq-actions">
                        <button class="edit-btn" data-id="${faq.id}">Edit</button>
                        <button class="delete-btn" data-id="${faq.id}">Delete</button>
                    </div>
                </div>
            `).join('');

            attachFAQListeners();
        } catch (error) {
            console.error('Error loading FAQs:', error);
            showNotification(`Error loading FAQs: ${error.message}`, 'error');
        }
    }

    function attachFAQListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const faqItem = e.target.closest('.faq-item');
                editingId = e.target.dataset.id;
                const currentLanguage = languageSelect.value;
                document.getElementById('question').value = faqItem.querySelector('h3').textContent;
                CKEDITOR.instances.answer.setData(faqItem.querySelector('div:nth-child(2)').innerHTML);
                submitBtn.textContent = `Update FAQ (${currentLanguage.toUpperCase()})`;
                cancelBtn.style.display = 'inline-block';
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to delete this FAQ?')) {
                    try {
                        await deleteFAQ(e.target.dataset.id);
                        showNotification('FAQ deleted successfully', 'success');
                        loadFAQs();
                    } catch (error) {
                        console.error('Error deleting FAQ:', error);
                        showNotification('Error deleting FAQ', 'error');
                    }
                }
            });
        });
    }

    function showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.opacity = 1;

        setTimeout(() => {
            notification.style.opacity = 0;
        }, 3000);
    }

    loadFAQs();
});