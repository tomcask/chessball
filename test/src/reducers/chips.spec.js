import expect from 'expect'
import chipsReducer from 'src/reducers/chips'
import {TEAM_A} from 'src/constants/index.js'
import {selectChip, moveSelectedChip} from 'src/actions/chips'

describe('chipsReducer:\n', () => {
  describe('initialState:\n', () => {
    it('has 11 chips', () => {
      const initialState = chipsReducer()
      expect(initialState.length).toBe(11)
    })
    it('has 10 players and only one ball', () => {
      const initialState = chipsReducer()
      expect(initialState.filter((chip) => chip.type === 'ball').length)
        .toBe(1)
      expect(initialState.filter((chip) => chip.type === 'player').length)
        .toBe(10)
    })
  })
  describe('selectChip: \n', () => {
    it('selects a chip give its chipId', () => {
      const initialState = chipsReducer()
      const selectedPlayer = initialState.filter(
        (chip) => chip.type !== 'ball'
      )[0]
      const action = selectChip(selectedPlayer.id)
      const targetState = chipsReducer(initialState, action)
      expect(selectedPlayer.isSelected)
        .toBeFalsy()
      expect(targetState.find(({id}) => id === selectedPlayer.id).isSelected)
        .toBe(true)
    })
    it('unselects any other selected chip except the target one', () => {
      const initialState = chipsReducer()
      const players = initialState.filter(
        (chip) => chip.type !== 'ball'
      )
      const firstPlayerId = players[0].id
      const secondPlayerId = players[1].id
      const firstState = chipsReducer(
        initialState,
        selectChip(firstPlayerId)
      )
      const targetState = chipsReducer(
        firstState,
        selectChip(secondPlayerId)
      )
      expect(
        targetState.find(({id}) => id === firstPlayerId).isSelected
      ).toBeFalsy()
      expect(
        targetState.find(({id}) => id === secondPlayerId).isSelected
      ).toBe(true)
    })
  })
  describe.only('moveSelectedChip\n', () => {
    it('updates position of selectedChip when position is allowed', () => {
      const targetPlayerIndex = 2
      const stateWithSelection = createStateWithSelectedChip(targetPlayerIndex)
      const targetPosition = [1, 1]
      const action = moveSelectedChip(targetPosition)
      const targetState = chipsReducer(stateWithSelection, action)
      const targetPlayer = targetState[targetPlayerIndex]
      targetPlayer.position.forEach((position, index) => {
        expect(position).toBe(targetPosition[index])
      })
    })
    it('removes chip selection when position is occupied by another one', () => {
      const selectedPlayerIndex = 2
      const stateWithSelection = createStateWithSelectedChip(selectedPlayerIndex)
      const targetPosition = stateWithSelection[5].position // other chip position
      const action = moveSelectedChip(targetPosition)
      const targetState = chipsReducer(stateWithSelection, action)
      targetState.forEach((chip) => {
        expect(chip.isSelected).toBeFalsy()
      })
    })
    it('doesn\'t update position on non selected chips', () => {
      const stateWithSelection = createStateWithSelectedChip()
      const selectedPlayer = stateWithSelection.find(
        ({isSelected}) => isSelected
      )
      const position = [1, 1]
      const action = moveSelectedChip(position)
      const targetState = chipsReducer(stateWithSelection, action)
      targetState.forEach((chip, index) => {
        if (chip.id !== selectedPlayer.id) {
          expect(chip.position).toBe(stateWithSelection[index].position)
        }
      })
    })
    it('updates ball\'s ownership when ball has been moved', () => {
      const stateWithBallSelected = createStateWithSelectedChip(0)
      const ownedPosition = stateWithBallSelected[3].position
        .set(0, stateWithBallSelected[3].position[0] + 1)
      const targetState = chipsReducer(
        stateWithBallSelected,
        moveSelectedChip(ownedPosition)
      )
      expect(targetState[0].team).toBe(targetState[3].team)
    })
    it('updates owned positions on keepers', () => {})
    it('changes selectable chips when current ones loose the ball', () => {
      const teamWithBall = TEAM_A
      const stateWithBallOwnedByTeam1 = createStateWithBallOwnedByTeam(teamWithBall)
      .setIn([0, 'isSelected'], true)
      const neutralPosition = [7, 5] // initial ball position
      const targetState = chipsReducer(
        stateWithBallOwnedByTeam1,
        moveSelectedChip(neutralPosition)
      )
      targetState.forEach((chip) => {
        if (chip.team === TEAM_A) expect(chip.selectable).toBeFalsy()
        else expect(chip.selectable).toBe(true)
      })
    })
  })
})

function createStateWithSelectedChip (chipIndex = 2) {
  const initialState = chipsReducer()
  return initialState.setIn([chipIndex, 'isSelected'], true)
}

function createStateWithBallOwnedByTeam (teamId) {
  const initialState = chipsReducer()
  const targetChip = initialState.find(({team}) => team === teamId)
  const newBallPosition = targetChip.update('position', (pos) => {
    return pos.set(1, pos[1] + 1)
  }).position
  return initialState
    .updateIn([0], (ball) => ball.merge({position: newBallPosition, team: teamId}))
}
