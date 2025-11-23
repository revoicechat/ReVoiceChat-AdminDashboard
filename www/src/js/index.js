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
    }
    catch (e) {
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

async function login(loginData, host) {
    try {
        const response = await fetch(`${host}/api/auth/login`, {
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            throw new Error("Not OK");
        }

        // Local storage
        localStorage.setItem("lastHost", host);
        localStorage.setItem("lastUsername", loginData.username);

        const jwtToken = await response.text();
        setCookie('jwtToken', jwtToken, 1);
        document.location.href = `app.html`;
    }
    catch (error) {
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
}

function autoHost() {
    switch (document.location.origin) {
        case "https://dev.revoicechat.fr":
            document.getElementById("login-form").host.value = "https://dev.revoicechat.fr";
            break;

        case "https://app.revoicechat.fr":
            document.getElementById("login-form").host.value = "https://app.revoicechat.fr";
            break;
        default:
            if (localStorage.getItem("lastHost")) {
                document.getElementById("login-form").host.value = localStorage.getItem("lastHost");
            }
            break;
    }
}
