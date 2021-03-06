class GridSystem {
    constructor(matrix) {
        this.matrix = matrix;
        this.cellSize = 60;
        this.padding = 2;
        this.w = (this.cellSize + this.padding) * matrix[0].length + (this.padding);
        this.h = (this.cellSize + this.padding) * matrix.length + (this.padding);
        this.uiContext = this.getContext(0, 0, "#FFFFFF");
        this.outlineContext = this.getContext(0, 0, "#3D3C3C");
        this.topContext = this.getContext(0, 0, "#FFFFFF", true);
        this.player = {color: "orange" };
        this.goal = {color: "#0000FF" };
        this.linecolor = {color: "#444" };
        this.wall = {color: "#111" };
        this.map = {color: "#FFFFFF"};


    }

    getCenter(w, h) {
        return {
            x: window.innerWidth / 2 - w / 2 + "px",
            y: window.innerHeight / 2 - h / 2 + "px"
        };
    }

    getContext(w, h, color = "#FFFFFF", isTransparent = false) {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.position = "absolute";
        this.canvas.style.background = color;

        const center = this.getCenter(w, h);
        this.canvas.style.marginLeft = center.x
        this.canvas.style.marginTop = center.y;
        document.body.appendChild(this.canvas);

        return this.context;
    }

    render() {

        this.outlineContext.canvas.width = this.w;
        this.outlineContext.canvas.height = this.h;

        const center = this.getCenter(this.w, this.h);
        this.outlineContext.canvas.style.marginLeft = center.x
        this.outlineContext.canvas.style.marginTop = center.y;

        this.topContext.canvas.style.marginLeft = center.x
        this.topContext.canvas.style.marginTop = center.y;

        for (let row = 0; row < this.matrix.length; row ++) {
            for (let col = 0; col < this.matrix[row].length; col ++) {
                const cellVal = this.matrix[row][col];
                let color = "#111";

                if (cellVal === 1) {
                    color = this.wall.color;
                } else if (cellVal === 0) {
                    color = this.map.color;
                } else if (cellVal === 2) {
                    color = this.player.color;
                } else if (cellVal === 9) {
                    color = this.goal.color;
                }

                // draw rect
                if (cellVal === 1 || cellVal === 0){
                    this.outlineContext.fillStyle = color;
                    this.outlineContext.fillRect(col * (this.cellSize + this.padding) + this.padding,
                        row * (this.cellSize + this.padding) + this.padding,
                        this.cellSize, this.cellSize);
                }else{
                    this.drawCircle (color, 1/3 * this.padding, col, row, 0, 2 * Math.PI)
                }
            }
        }
    }
    drawCircle (color, lineWidth, colPos, rowPos, startAngle,tmpAngle){
        this.outlineContext.fillStyle = this.map.color;
        this.outlineContext.fillRect(colPos * (this.cellSize + this.padding) + this.padding,
            rowPos * (this.cellSize + this.padding) + this.padding,
            this.cellSize, this.cellSize);

        this.outlineContext.beginPath();
        this.outlineContext.lineWidth = lineWidth;
        this.outlineContext.strokeStyle = this.linecolor;
        this.outlineContext.arc(colPos * (this.cellSize + this.padding) + this.padding+ 1/2 * this.cellSize,
            rowPos * (this.cellSize + this.padding) + this.padding + 1/2 * this.cellSize, 1/3 * this.cellSize,
            startAngle, tmpAngle);
        this.outlineContext.fillStyle = color
        this.outlineContext.fill()
        this.outlineContext.stroke();
        this.outlineContext.closePath();}
}

class fixation {
    constructor(matrix, fixationPos, ifPlayer, ifGoal, ifObstacle){
        this.matrix = matrix;
        this.fixationPos = fixationPos;
        this.ifPlayer = ifPlayer;
        this.ifGoal = ifGoal;
        this.ifObstacle = ifObstacle;
        this.gridDraw = new GridSystem(matrix)
    }

