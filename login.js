const loginButton = document.getElementById("loginButton");

function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;


    if (username.length > 0 && password.length > 0) {
        getJWToken(username, password);
    }
    else {
        alert("please provide username/pasword");
    }
};


async function getJWToken(user, pass) {
    console.log("you are inside jwt()");
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            identifier: user,
            password: pass
        }),
    };

    await fetch("http://192.168.0.132:1337/api/auth/local", options)
        .then(response => {
            if(response.status === 200){
                console.log("200");
                return  response.json();
            }
            else{
                console.log(response.status);
                throw new Error("Authentication failed");
            }
           
        } )
        .then(result => {

            console.log(result);
            const jwtoken = result.jwt;
            

            localStorage.setItem("jwtToken", jwtoken);
            localStorage.setItem("user", user);
            const getJWT = localStorage.getItem("jwtToken");
            if (getJWT) {
                console.log(getJWT);
                alert("Welcome " + user);
                window.location.href = 'index.html';
            }
        }).catch(error =>{
            console.error("Authentication failed:", error);
            alert("Wrong username/Password");
            window.location.href = "loginPage.html";
        });
}

