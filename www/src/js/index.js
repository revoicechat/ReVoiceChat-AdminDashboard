document.addEventListener('DOMContentLoaded', function () {
    autoHost();
    // Last login
    if (localStorage.getItem("lastUsername")) {
        document.getElementById("username").value = localStorage.getItem("lastUsername");
    }
});

document.getElementById("login-form").addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        userLogin();
    }
});

function userLogin() {
    const FORM = document.getElementById("login-form");
    const LOGIN = {
        'username': FORM.username.value,
        'password': FORM.password.value,
    };

    // Validate URL
    try {
        const inputHost = new URL(FORM.host.value);
        login(LOGIN, inputHost.origin);
    } catch (e) {
        Swal.fire({
            icon: 'error',
            title: `Unable to login`,
            error: e,
            animation: false,
            customClass: SwalCustomClass,
            showCancelButton: false,
            confirmButtonText: "OK",
            allowOutsideClick: false,
        });
    }
}

function login(loginData, host) {
    fetch(`${host}/api/auth/login`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(loginData),
    })
        .catch(error => loginError(host, error))
        .then(async response => {
            if (response.ok) {
                const jwtToken = await response.text();
                localStorage.setItem("lastHost", host);
                localStorage.setItem("lastUsername", loginData.username);
                setCookie('jwtToken', jwtToken, 1);
                document.location.href = `app.html`;
            } else {
                const error = await response.text();
                loginError(host, error)
            }
        });
}

function loginError(host, error) {
    console.log(error);
    Swal.fire({
        icon: "error",
        title: `Unable to connect to\n ${host}`,
        error: error,
        focusConfirm: false,
        allowOutsideClick: false,
        animation: false,
        customClass: {
            title: "swalTitle",
            popup: "swalPopup",
            cancelButton: "swalCancel",
            confirmButton: "swalConfirm",
        },
    })
}

function autoHost() {
    document.getElementById("login-form").host.value = localStorage.getItem("lastHost")
        ? localStorage.getItem("lastHost")
        : document.location.origin;
}
