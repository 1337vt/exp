let currentStep = 1;
const totalSteps = 7;

function selectOption(el, step, value) {
    const stepEl = document.querySelector(`.step[data-step="${step}"]`);
    const cards = stepEl.querySelectorAll('.option-card');
    const hiddenInput = stepEl.querySelector('input[type="hidden"]');
    
    cards.forEach(card => card.classList.remove('selected'));
    el.classList.add('selected');
    
    hiddenInput.value = value;
    document.getElementById(`btn${step}`).disabled = false;
}

function nextStep(step) {
    if (step === 5) {
        const location = document.getElementById('location').value;
        if (!location.trim()) {
            document.getElementById('location').focus();
            return;
        }
    }
    
    document.querySelector(`.step[data-step="${step}"]`).classList.remove('active');
    document.querySelector(`.step[data-step="${step + 1}"]`).classList.add('active');
    currentStep = step + 1;
    updateProgress();
    updateDots();
}

function prevStep(step) {
    // If going back from step 1, hide funnel and restore landing sections
    if (step - 1 === 0) {
        document.getElementById('funnelSection').classList.remove('active');
        document.querySelectorAll('.landing-section').forEach(function(section) {
            section.style.display = 'block';
        });
        document.querySelector('.page-hero').style.display = 'block';
        document.querySelectorAll('.hero-action-btn').forEach(function(btn) {
            btn.classList.remove('hidden');
        });
        return;
    }
    
    document.querySelector(`.step[data-step="${step}"]`).classList.remove('active');
    document.querySelector(`.step[data-step="${step - 1}"]`).classList.add('active');
    currentStep = step - 1;
    updateProgress();
    updateDots();
}

function updateProgress() {
    const progress = ((currentStep - 1) / totalSteps) * 100;
    document.getElementById('progressFill').style.width = `${Math.max(12.5, progress + 12.5)}%`;
}

function updateDots() {
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index < currentStep);
    });
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10;
}

function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length > 3) {
            if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
    }
    input.value = value;
}

function submitForm() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const consent = document.getElementById('consent').checked;
    
    if (!firstName || !lastName || !email || !phone) {
        alert('Please fill in all required fields.');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        document.getElementById('email').focus();
        return;
    }
    
    if (!validatePhone(phone)) {
        alert('Please enter a valid 10-digit phone number (e.g., 210-555-5555).');
        document.getElementById('phone').focus();
        return;
    }
    
    if (!consent) {
        alert('Please check the consent box to proceed.');
        return;
    }
    
    const btn = document.getElementById('btn7');
    btn.disabled = true;
    btn.textContent = 'Submitting...';
    
    const responseId = generateResponseId();
    document.getElementById('responseId').textContent = responseId;
    
    const formData = buildFormData(responseId);
    
    // lines 132–134
    submitToGoogleForms(formData).then(() => {
        showSuccess();
    }).catch(() => {
        btn.disabled = false;
        btn.textContent = 'Get Matched!';
        alert('Submission failed. Please check your connection and try again.');
    });
}

function buildFormData(responseId) {
    return {
        'First Name': document.getElementById('firstName').value,
        'Last Name': document.getElementById('lastName').value,
        'Email': document.getElementById('email').value,
        'Phone': document.getElementById('phone').value,
        'Transaction Type': document.getElementById('transactionType').value,
        'Timeline': document.getElementById('timeline').value,
        'Financing': document.getElementById('financing').value,
        'Price Range': document.getElementById('priceRange').value,
        'Property Type': document.getElementById('propertyType').value,
        'Location': document.getElementById('location').value,
        'Current Address': document.getElementById('currentAddress').value,
        'Contact Method': document.getElementById('contactMethod').value,
        'Best Contact Time': document.getElementById('bestContactTime').value,
        'How Heard': document.getElementById('howHeard').value,
        'Consent': 'I consent to my contact details being shared with an eXp Realty agent for the purpose of matching me to real estate services.',
        'Additional Notes': ''
    };
}

async function submitToGoogleForms(data) {
    const formId = "1FAIpQLSdnYkUdPaC0XdOLla_bC2cyAl84WABeC0K2lHM78Mkdi0UPZQ";
    const formUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
    
    
    // entry.1278468536=I+consent+to+my+contact+details+being+shared+with+an+eXp+Realty+agent+for+the+purpose+of+matching+me+to+real+estate+services.
    // &entry.2005620554=first
    // &entry.420547383=last
    // &entry.1564509049=email@email.com
    // &entry.1166974658=210-555-5555
    // &entry.723752976=Buy
    // &entry.1755331071=Less+than+30+days
    // &entry.503258246=Cash
    // &entry.1416531690=Less+than+$200,000
    // &entry.719461200=Single-family+home
    // &entry.1438595406=12345
    // &entry.2055121868=SA,+TX
    // &entry.2048689274=Text
    // &entry.691597351=Morning
    // &entry.1496963227=Facebook

    const entryMap = {
        'First Name': 'entry.2005620554',
        'Last Name': 'entry.420547383',
        'Email': 'entry.1564509049',
        'Phone': 'entry.1166974658',
        'Transaction Type': 'entry.723752976',
        'Timeline': 'entry.1755331071',
        'Financing': 'entry.503258246',
        'Price Range': 'entry.1416531690',
        'Property Type': 'entry.719461200',
        'Location': 'entry.1438595406',
        'Current Address': 'entry.2055121868',
        'Contact Method': 'entry.2048689274',
        'Best Contact Time': 'entry.691597351',
        'How Heard': 'entry.1496963227',
        'Consent': 'entry.1278468536',
        'Additional Notes': 'entry.2082079721'
    };
    
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
        if (entryMap[key] && value) {
            params.append(entryMap[key], value);
        }
    }
    
    try {
        const response = await fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: params
        });
        console.log('Form submitted successfully');
        return Promise.resolve();
    } catch (error) {
        console.error('Google Form submission failed:', error.message);
        return Promise.reject(error);
    }
}

function generateResponseId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function showSuccess() {
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`.step[data-step="8"]`).classList.add('active');
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('stepIndicator').style.display = 'none';
    
    const btnRow = document.querySelector('.step[data-step="7"] .btn-row');
    if (btnRow) btnRow.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const source = getQueryParam('source');
    if (source) {
        document.getElementById('howHeard').value = source;
    }
    
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => formatPhone(phoneInput));
    }

    const locationInput = document.getElementById('location');
    const btn5 = document.getElementById('btn5');
    if (locationInput && btn5) {
        locationInput.addEventListener('input', () => {
            btn5.disabled = !locationInput.value.trim();
        });
    }
});