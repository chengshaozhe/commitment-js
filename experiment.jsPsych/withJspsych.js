
const initgridMatrix = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
var ifPlayerShowInFixation = false;
var ifGoalShowInFixation = false;
var ifObstacleShowInFixation = false;
var gridMatrixList = [initgridMatrix,initgridMatrix,initgridMatrix,initgridMatrix];
var playerStateList = [[7,5],[7,5],[7,5],[7,5],[7,5],[7,5]]
const goalList = [[[1,2],[1,8]],[[1,2],[1,8]],[[1,2],[1,8]],[[1,2],[1,8]],[[1,2],[1,8]],[[1,2],[1,8]],[[1,2],[1,8]]]
const driftSequenceList = [[1,0,0,0,0],[1,0,0,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]];

var allTrialsData = new Array();
var curTrial = 0;
var nTrials = 3;
var blockTrials = 1;
const subName = "test";
var stepCount = 0;
gridMatrixList[curTrial][playerStateList[curTrial][0]][playerStateList[curTrial][1]] = 2
goalList[curTrial].forEach((state,i) => gridMatrixList[curTrial][state[0]][state[1]] = 9);
var singleTrialData = {mapMatrix: Array(gridMatrixList[curTrial]), playerPos: Array(playerStateList[curTrial]), goal1Pos: Array(goalList[curTrial][0]),
    goal2Pos: Array(goalList[curTrial][1]),driftSequence: Array(), ifGoal: Array(), aimAction: Array(), realAction: Array(), RT: Array()};
var timestamp1 =new Date().getTime();

function isValidMove(matrix, playerState,action) {
    let [x, y] = playerState;
    let nextState = [x+action[1],y+action[0]];
    if (matrix[nextState[0]][nextState[1]] !== 1) {
        return action;
    }
    return [0,0];
}

function arrayEqual(arr1, arr2) {
    if (arr1.length != arr2.length) return false;
    for (var i = 0; i < arr1.length; ++i) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

function isGoalReached( playerState, goalStates) {
    const [player_x,player_y] = playerState
    if (player_x === goalStates[0][0] && player_y === goalStates[0][1])
    {return true;}
    else if
    (player_x === goalStates[1][0] && player_y === goalStates[1][1])
    {return true;}
    else
    {return false;}
}

function updateMatrix(matrix, y, x, value) {
    matrix[y][x] = value;
    return matrix
}

function drift(ifDrift, aimAction){
    let [x,y] = aimAction;
    let actionAfterDrift = [x,y];
    if (ifDrift){
        let actionSpace = ACTIONSPACE.slice()
        actionSpace.splice(actionSpace.findIndex(e => arrayEqual(e,[x,y])), 1);
        actionAfterDrift = actionSpace[Math.floor(Math.random() * actionSpace.length)];
    }
    return actionAfterDrift
}

function transition(action, ifDrift) {
    let actionAfterDrift = drift(ifDrift, action);
    return actionAfterDrift
}

Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}

Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key))
}

function localRecord(data,name){
    var content = JSON.stringify(data);
    var eleLink = document.createElement('a');
    eleLink.download = name + ".json";
    eleLink.style.display = 'none';
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    document.body.appendChild(eleLink);
    eleLink.click();
    document.body.removeChild(eleLink);
}

function Fixation(c){
    var context = c.getContext("2d");
    c.width = WINSETTING.w;
    c.height = WINSETTING.h;

    const center = getCenter(WINSETTING.w, WINSETTING.h);
    c.style.marginLeft = center.x
    c.style.marginTop = center.y;

    context.fillStyle = COLORPOOL.line;
    context.fillRect(0 - EXPSETTINGS.padding ,
        0 - EXPSETTINGS.padding,
        WINSETTING.w + EXPSETTINGS.padding, WINSETTING.h + EXPSETTINGS.padding);

    for (let row = 0; row < gridMatrixList[curTrial].length; row++) {
        for (let col = 0; col < gridMatrixList[curTrial][row].length; col++) {
            const cellVal = gridMatrixList[curTrial][row][col];
            let color = "#111";
            if (cellVal === 1 && ifObstacleShowInFixation === true) {
                color = COLORPOOL.obstacle;
            } else if (cellVal === 2 && ifPlayerShowInFixation === true) {
                color = COLORPOOL.player;
            } else if (cellVal === 9 && ifGoalShowInFixation === true) {
                color = COLORPOOL.goal;
            } else{
                color = COLORPOOL.map;
            };

            // draw rect
            if ((ifGoalShowInFixation === true && cellVal === 9) || (ifPlayerShowInFixation === true && cellVal === 2)) {
                drawCircle(context, color, 1 / 3 * EXPSETTINGS.padding,
                    col, row, 0, 2 * Math.PI);
            } else{
                context.fillStyle = color;
                context.fillRect(col * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + EXPSETTINGS.padding,
                    row * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + EXPSETTINGS.padding,
                    EXPSETTINGS.cellSize, EXPSETTINGS.cellSize);
            };
        }
    }
    drawFixation(context,[5,5],1 / 5, 2 * EXPSETTINGS.padding);
}

