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
    console.log(action);
    console.log(actionAfterDrift);
    return actionAfterDrift
}

function createContext(w, h, color,idname){
    let canvas = document.createElement("canvas");
    canvas.id = idname;
    canvas.context = canvas.getContext("2d");
    canvas.width = w;
    canvas.height = h;
    canvas.style.background = color;
    canvas.style.position = "absolute";
    const center = [window.innerWidth / 2 - w / 2 + "px",window.innerHeight / 2 - h / 2 + "px"];
    canvas.style.marginLeft = center[0];
    canvas.style.marginTop = center[1];
    document.body.appendChild(canvas);
    return canvas;
}

function fixationPhase (initgridMatrix,fixTime,fixationPos) {
    return new Promise(resolve => {
        setTimeout(() => {
            fixationPos = arguments[2] ? arguments[2] : [Math.floor(1/2 * initgridMatrix.length),
                Math.floor(1/2 * initgridMatrix.length)];
            let fix = new fixation(initgridMatrix, fixationPos, false, false, false);
            fix.render();
            resolve('done');
        }, 0);
    }).then(res => new Promise(resolve => {setTimeout(() => {
        resolve('done');
    }, fixTime)}));
}

function blankPhase (time,trialCal) {
    return new Promise(resolve => {
        setTimeout(() => {
            var blankCanvas = createContext(WINSETTING.w,WINSETTING.h,"white","blankcanvas");
            blankCanvas.context.fillStyle = "black";
            blankCanvas.context.font = "40px Arial";
            if (trialCal < nTrials - 1){
                blankCanvas.context.fillText('Waiting For Next Run...',1/4*WINSETTING.w,1/2*WINSETTING.h);
            }
            else{
                blankCanvas.context.fillText('Game Over',1/3*WINSETTING.w,1/2*WINSETTING.h);
            }
            resolve('done');
        }, 0);
    }).then(res => new Promise(resolve => {setTimeout(() => {console.log();
        resolve('done');
    }, time)}));
}

function drawGrid (initgridMatrix) {
    return new Promise(resolve => {
        setTimeout(() => {
            var gridSystem = new GridSystem(initgridMatrix);
            gridSystem.render();
            resolve('done');
        }, 0);
    });
}

function keyPress (gridMatrix,playerState,goalStates, singleTrialData, driftSequence, trialCal, stepCount) {
    return new Promise((resolve,reject) => {
        const [x,y] = playerState
        let trialOver = false;
        let timestamp1 =new Date().getTime();
        const ifDrift = stepCount < driftSequence.length ? driftSequence[stepCount] : 0;

        $(document).on("keydown.task_response", (e) => {
            let action;
            if (e.keyCode >= 37 && e.keyCode <= 40)
            {
                action = DIRECTIONS[e.key].movement;
                console.log(ifDrift)
                var realAction = transition(action, ifDrift)
                realAction =  isValidMove(gridMatrix, playerState, realAction);
                gridMatrix = updateMatrix(gridMatrix, x, y, 0);
                gridMatrix = updateMatrix(gridMatrix, x  + realAction[1], y + realAction[0], 2);
                playerState = [x + realAction[1], y + realAction[0]];
                drawGrid(gridMatrix);
                $(document).off("keydown.task_response")
                trialOver = isGoalReached(playerState, goalStates);
            };
            // 注意我此处设定的是即便是撞墙的按键，也视为有效，因此在noisestep中也是算入的。
            stepCount ++;


            //data recording
            singleTrialData.RT.push(new Date().getTime() - timestamp1);
            singleTrialData.playerPos.push(playerState);
            singleTrialData.ifGoal.push(trialOver);
            singleTrialData.aimAction.push(action);
            singleTrialData.realAction.push(realAction);
            singleTrialData.driftSequence.push(ifDrift);

            if (trialOver){
                allTrialsData[trialCal] = singleTrialData;
                reject('break');
            }else{
                resolve('done');
            }
        })
    }).then (res =>keyPress (gridMatrix,playerState,goalStates,singleTrialData, driftSequence, trialCal, stepCount)).catch(
        bre => console.log()).then(res => new Promise(resolve => {setTimeout(() => {
        resolve('done');
    }, 0)}));
}
Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key))
}

function ifTrialCircleJudge (gridMatrix,playerState,goalStates,driftSequence, trialCal) {
    return new Promise((resolve, reject)=> {
        setTimeout(() => {
        if (trialCal < nTrials -1){
            trialCal++;
            resolve('done');
        }
        else{
            reject('over');
        }
        }, 0);
    }).then(res => TrialForCircle (gridMatrix,playerState,goalStates,driftSequence, trialCal)).catch(
        bre => {localStorage.setObj("data", allTrialsData);
            console.log("what you read is data retrieved from the local storage", localStorage.getObj("data"))})
}

async function TrialForCircle(gridMatrix, playerState, goalStates, driftSequence, trialCal) {
    gridMatrix[trialCal][playerState[trialCal][0]][playerState[trialCal][1]] = 2
    goalStates[trialCal].forEach((state,i) => gridMatrix[trialCal][state[0]][state[1]] = 9);
    let singleTrialData = {mapMatrix: Array(gridMatrix[trialCal]), playerPos: Array(playerState[trialCal]), goal1Pos: Array(goalStates[trialCal][0]),
        goal2Pos: Array(goalStates[trialCal][1]),driftSequence: Array(), ifGoal: Array(), aimAction: Array(), realAction: Array(), RT: Array()};
    await fixationPhase(gridMatrix[trialCal], 2000, playerState[trialCal]);
    await drawGrid(gridMatrix[trialCal]);
    let stepCount = 0;
    await keyPress(gridMatrix[trialCal], playerState[trialCal], goalStates[trialCal], singleTrialData, driftSequence[trialCal], trialCal, stepCount);
    await blankPhase(1000,trialCal,gridMatrix[trialCal]);
    await ifTrialCircleJudge (gridMatrix,playerState,goalStates,driftSequence, trialCal);
    }


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
const initState = [7,5]
const goalstates = [[1,2],[1,8]]

var gridMatrixList = [initgridMatrix,initgridMatrix,initgridMatrix,initgridMatrix,initgridMatrix,initgridMatrix,initgridMatrix]
var playerStateList = [initState,initState,initState,initState,initState,initState,initState]
const goalList = [goalstates,goalstates,goalstates,goalstates,goalstates,goalstates,goalstates]
const driftSequenceList = [[1,0,0,0,0],[1,0,0,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]];
var allTrialsData = new Array();
var curTrial = 0;
var nTrials = 3;
TrialForCircle(gridMatrixList,playerStateList,goalList, driftSequenceList, curTrial);