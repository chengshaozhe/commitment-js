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

function noiseTransition(action, ifDrift) {
    let actionAfterDrift = drift(ifDrift, action);
    console.log(action);
    console.log(actionAfterDrift);
    return actionAfterDrift


function arrayEqual(arr1, arr2) {
    if (arr1.length != arr2.length) return false;
    for (var i = 0; i < arr1.length; ++i) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}