function drawGrid(c){
    var context = c.getContext("2d");
    c.width = WINSETTING.w;
    c.height = WINSETTING.h;

    const center = getCenter(WINSETTING.w, WINSETTING.h);
    c.style.marginLeft = center.x
    c.style.marginTop = center.y;

    context.fillStyle = COLORPOOL.line;
    context.fillRect(0 - EXPSETTINGS.padding,
       0 -EXPSETTINGS.padding,
        WINSETTING.w + EXPSETTINGS.padding, WINSETTING.h + EXPSETTINGS.padding);

    for (let row = 0; row < gridMatrixList[curTrial].length; row++) {
        for (let col = 0; col < gridMatrixList[curTrial][row].length; col++) {
            const cellVal = gridMatrixList[curTrial][row][col];
            let color = "#111";
            if (cellVal === 1) {
                color = COLORPOOL.obstacle;
            } else if (cellVal === 2) {
                color = COLORPOOL.player;
            } else if (cellVal === 9) {
                color = COLORPOOL.goal;
            } else{
                color = COLORPOOL.map;
            };

            // draw rect
            if (cellVal === 9 ||  cellVal === 2) {
                drawCircle(context, color, 1 / 3 * EXPSETTINGS.padding,
                    col, row, 0, 2 * Math.PI);
            } else{
                context.fillStyle = color;
                context.fillRect(col * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + EXPSETTINGS.padding,
                    row * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + EXPSETTINGS.padding,
                    EXPSETTINGS.cellSize, EXPSETTINGS.cellSize);
            };
        }
    }
}

function getCenter(w, h) {
    return {
        x: window.innerWidth / 2 - w / 2 + "px",
        y: window.innerHeight / 2 - h / 2 + "px"
    };
}

function drawFixation(c,fixationPos,posScale, lineWidth) {
    let col = playerStateList[curTrial][1];
    let row = playerStateList[curTrial][0];
    c.lineWidth = lineWidth;
    c.strokeStyle = COLORPOOL.fixation;

    c.moveTo(col * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + EXPSETTINGS.padding + posScale * EXPSETTINGS.cellSize,
        row * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + EXPSETTINGS.padding + 1/2 * EXPSETTINGS.cellSize);
    c.lineTo(col * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + EXPSETTINGS.padding + (1-posScale) * EXPSETTINGS.cellSize,
        row * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + EXPSETTINGS.padding + 1/2 * EXPSETTINGS.cellSize);

    c.moveTo(col * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + 1/2 * EXPSETTINGS.cellSize + EXPSETTINGS.padding,
        row * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + posScale * EXPSETTINGS.cellSize + EXPSETTINGS.padding);
    c.lineTo(col * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + 1/2 * EXPSETTINGS.cellSize + EXPSETTINGS.padding,
        row * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + (1-posScale) * EXPSETTINGS.cellSize + EXPSETTINGS.padding);
    c.stroke();
}

function drawCircle (c,color, lineWidth, colPos, rowPos, startAngle,tmpAngle){
    c.fillStyle = COLORPOOL.map;
    c.fillRect(colPos * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + EXPSETTINGS.padding,
        rowPos * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + EXPSETTINGS.padding,
        EXPSETTINGS.cellSize, EXPSETTINGS.cellSize);

    c.beginPath();
    c.lineWidth = lineWidth;
    c.strokeStyle = COLORPOOL.line;
    c.arc(colPos * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + EXPSETTINGS.padding+ 1/2 * EXPSETTINGS.cellSize,
        rowPos * (EXPSETTINGS.cellSize + EXPSETTINGS.padding) + EXPSETTINGS.padding + 1/2 * EXPSETTINGS.cellSize, 1/3 * EXPSETTINGS.cellSize,
        startAngle, tmpAngle);
    c.fillStyle = color
    c.fill()
    c.stroke();
    c.closePath();}

var jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.displayData('csv');
    }
});

var sub_info={
    type:jsPsychSurveyText,
    questions: [
        {prompt:
              `
              <p style="font-size:30px;font-weight:bold">Welcome to the experiment</p>
              <p style="font-size:20px;">Please input your name with 3 random numbers, such as Cesillia253.</p>
              `,
            name:"Name"}
    ],
    data: {
        type: 'Sub_info'
    },
    button_label:'Continue',
    css_classes:['Basic']
};

