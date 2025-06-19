// Global Variable
let currentQuestionIndex = 0;
let score = 0;
let isRecording = false;
let startTime = 0;
let timerInterval = null;
let recognition = null;

// Quiz Data
const quizQuestions = [
    {
        question: "Which logical fallacy occurs when someone attacks the person making an argument rather than the argument itself?",
        options: ["Straw Man", "Ad Hominem", "False Dilemma", "Circular Reasoning"],
        correct: 1
    },
    {
        question: "What is the 'Straw Man' fallacy?",
        options: ["Attacking the person", "Misrepresenting someone's argument", "Using circular logic", "Making false comparisons"],
        correct: 1
    },
    {
        question: "Which technique is most effective for building confidence in public speaking?",
        options: ["Speaking faster", "Avoiding eye contact", "Practicing regularly", "Memorizing everything"],
        correct: 2
    },
    {
        question: "What is the primary purpose of a rebuttal in debate?",
        options: ["To agree with opponents", "To counter opposing arguments", "To introduce new topics", "To end the debate"],
        correct: 1
    },
    {
        question: "Which of these is NOT a key element of effective argumentation?",
        options: ["Evidence", "Logic", "Personal attacks", "Clear reasoning"],
        correct: 2
    }
];

// Practice prompts
const practicePrompts = [
    "Technology has made our lives better. Discuss the advantages and disadvantages of modern technology in education.",
    "Social media has a positive impact on society. Argue for or against this statement with specific examples.",
    "Climate change is the most pressing issue of our time. Present your argument on why immediate action is necessary.",
    "Online learning is more effective than traditional classroom learning. Defend your position with evidence.",
    "Artificial intelligence will replace human jobs. Discuss the implications and potential solutions."
];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupNavigation();
    setupAuthentication();
    setupQuiz();
    setupVoicePractice();
    setupTips();
    setupRewards();
    setupAnimations();
}

// Navigation System
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const ctaButton = document.querySelector('.cta-button');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            showPage(targetPage);
            
            // Update active nav link
            navLinks.forEach(nl => nl.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile menu
            navMenu.classList.remove('active');
        });
    });

    // Handle CTA button
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            showPage('dashboard');
            navLinks.forEach(nl => nl.classList.remove('active'));
            document.querySelector('[data-page="dashboard"]').classList.add('active');
        });
    }

    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Show specific page
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Trigger page-specific animations
        triggerPageAnimations(pageId);
    }
}

// Trigger page-specific animations
function triggerPageAnimations(pageId) {
    switch(pageId) {
        case 'dashboard':
            animateXPBar();
            animateStatsCards();
            break;
        case 'quiz':
            resetQuiz();
            break;
        case 'voice':
            resetPractice();
            break;
        case 'rewards':
            animatePointsCounter();
            break;
    }
}

// Authentication System
function setupAuthentication() {
    const authForm = document.getElementById('auth-form');
    const authSwitchLink = document.getElementById('auth-switch-link');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authButtonText = document.getElementById('auth-button-text');
    const authSwitchText = document.getElementById('auth-switch-text');
    const confirmPasswordGroup = document.getElementById('confirm-password-group');
    
    let isSignUp = false;

    // Handle form submission
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Basic validation
        if (!email || !password) {
            shakeForm();
            return;
        }
        
        if (isSignUp && password !== confirmPassword) {
            shakeForm();
            return;
        }
        
        // Simulate authentication
        setTimeout(() => {
            showPage('dashboard');
            document.querySelector('[data-page="dashboard"]').classList.add('active');
            document.querySelectorAll('.nav-link').forEach(nl => nl.classList.remove('active'));
        }, 500);
    });

    // Handle auth mode switch
    authSwitchLink.addEventListener('click', () => {
        isSignUp = !isSignUp;
        
        if (isSignUp) {
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Join thousands of confident speakers';
            authButtonText.textContent = 'Sign Up';
            authSwitchText.innerHTML = 'Already have an account? <span id="auth-switch-link">Sign in</span>';
            confirmPasswordGroup.style.display = 'block';
        } else {
            authTitle.textContent = 'Welcome Back!';
            authSubtitle.textContent = 'Sign in to continue your debate journey';
            authButtonText.textContent = 'Sign In';
            authSwitchText.innerHTML = 'Don\'t have an account? <span id="auth-switch-link">Sign up</span>';
            confirmPasswordGroup.style.display = 'none';
        }
        
        // Re-attach event listener to new switch link
        const newSwitchLink = document.getElementById('auth-switch-link');
        newSwitchLink.addEventListener('click', arguments.callee);
    });
}

