
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);


// All pages to be loaded
var pages = [
	// "instructions/instruct-1.html",
	// "instructions/instruct-2.html",
	// "instructions/instruct-3.html",
	"instructions/instruct-ready.html",
	"postquestionnaire.html"
];


const init = (async () => {
    await psiTurk.preloadPages(pages);
})()

var instructionPages = [ // add as a list as many pages as you like
	// "instructions/instruct-1.html",
	// "instructions/instruct-2.html",
	// "instructions/instruct-3.html",
	"instructions/instruct-ready.html"
];

function transition(state, action) {
    let [x, y] = state;
    let nextState = [x+action[1],y+action[0]]
    return nextState
}

function isValidMove(matrix, nextState) {
    if (matrix[nextState[0]][nextState[1]] !== 1) {
        return true;
    }
    return false;
}

function isGoalReached(playerState, goalStates) {
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

function keyPress(gridMatrix,playerState,goalStates, eachTrialData, curTrial) {
    return new Promise((resolve,reject) => {
        const [x,y] = playerState
        let trialOver = false;
        let timestamp1 = new Date().getTime();

        $(document).on("keydown.task_response", (e) => {
            let action;
            if (e.keyCode >= 37 && e.keyCode <= 40)
            {
                action = DIRECTIONS[e.key].movement;
                intendNextState = transition(playerState, action)
                if (isValidMove(gridMatrix, intendNextState)) {
                    playerState = [x + action[1], y + action[0]];
                    gridMatrix = updateMatrix(gridMatrix, x, y, OBJECT.BLANK);
                    gridMatrix = updateMatrix(gridMatrix, x  + action[1], y + action[0], OBJECT.AGENT);
                }
                drawGrid(gridMatrix);
                $(document).off("keydown.task_response")
                trialOver = isGoalReached(playerState, goalStates);
            };

            //data recording
            eachTrialData.RT.push(new Date().getTime() - timestamp1);
            eachTrialData.playerPos.push(playerState);
            eachTrialData.aimAction.push(action);

            // psiTurk.recordTrialData(eachTrialData)

            if (trialOver) {
                allTrialsData[curTrial] = eachTrialData;
                reject('break');
            } else {
                resolve('done');
            }
        })
    }).then(res => keyPress(gridMatrix,playerState,goalStates,eachTrialData, curTrial)).catch(
        bre => console.log()).then(res => new Promise(resolve => {setTimeout(() => {
        resolve('done');
    }, 0)}));
}

function isExpOver(gridMatrix,playerState,goalStates, curTrial) {
    return new Promise((resolve, reject)=> {
        setTimeout(() => {
        if (curTrial < nTrials -1){
            curTrial++;
            resolve('done');
        }
        else {
        	psiTurk.recordTrialData(allTrialsData);
        	// finish();
        	end_experiment();
            reject('over');
        }
        }, 0);
    }).then(res => runExperiment(gridMatrix,playerState,goalStates, curTrial))
}


function end_experiment() {
// 	$('body').empty()
// 	$('body').append('<div id="displaydiv"></div>')

//   var end_exp_text =
// `Thank you for completing this experiment.\n
// Hitting the button below will end the experiment.`;

//   $('#displaydiv').append('<p id=text></p>');
//   $('#displaydiv').append('<button id="continue">Continue</button>');
//   $('#text').text(end_exp_text)
//   $('#text').css({'width':'85%', 'white-space':'pre-wrap'})
//   $('#continue').css('top','75%')
//   $('#continue').click(function(){
//     psiTurk.saveData({
//       success: psiTurk.completeHIT,
//       error: psiTurk.completeHIT // End despite the error
//     })
//   });
// }
	record_responses = function() {

		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('textarea').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
		$('select').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});

	};

	psiTurk.showPage('postquestionnaire.html');
	psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});

	$("#next").click(function () {
	    record_responses();
	    psiTurk.saveData({
            success: function(){
                psiTurk.computeBonus('compute_bonus', function() {
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                });
            },
            error: psiTurk.completeHIT()});
	});
}


var finish = function() {
    currentview = new Questionnaire();
};


/****************
* Questionnaire *
****************/

var Questionnaire = function() {

	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	record_responses = function() {

		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('textarea').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
		$('select').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);		
		});

	};

	prompt_resubmit = function() {
		document.body.innerHTML = error_message;
		$("#resubmit").click(resubmit);
	};

	resubmit = function() {
		document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
		reprompt = setTimeout(prompt_resubmit, 10000);
		
		psiTurk.saveData({
			success: function() {
			    clearInterval(reprompt); 
                psiTurk.computeBonus('compute_bonus', function(){
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 


			}, 
			error: prompt_resubmit
		});
	};

	// Load the questionnaire snippet 
	psiTurk.showPage('postquestionnaire.html');
	psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});
	
	$("#next").click(function () {
	    record_responses();
	    psiTurk.saveData({
            success: function(){
                psiTurk.computeBonus('compute_bonus', function() { 
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 
            }, 
            error: prompt_resubmit});
	});
    
	
};


async function runExperiment(gridMatrix, playerState, goalStates, curTrial) {

    gridMatrix[curTrial][playerState[curTrial][0]][playerState[curTrial][1]] = OBJECT.AGENT;
    goalStates[curTrial].forEach((state,i) => gridMatrix[curTrial][state[0]][state[1]] = OBJECT.GOAL);

    let eachTrialData = {
    	mapMatrix: Array(gridMatrix[curTrial]),
    	playerPos: Array(playerState[curTrial]),
    	goal1Pos: Array(goalStates[curTrial][0]),
        goal2Pos: Array(goalStates[curTrial][1]),
        aimAction: Array(),
        RT: Array()
    };

    await fixationPhase(gridMatrix[curTrial], 1000, playerState[curTrial]);
    await drawGrid(gridMatrix[curTrial]);
    let stepCount = 0;
    await keyPress(gridMatrix[curTrial], playerState[curTrial], goalStates[curTrial], eachTrialData, curTrial, stepCount);
    // await blankPhase(500,curTrial,gridMatrix[curTrial]);
    await isExpOver(gridMatrix,playerState,goalStates,curTrial)
    }

/*******************
 * Run Task
 ******************/

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
var allTrialsData = new Array();
var curTrial = 0;
var nTrials = 1;


// $(window).on('load', async () => {
//     await init;
//     psiTurk.doInstructions(
//     	instructionPages, // a list of pages you want to display in sequence
//     	function() {runExperiment(gridMatrixList,playerStateList,goalList, curTrial) }
//     );
// });


runExperiment(gridMatrixList,playerStateList,goalList, curTrial)