var fixationT={
    type: jsPsychCanvasKeyboardResponse,
    canvas_size: [WINSETTING.w, WINSETTING.h],
    stimulus: Fixation,
    choices: "NO_KEYS",
    trial_duration: 2000,
    data: {type: 'fixation'}
};

var eachStep={
    type: jsPsychCanvasKeyboardResponse,
    canvas_size: [WINSETTING.w, WINSETTING.h],
    stimulus: drawGrid,
    choices: ["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"],
    prompt: '<p style="font-size:20px;text-align: center;">Press ↑ ↓ ← → to control the player</p>',
    data: {type: 'maintask'}
};

var mainTask = {
    timeline: [eachStep],
    loop_function: function(){
        const [x,y] = playerStateList[curTrial]
        let responseKey = jsPsych.data.getLastTrialData().filter({type:'maintask'}).trials[0].response;
        let action = DIRECTIONS[responseKey].movement;
        const ifDrift = stepCount < driftSequenceList[curTrial].length ? driftSequenceList[curTrial][stepCount] : 0;
        var realAction = transition(action, ifDrift);
        realAction =  isValidMove(gridMatrixList[curTrial], playerStateList[curTrial], realAction);
        gridMatrixList[curTrial] = updateMatrix(gridMatrixList[curTrial], x, y, 0);
        gridMatrixList[curTrial] = updateMatrix(gridMatrixList[curTrial], x  + realAction[1], y + realAction[0], 2);
        playerStateList[curTrial] = [x + realAction[1], y + realAction[0]];
        let trialOver = isGoalReached(playerStateList[curTrial], goalList[curTrial]);
        jsPsych.data.get().addToLast({trials: curTrial});
        singleTrialData.playerPos.push(playerStateList[curTrial]);
        singleTrialData.ifGoal.push(trialOver);
        singleTrialData.aimAction.push(action);
        singleTrialData.realAction.push(realAction);
        singleTrialData.driftSequence.push(ifDrift);
        
        if(trialOver){
            singleTrialData.RT.push(jsPsych.data.get().filter({trials:curTrial}).select('rt'));
            allTrialsData[curTrial] = singleTrialData;
            curTrial ++;
            stepCount = 0;
            //reset
            if (curTrial < nTrials) {
                gridMatrixList[curTrial][playerStateList[curTrial][0]][playerStateList[curTrial][1]] = 2
                goalList[curTrial].forEach((state, i) => gridMatrixList[curTrial][state[0]][state[1]] = 9);
                singleTrialData = {
                    mapMatrix: Array(gridMatrixList[curTrial]),
                    playerPos: Array(playerStateList[curTrial]),
                    goal1Pos: Array(goalList[curTrial][0]),
                    goal2Pos: Array(goalList[curTrial][1]),
                    driftSequence: Array(),
                    ifGoal: Array(),
                    aimAction: Array(),
                    realAction: Array(),
                    RT: Array()
                };
            }
            return false;
        } else{
            stepCount ++;
            return true;
        }
    }
}

var blankTime = {
    type:jsPsychHtmlKeyboardResponse,
    stimulus:'<p style="font-size:30px;text-align: center;">Waiting for the next run...</p>',
    choices: "NO_KEYS",
    trial_duration: 2000,
    css_classes:['BlankTime']
};

var blankBetweenTrials = {
    timeline: [blankTime],
    conditional_function: function(){
        if(curTrial > nTrials-1){
            return false;
        } else {
            return true;
        }
    }
}

var experiments = {
    timeline: [fixationT,mainTask,blankBetweenTrials],
    repetitions: nTrials
}

var end={
    type:jsPsychHtmlButtonResponse,
    stimulus: `
      <p style="font-size:48px;">You have finished all the tasks.</p>
      <p style="font-size:36px;">Please press the button on the screen to exit.</p>
      `,
    choices: ['OK!'],
    css_classes:['Basic']
};

var record = {
    type: jsPsychCallFunction,
    func: function(done){
        jsPsych.pluginAPI.setTimeout(function() {
            localStorage.setObj(subName + "data", allTrialsData);
            console.log("what you read is data retrieved from the local storage", localStorage.getObj(subName + "data"));
            localRecord(allTrialsData,subName);
            done(0);
        }, 0)
    }
}
var timeline = [];
timeline.push(sub_info);
timeline.push(experiments);
timeline.push(record);
timeline.push(end);
jsPsych.run(timeline);

