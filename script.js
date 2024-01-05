let array = [];
let score = 0;



let speed = 5;
function ballSpeed(x) {
    let buttons = document.getElementsByClassName("difficulty")
    for (let button of buttons) {
        button.style.background="white";
    }

    switch (x) {
        case 'e' :
            document.getElementById("easy").style.background="red";
            speed = 5;
            break;

        case 'n' :
            document.getElementById("normal").style.background="red";
            speed = 7;
            break;

        case 'h' :
            document.getElementById("hard").style.background="red";
            speed = 9;
            break;
    }
    
}

function game() {
    const canvas = document.getElementById("test");
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    let perdu = false;

    score = 0;
    let multiplier = 1;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let brick1 = new Image();
    brick1.src = "./assets/brick1.png";

    let brick2 = new Image();
    brick2.src = "./assets/brick2.png";

    let brick3 = new Image();
    brick3.src = "./assets/brick3.png";

    let ball_texture = new Image();
    ball_texture.src = "./assets/ball.png";

    class Ball {
        constructor(x, y, size, vx, vy) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.vx = vx;
            this.vy = vy;
            this.collide = false;
        }


        update() {
            this.collide = false;

            this.x += this.vx;
            this.y += this.vy;

            // Wall collision
            if (this.x <= 0 || this.x+this.size >= canvas.width) {
                this.vx *= -1;
            }
            if (this.y <= 0) {
                this.vy *= -1;
            }
            if (this.y+this.size >= canvas.height) {
                perdu = true;
            }
            
            // Pad collision
            if (this.x+this.size >= barre.x+10 && this.x <= barre.x+barre.width-10) {
                if (this.y+this.size >= barre.y && this.y <= barre.y+barre.height) {
                    
                    let offset = (this.x+this.size/2 - barre.x)/barre.width;
                    let angle = 7*Math.PI/6 + 2*offset*Math.PI/3;

                    let v_norm = (this.vx**2 + this.vy**2)**0.5;
                    
                    this.vx = v_norm*Math.cos(angle);
                    this.vy = v_norm*Math.sin(angle);

                    this.y = barre.y-this.size;

                    multiplier = 1;  // Reset score multiplier
                }
            }

            ctx.fillStyle = "red";
            //ctx.fillRect(this.x, this.y, this.size, this.size);
            ctx.drawImage(ball_texture, this.x, this.y, this.size, this.size);
        }
    }


    class Barre {
        constructor(x, y, height, width) {
            this.x = x;
            this.y = y;
            this.height = height;
            this.width = width;
        }

        update() {
            ctx.fillStyle = "blue";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }


    class Brick {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.show = true;
            this.hp = 3;
        }

        draw() {
            ctx.fillStyle = "green";
            //ctx.fillRect(this.x, this.y, this.width, this.height);
            switch (this.hp) {
                case 3 :
                    ctx.drawImage(brick1, this.x, this.y, this.width, this.height);
                    break;
                case 2 :
                    ctx.drawImage(brick2, this.x, this.y, this.width, this.height);
                    break;
                case 1 :
                    ctx.drawImage(brick3, this.x, this.y, this.width, this.height);
                    break;
            }
            
        }

        checkCollision() {
            for (ball of balls) {
                if (this.y <= ball.y+ball.size && this.y+this.height >= ball.y) {
                    if (this.x <= ball.x+ball.size && this.x+this.width >= ball.x) {
                        if (!ball.collide) {
                            let prev_x = ball.x - ball.vx;
                            let prev_y = ball.y - ball.vy;

                            if (prev_y >= this.y+this.height || prev_y+ball.size <= this.y) ball.vy *= -1;
                            if (prev_x >= this.x+this.width || prev_x+ball.size <= this.x) ball.vx *= -1;
                        }
                        ball.collide = true;
                        
                        this.hp --;

                        score += 10*multiplier;
                        multiplier += 0.5;

                        if (this.hp == 0) {
                            this.show = false;
                            score += 10*multiplier;
                            multiplier += 0.5;
                        }
                    }
                }
            }
        }
        
    }
    

    const NB_BALLS = 1;
    
    let balls = [];
    let i = 0;
    while (i < NB_BALLS) {
        let direction = Math.random() * Math.PI/2 + 5*Math.PI/4;
        balls.push(new Ball(canvas.width/2, canvas.height/2, 20, speed*Math.cos(direction), speed*Math.sin(direction)));
        i++;
    }

    let barre = new Barre(0, 4*canvas.height/5, 10, 100);

    let bricks = []
    const nb_columns = 20;
    const nb_rows = 5;
    for (i=0; i<nb_columns; i++) {
        for (j=0; j<nb_rows; j++) {
            
            bricks.push(new Brick(i*canvas.width/nb_columns, (j+2)*canvas.height/(5*nb_rows), canvas.width/nb_columns, canvas.height/(5*nb_rows)));
        }
    }


    addEventListener("mousemove", (e) => {barre.x = e.clientX-rect.left-barre.width/2});


    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (ball of balls) {
            ball.update();
        }
        
        barre.update()
        
        for (let brick of bricks) {
            if (brick.show) {
                brick.checkCollision();
                brick.draw();
            }
        }

        if (perdu) {
            lose();
            
        }
    }

    function lose() {
        console.log("fin de partie");
        clearInterval(interval);
        

        // Créer le dialog ici
        let dialog = document.getElementById("dialog");
        let closeButton = document.querySelector("dialog button");
        

        let trashtalkList = [];
        let trashtalk = "";
        if (score <= 50) {
            trashtalkList = ["At least your score is positive... Pro tip : Use your mouse to move the bar !",
                             "Make sure your mouse is connected to your PC"]
            
            trashtalk = trashtalkList[Math.floor(Math.random()*trashtalkList.length)];  // Picking a random trashtalk to display
        } else if (score <= 250) {
            trashtalk = ""
        }
        document.getElementById("trashtalk").textContent = trashtalk;
        document.getElementById("score").textContent = `Your score is ${score}`;
        
        dialog.showModal();
        document.body.removeChild(canvas);

        

        console.log(closeButton);
        //closeButton.addEventListener("click", back2menu);

        
    }

    let interval = setInterval(draw, 10);
}

