// Feedback tab script

let feedbackInitialized = false;

function initFeedback() {
    if (feedbackInitialized) return;
    const feedbackForm = document.querySelector('.feedback-form');
    if (!feedbackForm) return;
    
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const feedbackType = feedbackForm.querySelector('input[name="feedbackType"]:checked');
        const textarea = feedbackForm.querySelector('textarea');
        const email = feedbackForm.querySelector('input[type="email"]');

        if (!feedbackType) {
            alert('Por favor, selecione se é sobre o Restaurante ou Sistema.');
            return;
        }

        if (!textarea.value.trim()) {
            alert('Por favor, escreva seu comentário.');
            return;
        }

        // Save feedback as independent object
        const feedbackEntry = {
            type: feedbackType.value,
            comment: textarea.value.trim(),
            email: email.value.trim(),
            timestamp: new Date().toISOString()
        };
        let feedbackList = JSON.parse(localStorage.getItem('feedbackList') || '[]');
        feedbackList.push(feedbackEntry);
        localStorage.setItem('feedbackList', JSON.stringify(feedbackList));

        const typeLabel = feedbackType.value === 'restaurante' ? '🍽️ Restaurante' : '💻 Sistema';
        alert(`Obrigado pelo seu feedback sobre ${typeLabel}!`);
        feedbackForm.reset();
    });
    feedbackInitialized = true;
}

