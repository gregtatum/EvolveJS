/*
 * @require BehaviorManager
 */
Evo.Behavior.FleeWalls = function(actor, canvas) {
	if(Evo.Vector.is2d) {
		return new Evo.Behavior.FleeWalls2d(actor, canvas);
	} else {	
		return new Evo.Behavior.FleeWalls3d(actor, canvas);
	}
};
