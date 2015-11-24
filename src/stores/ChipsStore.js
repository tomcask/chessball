import ChessballDispatcher from '../dispatcher/ChessballDispatcher';
import _ from 'lodash';
import Rx from 'rx';

window.rx = Rx;
const positionStream = new Rx.Subject();

const chips = [{
	chipId: 0,
	kind: 'ball',
	top: 0,
	left: 0
}, {
	chipId: 1,
	kind: 'player',
	team: 0,
	top: 50,
	left: 50
}, {
	chipId: 2,
	kind: 'player',
	team: 1,
	top: 0,
	left: 50
}];

var ChipsStore = {
	getChips: function () {
		return chips
	},
	publishPosition: function () {
		positionStream.onNext(chips)
	},
	subscribePositionStream: function (cb) {
		return positionStream.subscribe(cb)
	}
};

const callbacks = {
	MOVE_CHIP: ({chipId, top, left}) => {
		let chip = _.find(chips, {chipId})
		_.assign(chip, {top, left})
		ChipsStore.publishPosition()
	}
}

ChessballDispatcher.register(({type, payload})=> callbacks[type](payload) );

export default ChipsStore;