    render() {
        const w = (this.gridDraw.cellSize + this.gridDraw.padding) * this.matrix[0].length + (this.gridDraw.padding);
        const h = (this.gridDraw.cellSize + this.gridDraw.padding) * this.matrix.length + (this.gridDraw.padding);

        this.gridDraw.outlineContext.canvas.width = w;
        this.gridDraw.outlineContext.canvas.height = h;

        const center = this.gridDraw.getCenter(w, h);
        this.gridDraw.outlineContext.canvas.style.marginLeft = center.x
        this.gridDraw.outlineContext.canvas.style.marginTop = center.y;

        this.gridDraw.topContext.canvas.style.marginLeft = center.x
        this.gridDraw.topContext.canvas.style.marginTop = center.y;

        for (let row = 0; row < this.matrix.length; row++) {
            for (let col = 0; col < this.matrix[row].length; col++) {
                const cellVal = this.matrix[row][col];
                let color = "#111";

                if (cellVal === 1 && this.ifObstacle === true) {
                    color = this.gridDraw.wall.color;
                } else if (cellVal === 2 && this.ifPlayer === true) {
                    color = this.gridDraw.player.color;
                } else if (cellVal === 9 && this.ifGoal === true) {
                    color = this.gridDraw.goal.color;
                } else{
                    color = this.gridDraw.map.color;
                };

                // draw rect
                if ((this.ifGoal === true && cellVal === 9) || (this.ifPlayer === true && cellVal === 2)) {
                    this.gridDraw.drawCircle(color, 1 / 3 * this.gridDraw.padding,
                        col, row, 0, 2 * Math.PI);
                    console.log(this.gridDraw.padding);
                } else{
                    this.gridDraw.outlineContext.fillStyle = color;
                    this.gridDraw.outlineContext.fillRect(col * (this.gridDraw.cellSize + this.gridDraw.padding) + this.gridDraw.padding,
                        row * (this.gridDraw.cellSize + this.gridDraw.padding) + this.gridDraw.padding,
                        this.gridDraw.cellSize, this.gridDraw.cellSize);
                };
            }
        }
        // draw fixation
        this.drawFixation(1 / 5, 2 * this.gridDraw.padding);
    }

    drawFixation(posScale, lineWidth) {
        let col = this.fixationPos[1];
        let row = this.fixationPos[0];
        this.gridDraw.outlineContext.lineWidth = lineWidth;//??????????????????10
        this.gridDraw.outlineContext.strokeStyle = 'black';//???????????????????????????

        this.gridDraw.outlineContext.moveTo(col * (this.gridDraw.cellSize + this.gridDraw.padding) + this.gridDraw.padding + posScale * this.gridDraw.cellSize,
            row * (this.gridDraw.cellSize + this.gridDraw.padding) + this.gridDraw.padding + 1/2 * this.gridDraw.cellSize);
        this.gridDraw.outlineContext.lineTo(col * (this.gridDraw.cellSize + this.gridDraw.padding) + this.gridDraw.padding + (1-posScale) * this.gridDraw.cellSize,
            row * (this.gridDraw.cellSize + this.gridDraw.padding) + this.gridDraw.padding + 1/2 * this.gridDraw.cellSize);

        this.gridDraw.outlineContext.moveTo(col * (this.gridDraw.cellSize + this.gridDraw.padding) + 1/2 * this.gridDraw.cellSize + this.gridDraw.padding,
            row * (this.gridDraw.cellSize + this.gridDraw.padding) + posScale * this.gridDraw.cellSize + this.gridDraw.padding);
        this.gridDraw.outlineContext.lineTo(col * (this.gridDraw.cellSize + this.gridDraw.padding) + 1/2 * this.gridDraw.cellSize + this.gridDraw.padding,
            row * (this.gridDraw.cellSize + this.gridDraw.padding) + (1-posScale) * this.gridDraw.cellSize + this.gridDraw.padding);
        this.gridDraw.outlineContext.stroke();
    }
}