// Shake form animation
function shakeForm() {
    const authCard = document.querySelector('.auth-card');
    authCard.classList.add('shake');
    setTimeout(() => authCard.classList.remove('shake'), 500);
}

// Quiz System
function setupQuiz() {
    const nextButton = document.getElementById('next-question');
    const optionCards = document.querySelectorAll('.option-card');
    
    // Handle option selection
    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('correct') || card.classList.contains('incorrect')) {
                return; // Already answered
            }
            
            // Clear previous selections
            optionCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            // Check answer
            const selectedOption = parseInt(card.getAttribute('data-option'));
            const correctAnswer = quizQuestions[currentQuestionIndex].correct;
            
            if (selectedOption === correctAnswer) {
                card.classList.add('correct');
                score++;
            } else {
                card.classList.add('incorrect');
                optionCards[correctAnswer].classList.add('correct');
            }
            
            // Enable next button
            nextButton.disabled = false;
        });
    });
    
    // Handle next question
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < quizQuestions.length) {
            loadQuestion();
        } else {
            showQuizResult();
        }
    });
}

// Load quiz question
function loadQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    const questionText = document.getElementById('question-text');
    const optionCards = document.querySelectorAll('.option-card');
    const quizProgress = document.getElementById('quiz-progress');
    const quizCounter = document.getElementById('quiz-counter');
    const nextButton = document.getElementById('next-question');
    
    // Update question
    questionText.textContent = question.question;
    
    // Update options
    optionCards.forEach((card, index) => {
        card.querySelector('.option-text').textContent = question.options[index];
        card.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // Update progress
    const progressPercentage = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    quizProgress.style.width = progressPercentage + '%';
    quizCounter.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    
    // Disable next button
    nextButton.disabled = true;
}

// Show quiz result
function showQuizResult() {
    const questionCard = document.getElementById('question-card');
    const quizResult = document.getElementById('quiz-result');
    const finalScore = document.getElementById('final-score');
    
    questionCard.style.display = 'none';
    quizResult.style.display = 'block';
    finalScore.textContent = `${score}/${quizQuestions.length}`;
    
    // Animate XP gain
    setTimeout(() => {
        const xpGain = document.querySelector('.xp-gain');
        xpGain.style.animation = 'bounce 0.5s ease';
    }, 500);
}

// Reset quiz
function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    
    const questionCard = document.getElementById('question-card');
    const quizResult = document.getElementById('quiz-result');
    
    questionCard.style.display = 'block';
    quizResult.style.display = 'none';
    
    loadQuestion();
}

// Voice Practice System
function setupVoicePractice() {
    const recordButton = document.getElementById('record-button');
    const recordingStatus = document.getElementById('recording-status');
    const timer = document.getElementById('timer');
    const regenerateButton = document.querySelector('.regenerate-prompt');
    
    // Check for Web Speech API support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
    }
    
    // Handle record button click
    recordButton.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });
    
    // Handle regenerate prompt
    regenerateButton.addEventListener('click', () => {
        const practiceText = document.getElementById('practice-text');
        const randomPrompt = practicePrompts[Math.floor(Math.random() * practicePrompts.length)];
        practiceText.textContent = `"${randomPrompt}"`;
    });
}

// Start recording
function startRecording() {
    isRecording = true;
    startTime = Date.now();
    
    const recordButton = document.getElementById('record-button');
    const recordingStatus = document.getElementById('recording-status');
    
    recordButton.classList.add('recording');
    recordingStatus.textContent = 'Recording... Click to stop';
    
    // Start timer
    timerInterval = setInterval(updateTimer, 1000);
    
    // Start speech recognition if available
    if (recognition) {
        recognition.start();
    }
}

// Stop recording
function stopRecording() {
    isRecording = false;
    
    const recordButton = document.getElementById('record-button');
    const recordingStatus = document.getElementById('recording-status');
    
    recordButton.classList.remove('recording');
    recordingStatus.textContent = 'Recording complete!';
    
    // Stop timer
    clearInterval(timerInterval);
    
    // Stop speech recognition
    if (recognition) {
        recognition.stop();
    }
    
    // Show feedback after delay
    setTimeout(showVoiceFeedback, 1000);
}