function startGame() {
    let name = document.getElementById("name").value;
    if (name.length == 0) {
        alert("Enter a valid name");
    } else {
        document.getElementById("menu").hidden = true;  // Hidding the menu elements
        
        // Creating a canvas for the new game
        let canvas = document.createElement("canvas");  
        canvas.id = "test";
        document.body.appendChild(canvas);

        game(); // Starting the game
    }
}


function print() {
    let table = document.getElementById("scoreboard");
    table.innerHTML = "";
    
    let line = document.createElement("TR");
    let rank = document.createElement("TH");
    let name = document.createElement("TH");
    let score = document.createElement("TH");

    rank.innerText = "Rank";
    line.appendChild(rank);
    
    name.innerText = "Name";
    line.appendChild(name);

    score.innerText = "Score";
    line.appendChild(score);

    table.appendChild(line);

    array = array.sort((a,b) => b["s"]-a["s"])  // Sorting the score array by scores and not names
    array = array.slice(0,10) // Keeping only the 10 best scores

    // Filling the table
    for (let x of array) {
        line = document.createElement("TR");

        let name = x["n"];
        let score = x["s"];

        rank_case = document.createElement("TD");
        rank_case.innerText = 1+array.indexOf(x);
        line.appendChild(rank_case);

        name_case = document.createElement("TD");
        name_case.innerText = name;
        line.appendChild(name_case);

        score_case = document.createElement("TD");
        score_case.innerText = score;
        line.appendChild(score_case);

        table.appendChild(line);
    }

}


function back2menu() {
    dialog.close();            

    document.getElementById("menu").hidden = false;

    let name = document.getElementById("name").value;
    array.push({n:name, s:score});
    print();
}