const loginButton = document.getElementById("loginButton");

function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;


    if (username.length > 0 && password.length > 0) {
        getUser(username, password);
    }
    else {
        alert("please provide username/pasword");
    }
};

function getUser(user, password) {
    let options = {
        method: "GET",
    };
    fetch("http://192.168.0.132:1337/api/users", options)
        .then(response => response.json())
        .then(result => {
            let isAuthenticated = false;
           for (const userObj of result ) {
                const { username, secretkey } = userObj;
                console.log(username);
                if (user === username && password === secretkey) {
                    isAuthenticated = true;
                    alert("Welcome " + user);
                    window.location.href = 'index.html';
                    break;
                }
                
            }

            if(!isAuthenticated) {
                alert("Wrong username/Password");
            }

        });
    }
