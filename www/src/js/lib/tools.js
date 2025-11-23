const SwalCustomClass = {
    title: "swalTitle",
    popup: "swalPopup",
    cancelButton: "swalCancel",
    confirmButton: "swalConfirm",
}

/**
 * Set a cookie to browser / tauri
 * @param name Name of cookie
 * @param value Data of cookie
 * @param days Expiration (in days)
 */
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict";
}

/**
 * Get a cookie from browser / tauri
 * @param name Name of cookie to read/get
 * @returns Data of cookie
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
        let cookie = c.trim();
        if (cookie.startsWith(nameEQ)) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }
    return null;
}

/**
 * Erase a named cookie
 * @param name Name of the cookie
 */
function eraseCookie(name) {
    document.cookie = name + "=; Max-Age=-99999999; path=/";
}

/**
 * Copy data to user clipboard
 * When available it use the newest API clipboard.writeText()
 * @param data Data to copy to user clipboard
 */
async function copyToClipboard(data) {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(data);
        } else {
            fallbackCopyToClipboard(data)
        }
    } catch (err) {
        console.error('copyToClipboard: Failed to copy:', err);
    }
}

function fallbackCopyToClipboard(data) {
    const input = document.createElement('input');
    input.id = 'input-copy'
    input.value = data;
    document.body.appendChild(input);
    document.getElementById('input-copy').select();
    document.execCommand("copy"); // NOSONAR - it is a fallback method
    input.remove();
}

module.exports = {
    SwalCustomClass,
    setCookie,
    getCookie,
    eraseCookie,
    copyToClipboard
};