// Update timer
function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    const timer = document.getElementById('timer');
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Show voice feedback
function showVoiceFeedback() {
    const feedbackSection = document.getElementById('feedback-section');
    const durationFeedback = document.getElementById('duration-feedback');
    const pauseFeedback = document.getElementById('pause-feedback');
    const fillerFeedback = document.getElementById('filler-feedback');
    
    // Generate random feedback (in real app, this would be from actual analysis)
    const duration = Math.floor(Math.random() * 180) + 60; // 1-4 minutes
    const pauses = Math.floor(Math.random() * 8) + 1;
    const fillers = Math.floor(Math.random() * 5);
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    durationFeedback.textContent = `${minutes} minutes ${seconds} seconds`;
    pauseFeedback.textContent = `${pauses} noticeable pauses`;
    fillerFeedback.textContent = fillers > 0 ? `${fillers} "um"s detected` : 'No filler words detected!';
    
    feedbackSection.style.display = 'block';
    
    // Animate confidence score
    setTimeout(() => {
        animateConfidenceScore();
    }, 500);
}

// Animate confidence score
function animateConfidenceScore() {
    const scoreElement = document.querySelector('.circle-progress');
    const scoreText = document.querySelector('.score-text');
    const targetScore = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    scoreText.textContent = targetScore + '%';
    
    // Animate circle
    const degrees = (targetScore / 100) * 360;
    scoreElement.style.background = `conic-gradient(#4ecdc4 0deg, #4ecdc4 ${degrees}deg, #e0e0e0 ${degrees}deg)`;
}

// Reset practice
function resetPractice() {
    const feedbackSection = document.getElementById('feedback-section');
    const recordingStatus = document.getElementById('recording-status');
    const timer = document.getElementById('timer');
    const recordButton = document.getElementById('record-button');
    
    feedbackSection.style.display = 'none';
    recordingStatus.textContent = 'Click to start recording';
    timer.textContent = '00:00';
    recordButton.classList.remove('recording');
    
    isRecording = false;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

// Tips System
function setupTips() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const tipCards = document.querySelectorAll('.tip-card');
    
    // Handle category switching
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            
            // Update active category
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show/hide tips based on category
            tipCards.forEach(card => {
                if (card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Handle tip card flipping
    tipCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
}

// Rewards System
function setupRewards() {
    const redeemButtons = document.querySelectorAll('.redeem-btn');
    
    redeemButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const item = e.target.closest('.shop-item');
            const itemName = item.querySelector('h3').textContent;
            
            // Simulate redemption
            button.textContent = 'Redeemed!';
            button.style.background = '#4caf50';
            button.disabled = true;
            
            // Show success message
            setTimeout(() => {
                alert(`Congratulations! You've redeemed: ${itemName}`);
            }, 500);
        });
    });
}

// Animation Functions
function setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.feature-card, .challenge-card, .achievement-item');
    animatedElements.forEach(el => observer.observe(el));
}

// Animate XP Bar
function animateXPBar() {
    const xpBars = document.querySelectorAll('.xp-fill');
    xpBars.forEach(bar => {
        const xp = bar.getAttribute('data-xp');
        const percentage = Math.min((xp / 1000) * 100, 100);
        setTimeout(() => {
            bar.style.width = percentage + '%';
        }, 500);
    });
}

// Animate Stats Cards
function animateStatsCards() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'slideInUp 0.6s ease forwards';
        }, index * 200);
    });
}

// Animate Points Counter
function animatePointsCounter() {
    const counter = document.getElementById('points-counter');
    const target = 1250;
    let current = 0;
    const increment = target / 50;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            counter.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            counter.textContent = target;
        }
    };
    
    updateCounter();
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll polyfill for older browsers
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add CSS animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRecording) {
        stopRecording();
    }
});

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Recalculate animations if needed
    if (window.innerWidth <= 768) {
        // Mobile adjustments
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    }
}, 250));

// Initialize tooltips (if needed)
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    // In production, you might want to send this to an error reporting service
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart);
        }, 0);
    });
}
