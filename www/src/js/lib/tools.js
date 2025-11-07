const SwalCustomClass = {
    title: "swalTitle",
    popup: "swalPopup",
    cancelButton: "swalCancel",
    confirmButton: "swalConfirm",
}

// Save a cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict";
}

// Read a cookie
function getCookie(name) {
    const stored = localStorage.getItem(`secure_${name}`);
    if (!stored) return null;
    try {
        const data = JSON.parse(stored);
        if (data.expires && Date.now() > data.expires) {
            localStorage.removeItem(`secure_${name}`);
            return null;
        }
        return data.value;
    } catch (e) {
        console.error('Error parsing stored data:', e);
        return null;
    }
}

// Delete a cookie
function eraseCookie(name) {
    document.cookie = name + "=; Max-Age=-99999999; path=/";
}